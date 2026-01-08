'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Header() {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0a]/80">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link href="/course" className="flex items-center space-x-3 group">
            {/* Logo - add your logo file to /public/logo.png or /public/logo.svg */}
            {!logoError && (
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                  unoptimized
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-400 transition-all">
              Outbound Mastery
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            href="/course/resources"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
          >
            <span className="hidden sm:inline">Resources</span>
            <span className="sm:hidden">Res</span>
          </Link>
          {/* Placeholder for user area - will be replaced with auth later */}
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border border-gray-700"></div>
        </div>
      </div>
    </header>
  );
}

