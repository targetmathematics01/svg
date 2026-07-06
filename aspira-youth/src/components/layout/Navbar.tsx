"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, LogOut, UserCircle, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, signInWithGoogle, logout, loading } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname?.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-custom py-2 flex items-center justify-between">
        <Link href="/" className="relative block overflow-hidden h-12 w-48 flex-shrink-0">
          <Image src="/logo.png" alt="Aspira Youth Logo" width={192} height={64} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-auto max-w-none" priority />
        </Link>
        <nav className="hidden md:flex items-center gap-6 font-bold text-[var(--color-dark)]">
          <Link href="/" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/") ? "text-[var(--color-primary)]" : ""}`}>Home</Link>
          <Link href="/blog" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/blog") ? "text-[var(--color-primary)]" : ""}`}>Blog</Link>

          <Link href="/activities" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/activities") ? "text-[var(--color-primary)]" : ""}`}>Activities</Link>
          <Link href="/forum" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/forum") ? "text-[var(--color-primary)]" : ""}`}>Forum</Link>
          <Link href="/team" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/team") ? "text-[var(--color-primary)]" : ""}`}>Our Team</Link>
        </nav>
        <div className="flex items-center gap-4">
          
          {/* Auth Section */}
          <div className="hidden md:flex items-center border-l pl-4 ml-2">
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full border border-gray-200" />
                    ) : (
                      <UserCircle className="w-8 h-8 text-gray-400" />
                    )}
                    <span className="text-sm font-semibold text-gray-700 hidden lg:block">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Log out">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <UserCircle className="w-4 h-4" /> Sign In
                </button>
              )
            )}
          </div>

        </div>
        
        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:text-gray-900 ml-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg pb-4">
          <nav className="flex flex-col py-4 px-6 gap-4 font-bold text-[var(--color-dark)] text-lg">
            <Link href="/" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/") ? "text-[var(--color-primary)]" : ""}`}>Home</Link>
            <Link href="/blog" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/blog") ? "text-[var(--color-primary)]" : ""}`}>Blog</Link>
            <Link href="/activities" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/activities") ? "text-[var(--color-primary)]" : ""}`}>Activities</Link>
            <Link href="/forum" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/forum") ? "text-[var(--color-primary)]" : ""}`}>Forum</Link>
            <Link href="/team" className={`hover:text-[var(--color-primary)] transition-colors ${isActive("/team") ? "text-[var(--color-primary)]" : ""}`}>Our Team</Link>
            
            {/* Mobile Auth Section */}
            <div className="border-t border-gray-100 pt-4 mt-2">
              {!loading && (
                user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || "User"} className="w-10 h-10 rounded-full border border-gray-200" />
                      ) : (
                        <UserCircle className="w-10 h-10 text-gray-400" />
                      )}
                      <span className="text-base font-semibold text-gray-700">{user.displayName}</span>
                    </div>
                    <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-2" title="Log out">
                      <LogOut className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={signInWithGoogle}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg text-base font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <UserCircle className="w-5 h-5" /> Sign In
                  </button>
                )
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
