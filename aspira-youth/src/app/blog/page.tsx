"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { FileText, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

type TimestampLike = {
  toDate: () => Date;
};

type BlogSummary = {
  id: string;
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  author?: string;
  authorPhoto?: string;
  createdAt?: TimestampLike;
};

export default function BlogPage() {
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-medium text-sm mb-4">
            <FileText className="w-4 h-4" />
            Our Blog
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Latest Insights & Stories</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Read about our latest activities, youth development insights, and stories from the community.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse"></div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">We are preparing some great content. Check back later!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {blogs.map((blog) => {
              const plainText = blog.content ? blog.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') : '';
              const excerpt = blog.excerpt || (plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText);

              return (
                <Link key={blog.id} href={`/blog/${blog.id}`} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row h-auto md:h-64">
                  {/* Image */}
                  <div className="h-64 md:h-full md:w-2/5 bg-gray-100 overflow-hidden relative flex-shrink-0">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt={blog.title || 'Blog cover'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                        <FileText className="w-16 h-16" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium mb-3">
                      <Calendar className="w-4 h-4" />
                      {blog.createdAt ? format(blog.createdAt.toDate(), 'MMMM d, yyyy') : 'Draft'}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 line-clamp-3 mb-6 flex-1 text-base leading-relaxed">
                      {excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        {blog.authorPhoto ? (
                          <img src={blog.authorPhoto} alt={blog.author || 'Author'} className="w-8 h-8 rounded-full border border-gray-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                            {blog.author?.[0] || 'A'}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-gray-900">{blog.author}</span>
                      </div>
                      <span className="text-[var(--color-primary)] font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
