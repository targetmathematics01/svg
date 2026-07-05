import imageCompression from 'browser-image-compression';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const MAX_COMPRESSED_SIZE_MB = 5;
const MAX_IMAGE_DIMENSION = 2560;
const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);
const COMPRESSIBLE_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const extensionByType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const getSafeFileName = (file: File) => {
  const originalName = file.name || 'blog-image';
  const extension = extensionByType[file.type] || originalName.split('.').pop() || 'jpg';
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'blog-image';

  return `${Date.now()}-${crypto.randomUUID()}-${baseName}.${extension}`;
};

export type PendingBlogImage = {
  file: File;
  localUrl: string;
};

export const prepareBlogImageForUpload = async (file: File) => {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Please upload a JPG, PNG, WebP, or GIF image.');
  }

  // Skip compression for non-compressible types or if the file is already under 1.5MB to preserve crispness
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type) || file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  const compressedFile = await imageCompression(file, {
    maxSizeMB: MAX_COMPRESSED_SIZE_MB,
    maxWidthOrHeight: MAX_IMAGE_DIMENSION,
    useWebWorker: true,
    fileType: file.type,
    // By removing initialQuality, we allow the library to intelligently decide
    // the best quality level without blindly forcing an 85% downgrade.
  });

  return compressedFile.size < file.size ? compressedFile : file;
};

export const createPendingBlogImage = async (file: File): Promise<PendingBlogImage> => {
  const preparedFile = await prepareBlogImageForUpload(file);

  return {
    file: preparedFile,
    localUrl: URL.createObjectURL(preparedFile),
  };
};

export const uploadPreparedBlogImage = async (file: File, userId?: string) => {
  if (!userId) {
    throw new Error('Please sign in again before uploading images.');
  }

  const storageRef = ref(storage, `blog_images/${userId}/${getSafeFileName(file)}`);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name || 'blog-image',
      uploadedBy: userId,
    },
  });

  return getDownloadURL(snapshot.ref);
};

export const uploadBlogImage = async (file: File, userId?: string) => {
  const preparedFile = await prepareBlogImageForUpload(file);
  return uploadPreparedBlogImage(preparedFile, userId);
};

export const uploadPendingBlogImages = async (
  html: string,
  pendingImages: PendingBlogImage[],
  userId?: string
) => {
  let nextHtml = html;

  for (const image of pendingImages) {
    if (!nextHtml.includes(image.localUrl)) {
      continue;
    }

    const downloadURL = await uploadPreparedBlogImage(image.file, userId);
    nextHtml = nextHtml.split(image.localUrl).join(downloadURL);
  }

  return nextHtml;
};

export const revokePendingBlogImages = (pendingImages: PendingBlogImage[]) => {
  pendingImages.forEach((image) => URL.revokeObjectURL(image.localUrl));
};

export const createBlogImageHtml = (imageUrl: string) => (
  `\n<figure class="my-6"><img src="${imageUrl}" alt="Uploaded image" class="w-full rounded-xl" /></figure>\n`
);
