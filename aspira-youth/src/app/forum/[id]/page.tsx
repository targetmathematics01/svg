"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, ThumbsUp, MoreHorizontal, Share2, Flag, User, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, increment, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

type TimestampLike = {
  toDate: () => Date;
};

type ForumPost = {
  id: string;
  title?: string;
  content?: string;
  category?: string;
  author?: string;
  authorInitial?: string;
  avatarColor?: string;
  likes?: number;
  comments?: number;
  createdAt?: TimestampLike;
};

type ForumComment = {
  id: string;
  content?: string;
  author?: string;
  authorInitial?: string;
  avatarColor?: string;
  authorId?: string;
  likes?: number;
  createdAt?: TimestampLike;
};

export default function ForumPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const { user } = useAuth();
  const isAdmin = user && (user.email === 'thureinminn@gmail.com' || user.email === 'thureinminnn2026@gmail.com');

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch Post
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "forums", postId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...(docSnap.data() as Omit<ForumPost, 'id'>) });
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();

    // Fetch Comments realtime
    const q = query(collection(db, `forums/${postId}/comments`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comms = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ForumComment, 'id'>)
      }));
      setComments(comms);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    if (!user) {
      alert("Please sign in to post a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Add comment to subcollection
      await addDoc(collection(db, `forums/${postId}/comments`), {
        content: newComment,
        author: user.displayName || "Anonymous User",
        authorInitial: user.displayName ? user.displayName.charAt(0).toUpperCase() : "A",
        avatarColor: "bg-green-500",
        authorId: user.uid,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      
      // Update comment count on post
      const postRef = doc(db, "forums", postId);
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
      await deleteDoc(doc(db, `forums/${postId}/comments`, commentId));
      const postRef = doc(db, "forums", postId);
      await updateDoc(postRef, {
        comments: increment(-1)
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment");
    }
  };

  const handleLikePost = async () => {
    try {
      const postRef = doc(db, "forums", postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
      setPost((prev) => prev ? ({ ...prev, likes: (prev.likes || 0) + 1 }) : prev);
    } catch (error) {
      console.error("Error liking post:", error);
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

  if (loading && !post) {
    return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">Loading discussion...</div>;
  }

  if (!post) {
    return <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">Discussion not found!</div>;
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-24 pt-8">
      <div className="container-custom max-w-4xl">
        
        {/* Back button */}
        <Link href="/forum" className="inline-flex items-center gap-2 text-gray-500 hover:text-[var(--color-primary)] transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Discussions
        </Link>

        {/* Main Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${post.avatarColor || 'bg-blue-500'}`}>
                  {post.authorInitial || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-[var(--color-dark)]">{post.author || 'Anonymous'}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatTime(post.createdAt)}</span>
                    <span>•</span>
                    <span className="text-[var(--color-primary)] font-medium">{post.category}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-dark)] mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="prose prose-lg max-w-none text-gray-600 mb-8 whitespace-pre-line">
              {post.content}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <button onClick={handleLikePost} className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors font-medium">
                  <ThumbsUp className="w-5 h-5" />
                  <span>{post.likes || 0} Likes</span>
                </button>
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                  <MessageSquare className="w-5 h-5" />
                  <span>{post.comments || 0} Comments</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5 text-sm font-medium">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-sm font-medium">
                  <Flag className="w-4 h-4" /> Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-[var(--color-dark)] mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--color-secondary)]" />
            Comments ({comments.length})
          </h3>
          
          {/* Add Comment Input */}
          {!user ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mb-8">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Join the conversation</h4>
              <p className="text-gray-500 mb-4">Please sign in to reply to this discussion.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] resize-none transition-all placeholder-gray-400"
                  rows={3}
                  placeholder="Write a comment or answer..."
                ></textarea>
                <div className="flex justify-end mt-3">
                  <button 
                    onClick={handleAddComment}
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${comment.avatarColor || 'bg-gray-500'}`}>
                    {comment.authorInitial || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-[var(--color-dark)] text-sm">{comment.author || 'Anonymous'}</h4>
                        <span className="text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {(isAdmin || (user && user.uid === comment.authorId)) && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            title="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-xs font-medium">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button className="text-gray-500 hover:text-gray-800 transition-colors text-xs font-medium">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
