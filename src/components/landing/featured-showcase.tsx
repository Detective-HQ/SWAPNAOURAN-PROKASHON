'use client';

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BauhausCard } from "@/components/bauhaus/bauhaus-card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURED_BOOKS = [
  { id: 1, title: 'The Silent Modernist', author: 'L. Van der Rohe', price: '₹1,850', image: PlaceHolderImages[0]?.imageUrl || "https://picsum.photos/seed/book1/400/600" },
  { id: 2, title: 'Primary Colors', author: 'K. Malevich', price: '₹1,499', image: PlaceHolderImages[1]?.imageUrl || "https://picsum.photos/seed/book2/400/600" },
  { id: 3, title: 'Form & Function', author: 'W. Gropius', price: '₹2,400', image: PlaceHolderImages[2]?.imageUrl || "https://picsum.photos/seed/book3/400/600" },
  { id: 4, title: 'Indigo Ink', author: 'A. Albers', price: '₹999', image: PlaceHolderImages[3]?.imageUrl || "https://picsum.photos/seed/book4/400/600" },
];

export function FeaturedShowcase() {
  return (
    <section className="py-32 overflow-hidden bg-botanical-stone/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-botanical-sage">Seasonal Selection</div>
          <h2 className="text-5xl md:text-6xl font-headline font-bold text-botanical-forest">
            Featured <span className="italic font-normal text-botanical-terracotta">Showcase</span>
          </h2>
          <p className="text-botanical-forest/50 font-medium max-w-md">Hand-picked volumes representing the intersection of architectural design and literature.</p>
        </div>
        <Link href="/login" className="flex items-center gap-3 font-bold uppercase tracking-widest text-[10px] text-botanical-forest hover:text-botanical-terracotta transition-all group">
          View All Details
          <div className="bg-white p-3 rounded-full organic-shadow group-hover:translate-x-2 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      <div className="flex gap-12 overflow-x-auto px-6 lg:px-12 pb-16 scrollbar-hide snap-x">
        {FEATURED_BOOKS.map((book) => (
          <div key={book.id} className="min-w-[320px] md:min-w-[420px] snap-center">
            <BauhausCard className="group h-full flex flex-col bg-white">
              <div className="aspect-[3/4] relative mb-10 rounded-[40px] overflow-hidden arch-image organic-shadow transition-all duration-700 group-hover:-translate-y-2">
                <Image 
                  src={book.image} 
                  alt={book.title} 
                  fill 
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                  data-ai-hint="book cover"
                />
                <div className="absolute inset-0 bg-botanical-forest/5 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-botanical-forest mb-2">{book.title}</h3>
              <p className="text-xs font-bold text-botanical-sage uppercase tracking-widest italic mb-10">{book.author}</p>
              <div className="mt-auto flex justify-between items-center pt-8 border-t border-border/40">
                <span className="text-2xl font-bold text-botanical-forest italic">{book.price}</span>
                <Link href="/login">
                  <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-botanical-terracotta hover:text-botanical-forest transition-colors">
                    COLLECT NOW
                  </button>
                </Link>
              </div>
            </BauhausCard>
          </div>
        ))}
      </div>
    </section>
  );
}
