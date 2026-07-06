"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { UserPlus, Shield, Trash2, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isPrimaryAdminEmail, primaryAdminEmails } from '@/lib/admin';

type AdminUser = {
  email: string;
  addedBy?: string;
};

export default function ManageAdminsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "admins"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const adminList = snapshot.docs.map(docSnap => ({
        email: docSnap.id,
        ...(docSnap.data() as Omit<AdminUser, 'email'>)
      }));
      setAdmins(adminList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newAdminEmail.trim().toLowerCase();
    if (!email) return;

    if (isPrimaryAdminEmail(email)) {
      alert("This is the primary admin. They already have access.");
      setNewAdminEmail("");
      return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(doc(db, "admins", email), {
        addedBy: user?.email || "Unknown",
        createdAt: serverTimestamp(),
      });
      setNewAdminEmail("");
    } catch (error) {
      console.error("Error adding admin:", error);
      alert("Failed to add admin. Check permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (email: string) => {
    if (confirm(`Are you sure you want to revoke admin access for ${email}?`)) {
      try {
        await deleteDoc(doc(db, "admins", email));
      } catch (error) {
        console.error("Error removing admin:", error);
        alert("Failed to remove admin.");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Admins</h1>
          <p className="text-gray-500">Add or remove administrator access for your team</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-[var(--color-primary)]" />
          Add New Admin
        </h3>
        <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4 sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                className="pl-10 w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all"
                placeholder="colleague@gmail.com"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !newAdminEmail.trim()}
            className="w-full sm:w-auto bg-[var(--color-dark)] text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 h-[46px]"
          >
            {isSubmitting ? 'Adding...' : 'Add Admin'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Current Admins</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading admins...</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {primaryAdminEmails.map((email) => (
              <div key={email} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                    {email.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{email}</p>
                    <p className="text-xs text-[var(--color-primary)] font-medium">Primary Admin</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Other Admins */}
            {admins.map((admin) => (
              <div key={admin.email} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold uppercase">
                    {admin.email.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{admin.email}</p>
                    <p className="text-xs text-gray-500">
                      Added by {admin.addedBy}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin.email)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  title="Remove Access"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            {admins.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No extra admins added yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
