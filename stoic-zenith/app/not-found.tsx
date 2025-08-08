'use client'

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen w-full h-screen bg-[#F4EEE6] flex items-center justify-center">
      {/* Desktop version */}
      <div className="hidden lg:flex w-full h-full flex-row">
        {/* Left: Illustration */}
        <div className="flex-1 h-full relative flex items-center justify-center">
          <div className="w-full h-full scale-90">
            <Image
              src="/404/background-image.png"
              alt="404 illustration"
              fill
              className="object-cover object-[left_60%] h-full w-full"
              priority
            />
          </div>
        </div>
        {/* Right: Text content */}
        <div className="flex flex-col justify-center items-start flex-1 pr-[8vw] ml-[4vw] z-10 h-full">
          <h1 
            className="font-bold leading-[1.18] tracking-[-0.141em] text-[#52603F]"
            style={{
              fontSize: '8vw',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
          >
            404
          </h1>
          <div className="mt-[-18px]">
            <p 
              className="font-bold uppercase tracking-[0.03125em] text-[#52603F]"
              style={{
                fontSize: '1.2vw',
                lineHeight: '1.235',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              WE COULDN'T FIND WHAT YOU'RE
            </p>
            <p 
              className="font-bold uppercase tracking-[0.043em] text-[#52603F]"
              style={{
                fontSize: '1.2vw',
                lineHeight: '1.235',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              LOOKING FOR. LET'S FIND YOUR WAY BACK
            </p>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-3 mt-10 group transition-all duration-300 hover:opacity-80"
          >
            <div className="relative">
              <div className="w-[34.5px] h-[34.5px] rounded-full bg-black absolute top-0 left-0" />
              <div className="w-[34.5px] h-[34.5px] rounded-full bg-[#52603F] relative flex items-center justify-center group-hover:-translate-x-1 transition-transform duration-300">
                <ArrowLeft className="w-5 h-5 text-[#EFEFED]" strokeWidth={2} />
              </div>
            </div>
            <span 
              className="font-bold uppercase tracking-[0.047em] text-[#52603F]"
              style={{
                fontSize: '1vw',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              BACK TO HOMEPAGE
            </span>
          </Link>
        </div>
      </div>
      {/* Mobile/Tablet version */}
      <div className="lg:hidden relative w-full px-6 py-12">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[#F4EEE6] opacity-20" />
        
        <div className="relative z-10 max-w-md mx-auto text-center">
          {/* Image */}
          <div className="relative w-full h-64 mb-8 rounded-lg overflow-hidden">
            <Image
              src="/404/background-image.png"
              alt="404 illustration"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* 404 Number */}
          <h1 className="text-8xl sm:text-9xl font-bold leading-none tracking-tighter text-[#52603F] mb-4">
            404
          </h1>

          {/* Error message */}
          <div className="mb-8">
            <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#52603F] mb-1">
              WE COULDN'T FIND WHAT YOU'RE
            </p>
            <p className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#52603F]">
              LOOKING FOR. LET'S FIND YOUR WAY BACK
            </p>
          </div>

          {/* Back to homepage button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-3 group transition-all duration-300 active:scale-95"
          >
            {/* Circle with arrow */}
            <div className="relative">
              {/* Outer circle */}
              <div className="w-10 h-10 rounded-full bg-black absolute top-0 left-0" />
              {/* Inner circle with arrow */}
              <div className="w-10 h-10 rounded-full bg-[#52603F] relative flex items-center justify-center group-hover:-translate-x-1 transition-transform duration-300">
                <ArrowLeft className="w-5 h-5 text-[#EFEFED]" strokeWidth={2} />
              </div>
            </div>
            
            {/* Text */}
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#52603F]">
              BACK TO HOMEPAGE
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
