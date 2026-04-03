"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

export function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [alpineTranslateX, setAlpineTranslateX] = useState(-100);
  const [forestTranslateX, setForestTranslateX] = useState(100);
  const [titleOpacity, setTitleOpacity] = useState(1);
  const rafRef = useRef<number | null>(null);

  const updateTransforms = useCallback(() => {
    if (!sectionRef.current) return;
    
    const rect = sectionRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const sectionHeight = sectionRef.current.offsetHeight;
    
    // Calculate progress based on scroll position
    const scrollableRange = sectionHeight - windowHeight;
    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollableRange));
    
    // Alpine comes from left (-100% to 0%)
    setAlpineTranslateX((1 - progress) * -100);
    
    // Forest comes from right (100% to 0%)
    setForestTranslateX((1 - progress) * 100);
    
    // Title fades out as blocks come together
    setTitleOpacity(1 - progress);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(updateTransforms);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransforms();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateTransforms]);

  return (
    <section id="products" className="bg-background">
      {/* Scroll-Animated Product Grid */}
      <div ref={sectionRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="relative w-full">
            {/* Title - positioned behind the blocks */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{ opacity: titleOpacity }}
            >
              <h2 className="text-[18vw] md:text-[10vw] lg:text-[8vw] font-medium leading-[0.95] tracking-tighter text-foreground text-center px-6">
                শ্রেষ্ঠ সংকলন।
              </h2>
            </div>

            {/* Product Grid */}
            <div className="relative z-10 grid grid-cols-1 gap-8 px-6 md:grid-cols-2 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
              {/* Alpine Image - comes from left */}
              <div 
                className="relative aspect-[4/5] md:aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl"
                style={{
                  transform: `translate3d(${window.innerWidth < 768 ? alpineTranslateX / 2 : alpineTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${window.innerWidth < 768 ? alpineTranslateX / 2 : alpineTranslateX}%, 0, 0)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <Image
                  src="/biswa chariye.jpeg"
                  alt="Biswa Chariye"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6">
                  <span className="backdrop-blur-md px-5 py-2.5 text-sm md:text-base font-medium rounded-full bg-black/60 text-white border border-white/10">
                    বিশ্ব ছাড়িয়ে ৳ ৩০০.০০
                  </span>
                </div>
              </div>

              {/* Forest Image - comes from right */}
              <div 
                className="relative aspect-[4/5] md:aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl"
                style={{
                  transform: `translate3d(${window.innerWidth < 768 ? forestTranslateX / 2 : forestTranslateX}%, 0, 0)`,
                  WebkitTransform: `translate3d(${window.innerWidth < 768 ? forestTranslateX / 2 : forestTranslateX}%, 0, 0)`,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <Image
                  src="/uran.jpeg"
                  alt="Uran"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6">
                  <span className="backdrop-blur-md px-5 py-2.5 text-sm md:text-base font-medium rounded-full bg-black/60 text-white border border-white/10">
                    উড়ান ৳ ২৫০.০০
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-20 md:px-12 md:py-28 lg:px-20 lg:py-36 lg:pb-14">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            আমাদের চিন্তা
          </p>
          <p className="mt-8 leading-relaxed text-muted-foreground text-3xl text-center">
            স্বপ্নউড়ান প্রকাশন - যেখানে প্রতিটি শব্দ প্রাণ পায়। আমরা বিশ্বাস করি বই কেবল কাগজের সমষ্টি নয়, এটি একটি স্বপ্ন। 
          </p>
        </div>
      </div>
    </section>
  );
}
