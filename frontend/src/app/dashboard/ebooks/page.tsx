'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, ShieldCheck, Zap, X } from 'lucide-react';

export default function EbooksPage() {
  const [readingEbook, setReadingEbook] = useState<any | null>(null);

  const ebooks = [
    { id: 1, title: 'Digital Typography', price: '349', author: 'H. Bayer', image: PlaceHolderImages[0].imageUrl },
    { id: 2, title: 'Screen Modernism', price: '299', author: 'L. Moholy-Nagy', image: PlaceHolderImages[1].imageUrl },
    { id: 3, title: 'Pixels as Points', price: '450', author: 'A. Albers', image: PlaceHolderImages[2].imageUrl },
    { id: 4, title: 'Vector Bauhaus', price: '320', author: 'W. Gropius', image: PlaceHolderImages[0].imageUrl },
  ];

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
          <div className="w-8 h-px bg-botanical-sage" />
          Digital Sanctuary
        </div>
        <h1 className="text-5xl font-headline font-bold text-botanical-forest">My <span className="italic font-normal text-botanical-terracotta">Ebooks</span></h1>
        <p className="text-botanical-forest/60 font-medium max-w-xl">
          Secure digital blueprints delivered instantly to your device. Pure information, zero footprint.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {ebooks.map((ebook) => (
          <BauhausCard key={ebook.id} className="group">
            <div className="aspect-[3/4] relative mb-6 rounded-2xl overflow-hidden arch-image shadow-md">
              <Image 
                src={ebook.image} 
                alt={ebook.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                data-ai-hint="digital book cover"
              />
              <div className="absolute inset-0 bg-botanical-forest/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="text-lg font-headline font-bold text-botanical-forest mb-1">{ebook.title}</h3>
            <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest mb-6 italic">{ebook.author}</p>
            <div className="flex justify-between items-center pt-4 border-t border-border/40">
              <span className="text-lg font-bold">₹{ebook.price}</span>
              <BauhausButton 
                variant="primary" 
                size="sm" 
                onClick={() => setReadingEbook(ebook)}
              >
                READ NOW
              </BauhausButton>
            </div>
          </BauhausCard>
        ))}
      </div>

      {/* Mock PDF Viewer Overlay */}
      {readingEbook && (
        <div className="fixed inset-0 z-[100] bg-botanical-forest/95 flex items-center justify-center p-4 lg:p-12 animate-in fade-in zoom-in duration-300">
          <button 
            onClick={() => setReadingEbook(null)}
            className="absolute top-8 right-8 text-botanical-alabaster hover:scale-110 transition-transform bg-white/10 p-4 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="bg-white w-full max-w-4xl h-full rounded-[40px] organic-shadow flex flex-col overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <BookOpen className="text-botanical-terracotta" />
                <h2 className="text-xl font-headline font-bold">{readingEbook.title}</h2>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-botanical-sage">
                SECURE VIEWING MODE
              </div>
            </div>
            
            <div className="flex-grow p-12 bg-botanical-stone/30 overflow-y-auto space-y-12">
              <div className="max-w-2xl mx-auto space-y-10 py-10">
                <h1 className="text-4xl font-headline font-bold text-center">Chapter One</h1>
                <div className="h-px bg-botanical-sage/20 w-32 mx-auto" />
                <p className="text-lg font-medium leading-loose text-botanical-forest first-letter:text-6xl first-letter:font-headline first-letter:float-left first-letter:mr-4 first-letter:text-botanical-terracotta">
                  In the garden of modern thought, design is the seed that blooms into reality. This digital blueprint explores the tactile nature of pixels and the organic growth of screen-based typography...
                </p>
                <p className="text-lg font-medium leading-loose text-botanical-forest">
                  Every point of light on a display is a leaf on the tree of information. As we navigate through the digital forest, we must remain grounded in the principles of form and function.
                </p>
                <div className="bg-botanical-clay/20 p-10 rounded-[40px] italic text-botanical-forest/70 text-center">
                  "Space is the breath between the words."
                </div>
                <p className="text-lg font-medium leading-loose text-botanical-forest">
                  The architecture of the page remains constant, even as the medium shifts from paper to light. We are the gardeners of this new sanctuary.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-botanical-forest text-botanical-alabaster text-center text-[10px] font-bold tracking-[0.3em] uppercase">
              Authenticated access for active member • {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
