"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { LayoutDashboard, FileText, Image as ImageIcon, Users, LogOut, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Admin Dashboard...</div>;
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  const menuItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/blog', icon: FileText, label: 'Manage Blog' },
    { href: '/admin/activities', icon: ImageIcon, label: 'Manage Activities' },
    { href: '/admin/team', icon: Users, label: 'Manage Team' },
    { href: '/admin/users', icon: Users, label: 'Manage Admins' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[var(--color-primary)]">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-[var(--color-primary)] rounded-xl transition-colors font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-800 transition-colors font-medium w-full">
            <ArrowLeft className="w-5 h-5" />
            Back to Website
          </Link>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors font-medium w-full rounded-xl"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
