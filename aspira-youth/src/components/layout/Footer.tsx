import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] text-white pt-16 pb-8">
      <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image src="/favicon.png" alt="Aspira Youth Logo" width={36} height={36} className="object-contain" />
            <div className="h-8 w-[2px] bg-white opacity-80 rounded-full"></div>
            <h3 className="text-2xl font-heading text-white m-0">
              Aspira<span className="text-[var(--color-secondary)]">Youth</span>
            </h3>
          </div>
          <p className="text-gray-400 text-sm">
            Empowering vulnerable youth through free education and community support.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 text-[var(--color-primary)]">Quick Links</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>

          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 text-[var(--color-secondary)]">Discover</h4>
          <ul className="space-y-2 text-gray-300">
            <li><Link href="/activities/photos" className="hover:text-white transition-colors">Activities</Link></li>
            <li><Link href="/forum" className="hover:text-white transition-colors">Forum</Link></li>
            <li><Link href="/team" className="hover:text-white transition-colors">Our Team</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-lg font-bold mb-4 text-[var(--color-tertiary)]">Contact Us</h4>
          <p className="text-gray-300 text-sm">
            info@aspirayouth.org <br/>
            Yangon, Myanmar
          </p>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Aspira Youth. All rights reserved.
      </div>
    </footer>
  );
}
