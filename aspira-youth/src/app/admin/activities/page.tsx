"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Image as ImageIcon, Video, Trash2, Plus, Link as LinkIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

type Album = {
  id: string;
  title: string;
  coverImage: string;
  images: string[];
  createdAt: any;
  authorId: string;
};

type VideoType = {
  id: string;
  title: string;
  youtubeUrl: string;
  createdAt: any;
  authorId: string;
};

export default function ManageActivitiesPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'albums' | 'videos'>('albums');
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url: string) => {
    if (url?.includes('github.com') && url?.includes('/blob/')) {
      return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
  };

  // Album Form
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumCover, setNewAlbumCover] = useState('');
  const [isSubmittingAlbum, setIsSubmittingAlbum] = useState(false);

  // Video Form
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);

  // Add Image to Album
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);

  useEffect(() => {
    const albumsQuery = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
    const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));

    const unsubscribeAlbums = onSnapshot(albumsQuery, (snapshot) => {
      setAlbums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album)));
      setLoading(false);
    });

    const unsubscribeVideos = onSnapshot(videosQuery, (snapshot) => {
      setVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoType)));
    });

    return () => {
      unsubscribeAlbums();
      unsubscribeVideos();
    };
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim() || !newAlbumCover.trim() || !user) return;

    setIsSubmittingAlbum(true);
    try {
      await addDoc(collection(db, 'albums'), {
        title: newAlbumTitle,
        coverImage: newAlbumCover,
        images: [],
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      setNewAlbumTitle('');
      setNewAlbumCover('');
    } catch (error) {
      console.error("Error creating album:", error);
      alert("Failed to create album");
    } finally {
      setIsSubmittingAlbum(false);
    }
  };

  const handleAddImageToAlbum = async (e: React.FormEvent, albumId: string) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;

    setIsAddingImage(true);
    try {
      await updateDoc(doc(db, 'albums', albumId), {
        images: arrayUnion(newImageUrl)
      });
      setNewImageUrl('');
      setSelectedAlbumId(null);
    } catch (error) {
      console.error("Error adding image:", error);
      alert("Failed to add image to album");
    } finally {
      setIsAddingImage(false);
    }
  };

  const handleRemoveImageFromAlbum = async (albumId: string, imageUrl: string) => {
    if (!confirm("Remove this image from the album?")) return;
    try {
      await updateDoc(doc(db, 'albums', albumId), {
        images: arrayRemove(imageUrl)
      });
    } catch (error) {
      console.error("Error removing image:", error);
      alert("Failed to remove image");
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm("Are you sure you want to delete this entire album?")) return;
    try {
      await deleteDoc(doc(db, 'albums', albumId));
    } catch (error) {
      console.error("Error deleting album:", error);
      alert("Failed to delete album");
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoTitle.trim() || !newVideoUrl.trim() || !user) return;

    setIsSubmittingVideo(true);
    try {
      await addDoc(collection(db, 'videos'), {
        title: newVideoTitle,
        youtubeUrl: newVideoUrl,
        createdAt: serverTimestamp(),
        authorId: user.uid
      });
      setNewVideoTitle('');
      setNewVideoUrl('');
    } catch (error) {
      console.error("Error adding video:", error);
      alert("Failed to add video");
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await deleteDoc(doc(db, 'videos', videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Activities</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('albums')}
          className={`pb-4 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'albums' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ImageIcon className="w-5 h-5" />
          Photo Albums
        </button>
        <button 
          onClick={() => setActiveTab('videos')}
          className={`pb-4 px-2 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'videos' ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Video className="w-5 h-5" />
          YouTube Videos
        </button>
      </div>

      {activeTab === 'albums' && (
        <div className="space-y-8">
          {/* Create Album Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Create New Album</h2>
            <form onSubmit={handleCreateAlbum} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Album Title</label>
                <input 
                  type="text" 
                  required
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g. Summer Camp 2026"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image Link (URL)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="url" 
                    required
                    value={newAlbumCover}
                    onChange={(e) => setNewAlbumCover(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingAlbum}
                className="w-full md:w-auto bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmittingAlbum ? 'Creating...' : 'Create Album'}
              </button>
            </form>
          </div>

          {/* Albums List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      <img src={getImageUrl(album.coverImage)} alt={album.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{album.title}</h3>
                      <p className="text-gray-500 text-sm">{album.images?.length || 0} photos</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAlbum(album.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Album"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Add Image to Album */}
                {selectedAlbumId === album.id ? (
                  <form onSubmit={(e) => handleAddImageToAlbum(e, album.id)} className="mt-4 flex flex-col sm:flex-row gap-2">
                    <input 
                      type="url" 
                      required
                      autoFocus
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-[var(--color-primary)] outline-none"
                      placeholder="Image URL"
                    />
                    <button 
                      type="submit" 
                      disabled={isAddingImage}
                      className="w-full sm:w-auto bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setSelectedAlbumId(null); setNewImageUrl(''); }}
                      className="w-full sm:w-auto bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <button 
                    onClick={() => setSelectedAlbumId(album.id)}
                    className="mt-4 w-full border-2 border-dashed border-gray-200 text-gray-500 py-2 rounded-lg flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add Photo Link
                  </button>
                )}

                {/* Thumbnail Grid */}
                {album.images && album.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {album.images.map((img, i) => (
                      <div key={i} className="aspect-square relative rounded-lg overflow-hidden group">
                        <img src={getImageUrl(img)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => handleRemoveImageFromAlbum(album.id, img)}
                            className="text-white p-1 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {albums.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                No photo albums yet. Create one above!
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-8">
           {/* Add Video Form */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Add YouTube Video</h2>
            <form onSubmit={handleCreateVideo} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                <input 
                  type="text" 
                  required
                  value={newVideoTitle}
                  onChange={(e) => setNewVideoTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                  placeholder="e.g. Digital Skills Workshop Highlights"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="url" 
                    required
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isSubmittingVideo}
                className="w-full md:w-auto bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {isSubmittingVideo ? 'Adding...' : 'Add Video'}
              </button>
            </form>
          </div>

          {/* Videos List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.map((video) => {
              const ytId = extractYoutubeId(video.youtubeUrl);
              return (
                <div key={video.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-full sm:w-48 aspect-video relative rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {ytId ? (
                      <img 
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} 
                        alt={video.title} 
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">Invalid URL</div>
                    )}
                  </div>
                  <div className="flex-1 w-full flex flex-col justify-between h-full min-h-[90px]">
                    <div>
                      <h3 className="font-bold text-[var(--color-dark)] line-clamp-2 leading-snug">{video.title}</h3>
                      <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline break-all mt-1 inline-block line-clamp-1">
                        {video.youtubeUrl}
                      </a>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button 
                        onClick={() => handleDeleteVideo(video.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {videos.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                No videos added yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
