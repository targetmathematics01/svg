"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import imageCompression from 'browser-image-compression';

export default function EditTeamMemberPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: '',
    bio: '',
    skills: '', 
    education: '',
    email: ''
  });

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const docRef = doc(db, 'teamMembers', params.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || '',
            role: data.role || '',
            image: data.image || '',
            bio: data.bio || '',
            skills: (data.skills || []).join(', '),
            education: data.education || '',
            email: data.email || ''
          });
        } else {
          setError("Member not found.");
        }
      } catch (err) {
        console.error("Error fetching member:", err);
        setError("Failed to load team member data.");
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true
      };
      
      const compressedFile = await imageCompression(file, options);
      const filename = `team_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `team/${filename}`);
      
      await uploadBytes(storageRef, compressedFile);
      const downloadURL = await getDownloadURL(storageRef);
      
      setFormData(prev => ({ ...prev, image: downloadURL }));
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
      
      const updatedMember = {
        name: formData.name,
        role: formData.role,
        image: formData.image,
        bio: formData.bio,
        skills: skillsArray,
        education: formData.education,
        email: formData.email
      };

      await updateDoc(doc(db, 'teamMembers', params.id), updatedMember);
      router.push('/admin/team');
    } catch (err) {
      console.error("Error updating member:", err);
      setError("Failed to update team member.");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading member data...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/team" className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-[var(--color-primary)] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Team Member</h1>
          <p className="text-gray-500 text-sm">Update member details.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Full Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Role *</label>
            <input 
              type="text" 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Education</label>
            <input 
              type="text" 
              name="education" 
              value={formData.education} 
              onChange={handleChange} 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Image</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <input 
                type="text" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                placeholder="Paste image URL here..."
              />
            </div>
            <div className="text-gray-400 font-medium text-sm">OR</div>
            <div className="relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 font-medium transition-colors ${uploading ? 'opacity-70' : 'hover:bg-gray-100'}`}>
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload File'}
              </div>
            </div>
          </div>
          {formData.image && (
            <div className="mt-4 relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Bio</label>
          <textarea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Skills (Comma-separated)</label>
          <input 
            type="text" 
            name="skills" 
            value={formData.skills} 
            onChange={handleChange} 
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-colors disabled:opacity-70 shadow-sm"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
