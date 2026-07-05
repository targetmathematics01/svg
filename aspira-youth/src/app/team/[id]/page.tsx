import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { teamMembers } from "@/data/team";
import { ArrowLeft, Mail, Briefcase, GraduationCap, Award } from "lucide-react";

export function generateStaticParams() {
  return teamMembers.map((member) => ({
    id: member.id,
  }));
}

export default async function TeamMemberProfile(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const member = teamMembers.find((m) => m.id === params.id);

  if (!member) {
    notFound();
  }

  return (
    <div className="bg-[var(--color-light)] min-h-screen pb-16">
      {/* Cover Photo Area */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] relative">
        <div className="container-custom h-full relative">
          <Link href="/team" className="absolute top-6 left-4 md:left-8 text-white flex items-center gap-2 hover:underline bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Team
          </Link>
        </div>
      </div>

      <div className="container-custom max-w-4xl -mt-20 md:-mt-24 relative z-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header Profile Section */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-end border-b border-gray-100">
            <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0 bg-white">
              <Image 
                src={member.image} 
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow space-y-2 pb-2">
              <h1 className="text-3xl md:text-4xl font-heading text-[var(--color-dark)]">{member.name}</h1>
              <p className="text-xl text-[var(--color-primary)] font-semibold">{member.role}</p>
              <div className="flex items-center gap-2 text-gray-500 pt-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${member.email}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {member.email}
                </a>
              </div>
            </div>
            <div className="shrink-0 pb-2 hidden md:block">
              <button className="btn-primary text-sm px-6 py-2 rounded-full">Connect</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Main Content (Left / Middle) */}
            <div className="col-span-1 md:col-span-2 p-6 md:p-8 space-y-8 border-r border-gray-100">
              
              {/* About Section */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[var(--color-dark)]">
                  <Briefcase className="w-6 h-6 text-[var(--color-tertiary)]" />
                  About
                </h2>
                <div className="prose prose-lg text-gray-700">
                  <p>{member.bio}</p>
                </div>
              </section>

              {/* Experience / Role Details */}
              <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-[var(--color-dark)]">
                  <Award className="w-6 h-6 text-[var(--color-secondary)]" />
                  Current Role
                </h2>
                <div className="bg-[var(--color-light)] p-5 rounded-lg border-l-4 border-[var(--color-primary)]">
                  <h3 className="font-bold text-lg">{member.role}</h3>
                  <p className="text-gray-600 text-sm mb-2">Aspira Youth • Present</p>
                  <p className="text-gray-700">Working closely with the team to empower vulnerable youth through dedicated programs and continuous community support.</p>
                </div>
              </section>
            </div>

            {/* Sidebar (Right) */}
            <div className="col-span-1 p-6 md:p-8 space-y-8 bg-gray-50/50">
              {/* Skills */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[var(--color-dark)]">Top Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span key={skill} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="text-xl font-bold mb-4 text-[var(--color-dark)] flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-gray-500" />
                  Education
                </h2>
                <div className="text-gray-700 text-sm space-y-1">
                  <p className="font-semibold">{member.education.split(",")[0]}</p>
                  <p className="text-gray-500">{member.education.split(",")[1] || ""}</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
