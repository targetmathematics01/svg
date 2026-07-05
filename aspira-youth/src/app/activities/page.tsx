"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, Video, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

type Album = {
  id: string;
  title: string;
  coverImage: string;
  images: string[];
  createdAt: any;
};

type VideoType = {
  id: string;
  title: string;
  youtubeUrl: string;
  createdAt: any;
};

const AlbumCarousel = ({ album }: { album: Album }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (url: string) => {
    if (url?.includes('github.com') && url?.includes('/blob/')) {
      return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
  };

  const images = [album.coverImage, ...(album.images || [])];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-3">{album.title}</h3>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> {images.length} photos
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {formatDate(album.createdAt)}
          </span>
        </div>
      </div>
      
      <div className="w-full">
        {/* Main Carousel View */}
        <div className="relative aspect-video bg-black/5 rounded-2xl overflow-hidden flex items-center justify-center group shadow-sm border border-gray-100">
          <style>{`
            @keyframes smoothFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <img 
            key={currentIndex}
            src={getImageUrl(images[currentIndex])} 
            alt={`${album.title} photo ${currentIndex + 1}`} 
            className="absolute inset-0 w-full h-full object-contain"
            style={{ animation: 'smoothFade 0.6s ease-in-out' }}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="flex gap-4 mt-6 overflow-x-auto pb-4 px-2 snap-x hide-scrollbar">
            {images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all snap-center ${currentIndex === idx ? 'border-[var(--color-primary)] opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={getImageUrl(img)} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ActivitiesPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url: string) => {
    if (url?.includes('github.com') && url?.includes('/blob/')) {
      return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
    }
    return url;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const albumsQuery = query(collection(db, 'albums'), orderBy('createdAt', 'desc'));
        const videosQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));

        const [albumsSnap, videosSnap] = await Promise.all([
          getDocs(albumsQuery),
          getDocs(videosQuery)
        ]);

        setAlbums(albumsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Album)));
        setVideos(videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoType)));
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 pt-16 pb-12">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-dark)] mb-4">Our Activities</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Explore our latest events, workshops, and community initiatives through our photo gallery and videos.
          </p>
        </div>
      </div>

      <div className="container-custom mt-12 space-y-20">
        
        {/* Photo Albums Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-[var(--color-primary)] flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-dark)]">Photo Gallery</h2>
          </div>

          {albums.length > 0 ? (
            <div className="flex flex-col gap-12">
              {albums.map((album) => (
                <AlbumCarousel key={album.id} album={album} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed text-gray-500">
               No photo albums available yet.
             </div>
          )}
        </section>

        {/* Videos Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-dark)]">Videos</h2>
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {videos.map((video) => {
                const ytId = extractYoutubeId(video.youtubeUrl);
                return (
                  <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    {ytId ? (
                      <div className="aspect-video relative bg-black">
                        <iframe 
                          src={`https://www.youtube.com/embed/${ytId}`} 
                          title={video.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center bg-gray-100 text-gray-400">
                        Invalid Video URL
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[var(--color-dark)] mb-2 line-clamp-2">{video.title}</h3>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {formatDate(video.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed text-gray-500">
              No videos available yet.
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
