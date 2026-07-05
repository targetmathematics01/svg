"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { FileText, Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

type TimestampLike = {
  toDate: () => Date;
};

type BlogSummary = {
  id: string;
  title?: string;
  coverImage?: string;
  author?: string;
  createdAt?: TimestampLike;
};

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<BlogSummary, 'id'>)
      }));
      setBlogs(blogList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteDoc(doc(db, "blogs", id));
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog post.");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Blog</h1>
            <p className="text-gray-500">Create, edit, and manage blog posts</p>
          </div>
        </div>
        <Link 
          href="/admin/blog/new"
          className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading blog posts...</div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <FileText className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-500 mb-6">Create your first blog post to share news with your community.</p>
            <Link 
              href="/admin/blog/new"
              className="text-[var(--color-primary)] font-medium hover:underline"
            >
              Create Post &rarr;
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {blogs.map((blog) => (
              <div key={blog.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex gap-4 items-center">
                  {blog.coverImage ? (
                    <img src={blog.coverImage} alt={blog.title || 'Blog cover'} className="w-24 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">{blog.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{blog.author}</span>
                      <span>•</span>
                      <span>{blog.createdAt ? format(blog.createdAt.toDate(), 'MMM d, yyyy') : 'Draft'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/blog/${blog.id}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors bg-white rounded-lg border border-gray-200 hover:border-blue-200"
                    title="View Public Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/admin/blog/edit/${blog.id}`}
                    className="p-2 text-gray-400 hover:text-green-500 transition-colors bg-white rounded-lg border border-gray-200 hover:border-green-200"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(blog.id, blog.title || 'Untitled post')}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-lg border border-gray-200 hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
