"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const word = "স্বপ্নউড়ান";

const sideImages = [
  {
    src: "/atmakatha and kobita.jpeg",
    alt: "Atmakatha and Kobita",
    position: "left",
    span: 1,
  },
  {
    src: "/bini sutor mala.jpeg",
    alt: "Bini Sutor Mala",
    position: "left",
    span: 1,
  },
  {
    src: "/biswa chariye.jpeg",
    alt: "Biswa Chariye",
    position: "right",
    span: 1,
  },
  {
    src: "/classroomer kobita.jpeg",
    alt: "Classroomer Kobita",
    position: "right",
    span: 1,
  },
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollableHeight = isMobile ? window.innerHeight : window.innerHeight * 2;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, [isMobile]);

  // Text fades out first (0 to 0.2)
  const textOpacity = Math.max(0, 1 - (scrollProgress / (isMobile ? 0.3 : 0.2)));
  
  // Image transforms start after text fades (0.2 to 1)
  const imageProgress = Math.max(0, Math.min(1, (scrollProgress - (isMobile ? 0.3 : 0.2)) / (isMobile ? 0.7 : 0.8)));
  
  // Mobile-responsive interpolations
  const centerWidth = isMobile ? 100 : 100 - (imageProgress * 58); // 100% to 42%
  const centerHeight = isMobile ? 100 : 100 - (imageProgress * 30); // 100% to 70%
  const sideWidth = isMobile ? 0 : imageProgress * 22; // 0% to 22%
  const sideOpacity = isMobile ? 0 : imageProgress;
  const sideTranslateLeft = -100 + (imageProgress * 100); // -100% to 0%
  const sideTranslateRight = 100 - (imageProgress * 100); // 100% to 0%
  const borderRadius = isMobile ? 16 : imageProgress * 24; // 0px to 24px
  const gap = isMobile ? 8 : imageProgress * 16; // 0px to 16px
  
  // Vertical offset for side columns to move them up on mobile
  const sideTranslateY = -(imageProgress * 15); // Move up by 15% when fully expanded

  return (
    <section ref={sectionRef} className="relative bg-background">
      {/* Sticky container for scroll animation */}
      <div className={isMobile ? "relative h-[100svh] overflow-hidden" : "sticky top-0 h-screen overflow-hidden"}>
        <div className="flex h-full w-full items-center justify-center">
          {/* Bento Grid Container */}
          <div 
            className="relative flex h-full w-full items-stretch justify-center"
            style={{ gap: `${gap}px`, padding: `${isMobile ? 8 : imageProgress * 16}px`, paddingBottom: `${isMobile ? 20 : 60 + (imageProgress * 40)}px` }}
          >
            
            {/* Left Column - Hidden on Mobile */}
            {!isMobile && (
              <div 
                className="flex flex-col will-change-transform"
                style={{
                  width: `${sideWidth}%`,
                  gap: `${gap}px`,
                  transform: `translateX(${sideTranslateLeft}%) translateY(${sideTranslateY}%)`,
                  opacity: sideOpacity,
                }}
              >
              {sideImages.filter(img => img.position === "left").map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              </div>
            )}

            {/* Main Hero Image - Center */}
            <div 
              className="relative overflow-hidden will-change-transform"
              style={{
                width: `${centerWidth}%`,
                height: `${centerHeight}%`,
                flex: "0 0 auto",
                borderRadius: `${borderRadius}px`,
              }}
            >
              <Image
                src="/sapnahero.png"
                alt="Sapnauran Main Hero"
                fill
                className="object-cover"
                priority
              />
              
              {/* Overlay Text - Fades out first */}
              <div 
                className="absolute inset-0 flex items-end overflow-hidden px-4 md:px-6"
                style={{ opacity: textOpacity }}
              >
                <h1 className="w-full break-words text-[16vw] font-medium leading-[0.85] tracking-tight text-white sm:text-[13vw] md:text-[14vw] md:tracking-tighter lg:text-[16vw]">
                  {word.split("").map((letter, index) => (
                    <span
                      key={index}
                      className="inline-block animate-[slideUp_0.8s_ease-out_forwards] opacity-0"
                      style={{
                        animationDelay: `${index * 0.08}s`,
                        transition: 'all 1.5s',
                        transitionTimingFunction: 'cubic-bezier(0.86, 0, 0.07, 1)',
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </h1>
              </div>

              {/* Tagline */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ 
                  opacity: textOpacity,
                }}
              >
                <h2 className="text-white text-[3vw] md:text-[2.5vw] font-bold tracking-widest uppercase drop-shadow-lg opacity-80 text-center px-4">
                  <span className="text-xs md:text-sm block mb-2"></span>
                  <span className="text-[2.5vw] md:text-[2vw]"></span>
                </h2>
              </div>
            </div>

            {/* Right Column - Hidden on Mobile */}
            {!isMobile && (
              <div 
                className="flex flex-col will-change-transform"
                style={{
                  width: `${sideWidth}%`,
                  gap: `${gap}px`,
                  transform: `translateX(${sideTranslateRight}%) translateY(${sideTranslateY}%)`,
                  opacity: sideOpacity,
                }}
              >
              {sideImages.filter(img => img.position === "right").map((img, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden will-change-transform"
                  style={{
                    flex: img.span,
                    borderRadius: `${borderRadius}px`,
                  }}
                >
                  <Image
                    src={img.src || "/placeholder.svg"}
                    alt={img.alt}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Scroll space to enable animation - reduced on mobile */}
      {!isMobile && <div className="h-[200vh]" />}

      {/* Tagline Section */}
      <div className="px-4 py-16 md:px-12 md:py-28 lg:px-20 lg:py-36">
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-muted-foreground md:text-2xl lg:text-3xl">
          গল্প, কবিতা আর মননশীলতার এক অনন্য ঠিকানা
        </p>
      </div>
    </section>
  );
}
