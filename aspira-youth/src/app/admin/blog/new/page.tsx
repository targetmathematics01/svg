"use client";

import { useState, useEffect, useRef, useCallback, useMemo, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import {
  createBlogImageHtml,
  createPendingBlogImage,
  revokePendingBlogImages,
  uploadPendingBlogImages,
  type PendingBlogImage,
} from '@/lib/blogImages';
import type ReactQuillClass from 'react-quill-new';

type ReactQuillProps = React.ComponentProps<typeof ReactQuillClass>;
type ReactQuillRef = ReactQuillClass;

const ReactQuill = dynamic(
  async () => {
    const { default: RQ, Quill } = await import('react-quill-new');
    
    // Allow blob: URLs for instant pending image previews
    const Image = Quill.import('formats/image') as any;
    Image.sanitize = function(url: string) {
      if (/^https?:\/\//.test(url) || /^data:image\//.test(url) || /^blob:http/.test(url)) {
        return url;
      }
      return '//:0';
    };
    Quill.register(Image, true);

    const ForwardedQuill = forwardRef<any, any>((props, ref) => <RQ ref={ref} {...props} />);
    ForwardedQuill.displayName = 'ForwardedQuill';
    return ForwardedQuill;
  },
  { ssr: false }
);

export default function CreateBlogPost() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const pendingImagesRef = useRef<PendingBlogImage[]>([]);

  useEffect(() => {
    return () => revokePendingBlogImages(pendingImagesRef.current);
  }, []);

  useEffect(() => {
    // Basic protection
    if (!isAdmin && user) {
      router.push('/');
    }
  }, [user, isAdmin, router]);

  const getUploadErrorMessage = (error: unknown) => (
    error instanceof Error ? error.message : 'Failed to prepare image.'
  );

  const addPendingImage = useCallback(async (file: File) => {
    const pendingImage = await createPendingBlogImage(file);
    pendingImagesRef.current = [...pendingImagesRef.current, pendingImage];
    return pendingImage.localUrl;
  }, []);

  const clearPendingImages = useCallback(() => {
    revokePendingBlogImages(pendingImagesRef.current);
    pendingImagesRef.current = [];
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const localImageUrl = await addPendingImage(file);
      const imgTag = createBlogImageHtml(localImageUrl);
      
      const textarea = document.getElementById('html-editor-textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = content.substring(0, start) + imgTag + content.substring(end);
        setContent(newContent);
        
        // Reset selection (timeout needed for react state update)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + imgTag.length;
          textarea.focus();
        }, 0);
      } else {
        setContent(prev => prev + imgTag);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to prepare image: " + getUploadErrorMessage(error));
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const reactQuillRef = useRef<ReactQuillRef | null>(null);

  const imageHandler = useCallback(() => {
    const url = prompt("ပုံရဲ့ Link (URL) ကို ထည့်ပါ:\n(သင့်ကွန်ပျူတာမှ ပုံတင်လိုပါက ဘာမှမရေးဘဲ OK ကို နှိပ်ပါ)");
    
    if (url === null) return; // User cancelled

    if (url.trim() !== "") {
      const quill = reactQuillRef.current?.getEditor?.();
      if (quill) {
        const range = quill.getSelection(true);
        const index = range ? range.index : quill.getLength();
        quill.insertEmbed(index, 'image', url.trim());
        quill.setSelection(index + 1, 0, 'silent');
        setContent(quill.root.innerHTML);
      } else {
        setContent(prev => prev + createBlogImageHtml(url.trim()));
      }
      return;
    }

    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = async () => {
      document.body.removeChild(input);
      const file = input.files?.[0];
      if (!file) return;

      setIsUploadingImage(true);
      try {
        const localImageUrl = await addPendingImage(file);

        const quill = reactQuillRef.current?.getEditor?.();
        if (quill) {
          const range = quill.getSelection(true);
          const index = range ? range.index : quill.getLength();
          quill.insertEmbed(index, 'image', localImageUrl);
          quill.setSelection(index + 1, 0, 'silent');
          setContent(quill.root.innerHTML);
        } else {
          setContent(prev => prev + createBlogImageHtml(localImageUrl));
        }
      } catch (error: any) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image: " + (error.message || JSON.stringify(error)));
      } finally {
        setIsUploadingImage(false);
      }
    };
    
    input.click();
  }, [addPendingImage]);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
        [{ 'size': [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  // Handle submit...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage) {
      alert("Please wait for the image to finish processing.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("Title and content are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const contentWithUploadedImages = await uploadPendingBlogImages(
        content,
        pendingImagesRef.current,
        user?.uid
      );
      setContent(contentWithUploadedImages);
      clearPendingImages();

      await addDoc(collection(db, "blogs"), {
        title,
        content: contentWithUploadedImages,
        coverImage,
        author: user?.displayName || "Admin",
        authorPhoto: user?.photoURL || "",
        createdAt: serverTimestamp(),
        comments: 0
      });
      
      router.push('/admin/blog');
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      alert("Failed to create blog post: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-8">
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Blog Admin
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingImage}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isUploadingImage ? 'Preparing image...' : isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>

        <form className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blog Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all text-lg font-medium text-gray-900"
              placeholder="e.g. 10 Ways to Empower Youth..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL (Optional)
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Main Content *
              </label>
              <div className="flex gap-4 items-center">
                {isHtmlMode && (
                  <div>
                    <input 
                      type="file" 
                      id="html-image-upload" 
                      accept="image/png,image/jpeg,image/webp,image/gif" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                      disabled={isUploadingImage}
                    />
                    <label 
                      htmlFor="html-image-upload" 
                      className={`cursor-pointer text-xs font-medium bg-gray-100 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1.5 ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      {isUploadingImage ? 'Preparing...' : 'Insert Image'}
                    </label>
                  </div>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsHtmlMode(!isHtmlMode)}
                  className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  {isHtmlMode ? "Switch to WYSIWYG Editor" : "Switch to HTML Editor"}
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden relative">
              {isHtmlMode ? (
                <textarea
                  id="html-editor-textarea"
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-4 font-mono text-sm min-h-[400px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="<p>Write your raw HTML here...</p>"
                />
              ) : (
                <>
                  <ReactQuill 
                    ref={reactQuillRef}
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    className="h-[400px] border-none"
                    modules={modules}
                  />
                  {isUploadingImage && (
                    <div className="absolute right-4 top-4 z-10 rounded-md bg-white/95 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm border border-gray-200">
                      Preparing image...
                    </div>
                  )}
                  {/* Add extra padding at the bottom so the quill editor doesn't overlap the container bounds since it has a fixed height */}
                  <div className="h-12"></div>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
