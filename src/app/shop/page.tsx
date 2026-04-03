'use client';

import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart, Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function ShopPage() {
  const books = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Modern Volume ${i + 1}`,
    author: i % 2 === 0 ? 'Moholy-Nagy' : 'Herbert Bayer',
    price: (19.99 + i * 2).toFixed(2),
    publisher: 'Botanical Press',
    image: PlaceHolderImages[i % PlaceHolderImages.length].imageUrl
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="py-24 px-6 lg:px-12 bg-white border-b border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
              <div className="w-12 h-px bg-botanical-sage" />
              The Collection
            </div>
            <h1 className="text-6xl font-headline font-bold text-botanical-forest leading-none">Curated <br /> <span className="italic font-normal">Physical Library</span></h1>
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-botanical-forest/30 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Find your story..." 
                className="w-full pl-16 pr-8 py-5 rounded-full bg-botanical-clay/10 border border-border font-medium focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
              />
            </div>
            <BauhausButton variant="ghost" className="p-5 border border-border">
              <SlidersHorizontal className="w-5 h-5" />
            </BauhausButton>
          </div>
        </div>
      </header>

      <main className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
            {books.map((book) => (
              <div key={book.id} className="staggered-card">
                <BauhausCard>
                  <div className="aspect-[3/4] relative mb-8 rounded-[40px] overflow-hidden group">
                    <Image 
                      src={book.image} 
                      alt={book.title} 
                      fill 
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      data-ai-hint="book cover"
                    />
                    <div className="absolute top-4 left-4 bg-botanical-terracotta text-white px-4 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase">
                      #{book.id}
                    </div>
                  </div>
                  <h2 className="text-xl font-headline font-bold mb-1 leading-tight">{book.title}</h2>
                  <p className="text-botanical-forest/40 font-medium text-xs mb-8 uppercase tracking-widest italic">{book.author}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-border/10">
                    <span className="text-2xl font-headline font-bold italic">${book.price}</span>
                    <BauhausButton variant="secondary" size="sm" className="px-4">
                      <ShoppingCart className="w-4 h-4" />
                    </BauhausButton>
                  </div>
                </BauhausCard>
              </div>
            ))}
          </div>
          
          <div className="mt-32 text-center">
            <BauhausButton variant="outline" size="lg">Load More Treasures</BauhausButton>
          </div>
        </div>
      </main>
    </div>
  );
}
