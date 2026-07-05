"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Users, Search, Plus, ThumbsUp, MessageCircle, Clock, Tag, X, Trash2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

const categories = ["All Discussions", "General", "Education & Digital Literacy", "Opportunities", "Q&A"];

type TimestampLike = {
  toDate: () => Date;
};

type Discussion = {
  id: string;
  title?: string;
  content?: string;
  category?: string;
  author?: string;
  authorInitial?: string;
  avatarColor?: string;
  authorId?: string;
  likes?: number;
  comments?: number;
  createdAt?: TimestampLike;
};

export default function ForumPage() {
  const { user } = useAuth();
  const isAdmin = user && (user.email === 'thureinminn@gmail.com' || user.email === 'thureinminnn2026@gmail.com');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "forums"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Discussion, 'id'>)
      }));
      setDiscussions(posts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    if (!user) {
      alert("Please sign in to create a discussion.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "forums"), {
        title: newTitle,
        content: newContent,
        category: newCategory,
        author: user.displayName || "Anonymous User",
        authorInitial: user.displayName ? user.displayName.charAt(0).toUpperCase() : "A",
        avatarColor: "bg-[var(--color-primary)]",
        authorId: user.uid,
        likes: 0,
        comments: 0,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewCategory("General");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.preventDefault(); // Prevent navigating to the thread page
    if (!confirm("Are you sure you want to delete this discussion?")) return;
    try {
      await deleteDoc(doc(db, "forums", threadId));
    } catch (error) {
      console.error("Error deleting thread:", error);
      alert("Failed to delete discussion");
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

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-24 relative">
      {/* Forum Hero Section */}
      <section className="bg-white border-b">
        <div className="container-custom py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-dark)] flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-[var(--color-primary)]" />
              Community Forum
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Ask questions, share opportunities, and connect with other Aspira Youth members.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-4 border border-gray-200 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm shadow-sm transition-shadow hover:shadow-md"
                placeholder="Search discussions, topics, or questions..."
              />
              <button className="absolute inset-y-2 right-2 bg-[var(--color-primary)] text-white px-6 rounded-full font-medium hover:bg-orange-600 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Forum Content */}
      <section className="container-custom py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar / Categories */}
          <div className="w-full lg:w-1/4">
            <button
              onClick={() => {
                if (!user) {
                  alert("Please sign in to start a new discussion.");
                  return;
                }
                setIsModalOpen(true);
              }}
              className="w-full bg-[var(--color-primary)] text-white flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold mb-8 hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 duration-200"
            >
              <Plus className="w-5 h-5" />
              New Discussion
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4 text-[var(--color-dark)] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[var(--color-secondary)]" />
                Categories
              </h3>
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li key={index}>
                    <button className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors ${index === 0 ? 'bg-orange-50 text-[var(--color-primary)] font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-[var(--color-dark)]'}`}>
                      {category}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 text-gray-600 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">1,245 Members</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MessageCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{discussions.length} Posts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discussion Feed */}
          <div className="w-full lg:w-3/4 space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xl font-bold text-[var(--color-dark)]">Recent Discussions</h2>
              <select className="bg-transparent text-gray-500 font-medium focus:outline-none cursor-pointer">
                <option>Latest</option>
                <option>Top Voted</option>
                <option>Unanswered</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading discussions...</div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No discussions yet</h3>
                <p className="text-gray-500">Be the first to start a conversation!</p>
              </div>
            ) : (
              discussions.map((post) => (
                <Link href={`/forum/${post.id}`} key={post.id} className="block group">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all duration-200 transform group-hover:-translate-y-1">

                    {/* Post Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${post.avatarColor || 'bg-gray-500'}`}>
                        {post.authorInitial || 'U'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[var(--color-dark)] text-sm">{post.author || 'Anonymous'}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(post.createdAt)}</span>
                          <span>•</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{post.category}</span>
                        </div>
                      </div>
                      {(isAdmin || (user && user.uid === post.authorId)) && (
                        <button
                          onClick={(e) => handleDeleteThread(e, post.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Delete discussion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Post Title & Snippet */}
                    <h3 className="text-xl font-bold text-[var(--color-dark)] group-hover:text-[var(--color-primary)] transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.content}
                    </p>

                    {/* Post Footer/Stats */}
                    <div className="flex items-center gap-6 text-gray-500 text-sm">
                      <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-medium">{post.likes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 hover:text-[var(--color-primary)] transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-medium">{post.comments || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Create Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--color-dark)] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[var(--color-primary)]" />
                Create New Discussion
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-shadow"
                  placeholder="What is your discussion about?"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-shadow"
                >
                  {categories.filter(c => c !== "All Discussions").map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-shadow resize-none"
                  rows={6}
                  placeholder="Provide more details to help others understand..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? 'Posting...' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
