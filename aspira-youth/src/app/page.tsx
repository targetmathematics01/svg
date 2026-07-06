import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart, Users, Download, MessageSquare, Monitor, Brain, Target, Compass, Gift } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-[var(--color-light)] section-padding relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <h1 className="text-5xl md:text-6xl text-[var(--color-primary)] mb-4">
                Aspira Youth
              </h1>
              <h2 className="text-3xl md:text-4xl text-[var(--color-dark)]">
                Empowering the Next Generation
              </h2>
              <p className="text-lg text-gray-700 max-w-lg">
                Providing structured digital education for youth in Myanmar with limited prior access, including those from diverse backgrounds and conflict areas.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="#mission" className="btn-primary">
                  Our Mission
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative w-full aspect-square max-w-md mx-auto rounded-full overflow-hidden border-8 border-white shadow-xl">
                <Image 
                  src="/hero_image_v2.png" 
                  alt="Happy diverse youth learning together" 
                  fill 
                  className="object-cover" 
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Team Image Section */}
      <section className="relative min-h-[500px] flex flex-col items-center justify-end pb-16 pt-32 text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/team-banner.png" 
            alt="Aspira Youth Team" 
            fill 
            className="object-cover object-top" 
            quality={100}
          />
          {/* Gradient Overlay: Dark at bottom for text, clear at top for faces */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="container-custom relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Our Dedicated Team</h2>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
            A passionate group of Youth Ambassadors committed to empowering the next generation through digital education and support.
          </p>
          <Link href="/team" className="inline-block bg-white text-[var(--color-primary)] px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
            Meet the Team
          </Link>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-[var(--color-primary)] mb-4">Who We Help</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our core focus is to bring light and education to those who need it most.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Program 1 */}
            <div className="bg-[var(--color-light)] rounded-2xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl border-t-4 border-[var(--color-primary)]">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-md text-[var(--color-primary)]">
                <Users className="w-10 h-10" />
              </div>
              <h3 className="text-2xl mb-4">Who We Serve</h3>
              <p className="text-gray-600">
                Youth with limited access to technology, including students from diverse backgrounds and those who have fled conflict or lived in refugee camps.
              </p>
            </div>

            {/* Program 2 */}
            <div className="bg-[var(--color-light)] rounded-2xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl border-t-4 border-[var(--color-secondary)]">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-md text-[var(--color-secondary)]">
                <Monitor className="w-10 h-10" />
              </div>
              <h3 className="text-2xl mb-4">What We Do</h3>
              <p className="text-gray-600">
                Expanding access to technology and digital learning by equipping young people with foundational digital skills needed to learn, connect and grow.
              </p>
            </div>

            {/* Program 3 */}
            <div className="bg-[var(--color-light)] rounded-2xl p-8 text-center hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl border-t-4 border-[var(--color-tertiary)]">
              <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6 shadow-md text-[var(--color-tertiary)]">
                <Target className="w-10 h-10" />
              </div>
              <h3 className="text-2xl mb-4">Where We Work</h3>
              <p className="text-gray-600">
                Currently operating in Hmawbi, Yangon, Myanmar, bringing digital education directly to communities that need it most.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Curriculum Section */}
      <section className="section-padding bg-[var(--color-light)]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl text-[var(--color-tertiary)] mb-4">Project Objectives</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Equipping young people with essential digital skills and expanding their access to technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-b-4 border-[var(--color-primary)] shadow-sm hover:shadow-lg transition-shadow">
              <Monitor className="w-12 h-12 text-[var(--color-primary)] mb-6" />
              <h3 className="text-2xl mb-4">Digital Literacy</h3>
              <p className="text-gray-600">
                Strengthen foundational digital literacy, typing skills, and foster creativity through digital design tools.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-b-4 border-[var(--color-accent)] shadow-sm hover:shadow-lg transition-shadow">
              <BookOpen className="w-12 h-12 text-[var(--color-accent)] mb-6" />
              <h3 className="text-2xl mb-4">Research Skills</h3>
              <p className="text-gray-600">
                Develop essential research and information evaluation skills to navigate the digital world effectively.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-b-4 border-[var(--color-secondary)] shadow-sm hover:shadow-lg transition-shadow">
              <Brain className="w-12 h-12 text-[var(--color-secondary)] mb-6" />
              <h3 className="text-2xl mb-4">Critical Thinking</h3>
              <p className="text-gray-600">
                Enhance problem-solving, critical thinking, and build confidence in presentation and communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aim & Mission Section */}
      <section id="mission" className="section-padding bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[var(--color-light)] p-8 rounded-2xl text-center">
                  <Target className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-4" />
                  <h3 className="text-2xl mb-2">Our Aim</h3>
                  <p className="text-gray-600 text-sm">To bridge the gap by expanding access to digital learning.</p>
                </div>
                <div className="bg-[var(--color-light)] p-8 rounded-2xl text-center mt-0 sm:mt-12">
                  <Compass className="w-12 h-12 text-[var(--color-tertiary)] mx-auto mb-4" />
                  <h3 className="text-2xl mb-2">Our Mission</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    To empower youth in Myanmar by providing comprehensive digital literacy, fostering critical thinking, and equipping them with the essential technology skills needed to thrive in the modern world.
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-4xl text-[var(--color-dark)]">Why It Matters</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                While technology shapes the modern world, many children in Myanmar have yet to touch a keyboard. Opportunities to access digital education remain limited, and for some, even a basic Google search remains out of reach. AspiraYouth works to bridge this gap.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">✓</div>
                  <span>Expand access to technology and learning</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-secondary)]">✓</div>
                  <span>Equip youth with foundational digital skills</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-tertiary)]/20 flex items-center justify-center text-[var(--color-tertiary)]">✓</div>
                  <span>An initiative under the YAEAP &apos;26 Program</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Save the Children Section */}
      <section className="relative min-h-[400px] flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/savechildren.png" 
            alt="Children smiling and learning together" 
            fill 
            className="object-cover object-center grayscale" 
            quality={100}
          />
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content Overlay */}
        <div className="container-custom relative z-10 px-4 py-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">Every Child Deserves a Future</h2>
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto font-medium drop-shadow-md">
            Empowering the next generation with the tools and opportunities they need to thrive.
          </p>
        </div>
      </section>
    </div>
  );
}
