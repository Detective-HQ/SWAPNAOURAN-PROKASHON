"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

export function GallerySection() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState("100vh");
  const [translateX, setTranslateX] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const rafRef = useRef<number | null>(null);

  const images = [
    { src: "/atmakatha and kobita.jpeg", alt: "Atmakatha and Kobita" },
    { src: "/bini sutor mala.jpeg", alt: "Bini Sutor Mala" },
    { src: "/biswa chariye.jpeg", alt: "Biswa Chariye" },
    { src: "/classroomer kobita.jpeg", alt: "Classroomer Kobita" },
    { src: "/dakhinjangaler lokdebtare.jpeg", alt: "Dakhinjangaler lokdebtare" },
    { src: "/meghpioner dakchithi.jpeg", alt: "Meghpioner Dakchithi" },
    { src: "/pralap.jpeg", alt: "Pralap" },
    { src: "/rahasyamoy padmanabhasami.jpeg", alt: "Rahasyamoy Padmanabhasami" },
    { src: "/sapnauran.jpeg", alt: "Sapnauran" },
    { src: "/sarad utsab2025.jpeg", alt: "Sarad Utsab 2025" },
    { src: "/smritir esrad.jpeg", alt: "Smritir Esrad" },
    { src: "/uran.jpeg", alt: "Uran" },
  ];

  // Calculate section height based on content width
  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current) return;
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSectionHeight("auto");
        setTranslateX(0);
        return;
      }
      const containerWidth = containerRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      // Height = viewport height + the extra scroll needed to reveal all content
      const totalHeight = viewportHeight + (containerWidth - viewportWidth);
      setSectionHeight(`${totalHeight}px`);
    };

    // Small delay to ensure container is rendered
    const timer = setTimeout(calculateHeight, 100);
    window.addEventListener("resize", calculateHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateHeight);
    };
  }, []);

  const updateTransform = useCallback(() => {
    if (!galleryRef.current || !containerRef.current) return;
    if (isMobile) return;
    
    const rect = galleryRef.current.getBoundingClientRect();
    const containerWidth = containerRef.current.scrollWidth;
    const viewportWidth = window.innerWidth;
    
    // Total scroll distance needed to reveal all images
    const totalScrollDistance = containerWidth - viewportWidth;
    
    // Current scroll position within this section
    const scrolled = Math.max(0, -rect.top);
    
    // Progress from 0 to 1
    const progress = Math.min(1, scrolled / totalScrollDistance);
    
    // Calculate new translateX
    const newTranslateX = progress * -totalScrollDistance;
    
    setTranslateX(newTranslateX);
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      rafRef.current = requestAnimationFrame(updateTransform);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateTransform();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateTransform]);

  return (
    <section
      id="gallery"
      ref={galleryRef}
      className="relative bg-background"
      style={{ height: sectionHeight }}
    >
      {isMobile ? (
        <div className="overflow-hidden py-12">
          <div
            ref={containerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide"
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="relative h-[62svh] w-[82vw] flex-shrink-0 snap-center overflow-hidden rounded-2xl flex items-center justify-center bg-gray-100"
              >
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  priority={index < 2}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="flex h-full items-center">
            <div
              ref={containerRef}
              className="flex gap-3 px-3 md:gap-4 md:px-6 lg:gap-6"
              style={{
                transform: `translate3d(${translateX}px, 0, 0)`,
                WebkitTransform: `translate3d(${translateX}px, 0, 0)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                perspective: 1000,
                WebkitPerspective: 1000,
                touchAction: "pan-y",
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-[65vh] w-[50vw] flex-shrink-0 overflow-hidden rounded-2xl lg:w-[40vw] flex items-center justify-center bg-gray-100"
                  style={{
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                  }}
                >
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    fill
                    className="object-contain transition-transform duration-700 hover:scale-110"
                    priority={index < 3}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
