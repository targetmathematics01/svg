"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, deleteDoc, doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Mail, Briefcase, RefreshCw } from 'lucide-react';
import { TeamMember } from '@/types/team';
import { teamMembers as staticMembers } from '@/data/team'; // Temporary import for seeding

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'teamMembers'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const membersData: TeamMember[] = [];
      snapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() } as TeamMember);
      });
      setMembers(membersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        await deleteDoc(doc(db, 'teamMembers', id));
      } catch (error) {
        console.error("Error deleting member: ", error);
        alert("Failed to delete member.");
      }
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      for (const member of staticMembers) {
        // Use the same id from static data so it matches
        await setDoc(doc(db, 'teamMembers', member.id), member);
      }
      alert('Data seeded successfully!');
    } catch (error) {
      console.error("Error seeding data:", error);
      alert('Failed to seed data.');
    } finally {
      setIsSeeding(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading team members...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Team</h1>
          <p className="text-gray-500 text-sm mt-1">Add, edit, or remove team members.</p>
        </div>
        <div className="flex gap-3">
          {members.length === 0 && (
            <button 
              onClick={handleSeed}
              disabled={isSeeding}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${isSeeding ? 'animate-spin' : ''}`} />
              {isSeeding ? 'Seeding...' : 'Seed Initial Data'}
            </button>
          )}
          <Link 
            href="/admin/team/new" 
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Member
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No team members found. Click "Seed Initial Data" or add a new one.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          <Image 
                            src={member.image || '/placeholder-user.jpg'} 
                            alt={member.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{member.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{member.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/team/edit/${member.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
