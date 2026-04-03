'use client';

import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { BauhausCard } from "@/components/bauhaus/bauhaus-card";
import { Star } from "lucide-react";

const BESTSELLERS = [
  { id: 1, title: 'Atelier Light', author: 'M. Breuer', price: '₹1,250', image: PlaceHolderImages[3].imageUrl },
  { id: 2, title: 'Clay Molds', author: 'L. Moholy-Nagy', price: '₹2,100', image: PlaceHolderImages[4].imageUrl },
  { id: 3, title: 'Paper Grain', author: 'H. Bayer', price: '₹950', image: PlaceHolderImages[5].imageUrl },
  { id: 4, title: 'Indigo Ink', author: 'A. Albers', price: '₹999', image: PlaceHolderImages[3].imageUrl },
];

export function BestsellerGrid() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="text-center space-y-4 mb-20">
        <h2 className="text-5xl font-headline font-bold text-botanical-forest">
          Our <span className="italic font-normal">Bestsellers</span>
        </h2>
        <div className="w-24 h-px bg-botanical-terracotta mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {BESTSELLERS.map((book, i) => (
          <div key={book.id} className={i % 2 !== 0 ? 'md:translate-y-12' : ''}>
            <BauhausCard className="relative h-full flex flex-col">
              <div className="absolute top-4 right-4 z-10 bg-botanical-terracotta text-white p-2 rounded-full shadow-lg">
                <Star className="w-4 h-4 fill-current" />
              </div>
              
              <div className="aspect-[3/4] relative mb-6 rounded-3xl overflow-hidden shadow-sm bg-botanical-clay/10">
                <Image 
                  src={book.image} 
                  alt={book.title} 
                  fill 
                  className="object-cover transition-transform duration-700 hover:scale-110"
                  data-ai-hint="book cover"
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="text-xl font-headline font-bold text-botanical-forest mb-1">{book.title}</h3>
                <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest italic mb-4">{book.author}</p>
              </div>
              
              <div className="pt-4 border-t border-border/40">
                <span className="text-lg font-bold text-botanical-forest">{book.price}</span>
              </div>
            </BauhausCard>
          </div>
        ))}
      </div>
    </section>
  );
}
