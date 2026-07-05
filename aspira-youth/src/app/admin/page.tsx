"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer } from 'firebase/firestore';
import { FileText, Image as ImageIcon, Users, MessageSquare } from 'lucide-react';
import { primaryAdminEmails } from '@/lib/admin';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    blogs: 0,
    activities: 0,
    forums: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const blogsSnap = await getCountFromServer(collection(db, 'blogs'));
        const albumsSnap = await getCountFromServer(collection(db, 'albums'));
        const videosSnap = await getCountFromServer(collection(db, 'videos'));
        const forumsSnap = await getCountFromServer(collection(db, 'forums'));
        const adminsSnap = await getCountFromServer(collection(db, 'admins'));

        setStats({
          blogs: blogsSnap.data().count,
          activities: albumsSnap.data().count + videosSnap.data().count,
          forums: forumsSnap.data().count,
          admins: adminsSnap.data().count + primaryAdminEmails.length
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Blog Posts', value: stats.blogs, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Activities', value: stats.activities, icon: ImageIcon, color: 'text-green-500', bg: 'bg-green-50' },
    { title: 'Forum Discussions', value: stats.forums, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
    { title: 'Admin Users', value: stats.admins, icon: Users, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-32 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-500 font-medium text-sm mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to Aspira Youth Admin</h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Use the sidebar on the left to navigate through different management sections. You can create new blog posts, upload activities, and manage admin access for other team members.
        </p>
      </div>
    </div>
  );
}
