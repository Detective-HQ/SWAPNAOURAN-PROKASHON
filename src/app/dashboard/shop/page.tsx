'use client';

import Image from 'next/image';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart, Search, SlidersHorizontal } from 'lucide-react';

export default function ShopPage() {
  const books = [
    { 
      id: 1, 
      title: 'The Silent Modernist', 
      author: 'L. Van der Rohe', 
      price: '1,850', 
      description: 'A deep dive into the philosophy of minimalist architecture and the silent impact of space.',
      image: PlaceHolderImages[0].imageUrl 
    },
    { 
      id: 2, 
      title: 'Primary Colors', 
      author: 'K. Malevich', 
      price: '1,499', 
      description: 'Exploring the radical simplicity of suprematism and the power of pure artistic feeling.',
      image: PlaceHolderImages[1].imageUrl 
    },
    { 
      id: 3, 
      title: 'Form & Function', 
      author: 'W. Gropius', 
      price: '2,400', 
      description: 'The foundational text of the Bauhaus movement, now revisited with botanical insights.',
      image: PlaceHolderImages[2].imageUrl 
    },
    { 
      id: 4, 
      title: 'Indigo Ink', 
      author: 'A. Albers', 
      price: '999', 
      description: 'A tactile journey through textile design and the organic patterns found in nature.',
      image: PlaceHolderImages[3].imageUrl 
    },
    { 
      id: 5, 
      title: 'Atelier Light', 
      author: 'M. Breuer', 
      price: '1,250', 
      description: 'Capturing the interplay of light and shadow in the modern creative workspace.',
      image: PlaceHolderImages[4].imageUrl 
    },
    { 
      id: 6, 
      title: 'Clay Molds', 
      author: 'L. Moholy-Nagy', 
      price: '2,100', 
      description: 'The art of shaping earth into form: a guide to organic ceramics and sculptural design.',
      image: PlaceHolderImages[5].imageUrl 
    },
  ];

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 pb-8 border-b border-border/40">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
            <div className="w-8 h-px bg-botanical-sage" />
            Curated Treasures
          </div>
          <h1 className="text-5xl font-headline font-bold text-botanical-forest italic">Physical <span className="not-italic">Collection</span></h1>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-72">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-botanical-forest/30 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search library..." 
              className="w-full pl-12 pr-6 py-3.5 rounded-full bg-botanical-clay/10 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
            />
          </div>
          <BauhausButton variant="outline" className="p-3 w-12 h-12 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </BauhausButton>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book, i) => (
          <div key={book.id} className={i % 2 !== 0 ? 'md:translate-y-8' : ''}>
            <BauhausCard className="h-full flex flex-col group">
              <div className="aspect-[3/4] relative mb-6 rounded-3xl overflow-hidden shadow-sm">
                <Image 
                  src={book.image} 
                  alt={book.title} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint="book cover"
                />
              </div>
              <h2 className="text-xl font-headline font-bold text-botanical-forest mb-1">{book.title}</h2>
              <p className="text-botanical-sage font-bold text-[10px] uppercase tracking-widest mb-4 italic">{book.author}</p>
              <p className="text-sm text-botanical-forest/60 font-medium mb-8 flex-grow leading-relaxed">
                {book.description}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-border/40">
                <span className="text-xl font-bold italic text-botanical-forest">₹{book.price}</span>
                <BauhausButton variant="terracotta" size="sm" className="px-5">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  ADD
                </BauhausButton>
              </div>
            </BauhausCard>
          </div>
        ))}
      </div>
    </div>
  );
}
