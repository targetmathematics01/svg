import Image from "next/image";
import Link from "next/link";
import { db } from '@/lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { TeamMember } from '@/types/team';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function TeamPage() {
  const q = query(collection(db, 'teamMembers'));
  const snapshot = await getDocs(q);
  
  const teamMembers: TeamMember[] = [];
  snapshot.forEach((doc) => {
    teamMembers.push({ id: doc.id, ...doc.data() } as TeamMember);
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="bg-[var(--color-primary)] py-16 text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl md:text-5xl font-heading mb-4 text-white">Our Dedicated Team</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Meet the passionate individuals working behind the scenes to empower the next generation.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-padding bg-[var(--color-light)]">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teamMembers.map((member) => (
              <Link href={`/team/${member.id}`} key={member.id} className="group">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-b-4 border-transparent hover:border-[var(--color-secondary)] h-full flex flex-col">
                  <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center">
                    {member.image ? (
                      <Image 
                        src={member.image} 
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-6 text-center flex-grow flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-[var(--color-dark)] mb-2">{member.name}</h3>
                    <p className="text-[var(--color-primary)] font-semibold">{member.role}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
