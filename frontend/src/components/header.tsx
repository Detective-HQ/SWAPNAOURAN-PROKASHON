"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-3 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[90%] max-w-3xl transition-all duration-500 ease-in-out rounded-full ${isScrolled ? "bg-white backdrop-blur-md" : "bg-gray-500/90 backdrop-blur-sm"}`}
      style={{
        boxShadow: isScrolled ? "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px" : "none"
      }}
    >
      <div className="flex items-center justify-between transition-all duration-500 ease-in-out px-2 md:px-5 py-2 md:py-2">
        {/* Logo */}
        <Link href="#" className={`flex items-center gap-2 text-xs md:text-lg font-medium tracking-tight transition-colors duration-500 ease-in-out ${isScrolled ? "text-black" : "text-white"}`}>
          <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="rounded-md object-cover transition-transform duration-500 ease-in-out" />
          <span className="hidden sm:inline">SWAPNAOURAN PROKASHON</span>
        </Link>

        {/* CTA */}
        <div className="flex items-center gap-2 md:gap-6">
          {!user ? (
            <>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard/shop">
                <button className={`px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-all duration-500 ease-in-out rounded-full ${isScrolled ? "text-gray-600 hover:text-black" : "text-white/80 hover:text-white"}`}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard/shop">
                <button className={`px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-all duration-500 ease-in-out rounded-full ${isScrolled ? "bg-black text-white hover:opacity-80" : "bg-white text-gray-800 hover:bg-white/90"}`}>
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      </div>
    </header>
  );
}
