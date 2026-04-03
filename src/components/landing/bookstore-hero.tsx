'use client';

import Image from "next/image";
import { BauhausButton } from "@/components/bauhaus/bauhaus-primitives";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Link from "next/link";

export function BookstoreHero() {
  const heroImage = PlaceHolderImages[0]?.imageUrl || "https://picsum.photos/seed/hero/800/1000";

  return (
    <section className="relative pt-16 pb-32 lg:pt-24 lg:pb-48 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 relative z-10 animate-fade-up">
          <div className="inline-flex items-center gap-4 text-botanical-sage uppercase tracking-[0.4em] text-[10px] font-bold">
            <div className="w-12 h-px bg-botanical-sage" />
            The Literary Sanctuary
          </div>
          
          <h1 className="text-6xl md:text-8xl font-headline font-bold text-botanical-forest leading-[1.05] tracking-tight">
            Discover <br />
            <span className="italic font-normal text-botanical-terracotta">Stories</span> <br />
            That Resonate.
          </h1>
          
          <p className="text-xl text-botanical-forest/60 max-w-lg leading-relaxed font-medium">
            Explore a curated collection of physical and digital volumes from independent publishers. A sanctuary for the discerning reader.
          </p>
          
          <div className="flex flex-wrap gap-6 pt-4">
            <Link href="/login">
              <BauhausButton variant="primary" size="lg" className="shadow-xl">Explore Books</BauhausButton>
            </Link>
            <Link href="/login">
              <BauhausButton variant="outline" size="lg">Browse Ebooks</BauhausButton>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[3/4] md:aspect-square lg:aspect-[4/5] rounded-[200px_200px_40px_40px] overflow-hidden organic-shadow-lg group">
            <Image 
              src={heroImage}
              alt="Featured Volume"
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority
              data-ai-hint="elegant book cover"
            />
            <div className="absolute inset-0 bg-botanical-forest/5 mix-blend-multiply" />
          </div>
          
          {/* Decorative Floaties */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-botanical-clay/20 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute top-12 -right-12 w-80 h-80 bg-botanical-terracotta/5 rounded-full blur-[100px] -z-10" />
          
          <div className="absolute top-1/2 -right-12 translate-y-1/2 hidden lg:block">
             <div className="bg-white/80 backdrop-blur-md p-8 rounded-[40px] organic-shadow max-w-[200px] space-y-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-sage">Curator's Note</p>
                <p className="text-sm font-headline font-bold italic text-botanical-forest">"Design is the silent ambassador of your brand."</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
