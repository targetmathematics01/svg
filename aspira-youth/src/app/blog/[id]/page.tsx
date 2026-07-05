"use client";

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, increment, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Calendar, User, MessageSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

type TimestampLike = {
  toDate: () => Date;
};

type BlogPost = {
  id: string;
  title?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  authorPhoto?: string;
  createdAt?: TimestampLike;
};

type BlogComment = {
  id: string;
  content?: string;
  author?: string;
  authorPhoto?: string;
  authorId?: string;
  createdAt?: TimestampLike;
};

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use() for Next.js 15 compatibility
  const { id } = use(params);
  const { user } = useAuth();
  const isAdmin = user && (user.email === 'thureinminn@gmail.com' || user.email === 'thureinminnn2026@gmail.com');
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) });
        } else {
          setBlog(null);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();

    // Fetch Comments realtime
    const q = query(collection(db, `blogs/${id}/comments`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<BlogComment, 'id'>)
      }));
      setComments(comms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    if (!user) {
      alert("Please sign in to post a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add comment to subcollection
      await addDoc(collection(db, `blogs/${id}/comments`), {
        content: newComment,
        author: user.displayName || "Anonymous User",
        authorPhoto: user.photoURL || "",
        authorId: user.uid,
        createdAt: serverTimestamp(),
      });
      
      // Update comment count on post
      const postRef = doc(db, "blogs", id);
      await updateDoc(postRef, {
        comments: increment(1)
      });
      
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment: ", error);
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteDoc(doc(db, `blogs/${id}/comments`, commentId));
      const postRef = doc(db, "blogs", id);
      await updateDoc(postRef, {
        comments: increment(-1)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const formatTime = (timestamp?: TimestampLike) => {
    if (!timestamp) return "Just now";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  if (loading && !blog) {
    return (
      <div className="min-h-screen pt-24 bg-gray-50 flex justify-center">
        <div className="animate-pulse w-full max-w-3xl mt-12 space-y-6 px-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen pt-32 bg-gray-50 flex flex-col items-center px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
        <p className="text-gray-600 mb-8">The post you are looking for does not exist or has been removed.</p>
        <Link href="/blog" className="text-[var(--color-primary)] font-medium hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors font-medium mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to all posts
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          {/* Header */}
          <div className="p-8 md:p-12 text-center border-b border-gray-100">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-sm font-medium">
              <div className="flex items-center gap-2">
                {blog.authorPhoto ? (
                  <img src={blog.authorPhoto} alt={blog.author || 'Author'} className="w-8 h-8 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-gray-900">{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {blog.createdAt ? format(blog.createdAt.toDate(), 'MMMM d, yyyy') : 'Draft'}
              </div>
            </div>
          </div>
          
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="w-full max-h-[500px] overflow-hidden">
              <img src={blog.coverImage} alt={blog.title || 'Blog cover'} className="w-full h-full object-cover" />
            </div>
          )}
          
          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="prose prose-lg prose-orange max-w-none">
              <div 
                className="blog-content text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: blog.content || '' }}
              />
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[var(--color-primary)]" />
            Comments ({comments.length})
          </h3>
          
          {/* Add Comment Input */}
          {!user ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100 mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Join the conversation</h4>
              <p className="text-gray-500 mb-4">Please sign in to leave a comment on this post.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-none transition-all placeholder-gray-400"
                  rows={3}
                  placeholder="Share your thoughts on this post..."
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-[var(--color-dark)] text-white px-6 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-gray-200">
                  {comment.authorPhoto ? (
                    <img src={comment.authorPhoto} alt={comment.author || 'Comment author'} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-900">{comment.author || 'Anonymous'}</h4>
                      <span className="text-sm text-gray-400">{formatTime(comment.createdAt)}</span>
                    </div>
                    {(isAdmin || (user && user.uid === comment.authorId)) && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
