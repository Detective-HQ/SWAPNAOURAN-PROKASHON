'use client';

import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function PhotoTimePage() {
  const photos = [
    { id: 1, title: 'Atelier Light', publisher: 'Uranus Pubs', image: PlaceHolderImages[3].imageUrl, size: 'large' },
    { id: 2, title: 'Indigo Ink', publisher: 'Monolith', image: PlaceHolderImages[4].imageUrl, size: 'medium' },
    { id: 3, title: 'Paper Grain', publisher: 'Bauhaus Collective', image: PlaceHolderImages[5].imageUrl, size: 'small' },
    { id: 4, title: 'Binding Ritual', publisher: 'The Archive', image: PlaceHolderImages[3].imageUrl, size: 'medium' },
    { id: 5, title: 'Archive Dusk', publisher: 'Bauhaus Collective', image: PlaceHolderImages[4].imageUrl, size: 'large' },
    { id: 6, title: 'Clay Molds', publisher: 'Monolith', image: PlaceHolderImages[5].imageUrl, size: 'small' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <header className="bg-botanical-forest text-botanical-alabaster py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
            <div className="w-12 h-px bg-botanical-sage" />
            Visual Archive
          </div>
          <h1 className="text-6xl lg:text-8xl font-headline font-bold leading-none italic font-normal">Photo <span className="not-italic font-bold">Time</span></h1>
          <p className="text-xl font-medium opacity-60 tracking-[0.1em] uppercase">A silent glimpse into the sanctuaries of our publishers</p>
        </div>
      </header>

      <main className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-12 space-y-12">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group overflow-hidden arch-image organic-shadow-lg break-inside-avoid">
              <Image 
                src={photo.image} 
                alt={photo.title} 
                width={800}
                height={photo.size === 'large' ? 1000 : photo.size === 'medium' ? 600 : 400}
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-[2000ms] hover:scale-110"
                data-ai-hint="creative workspace"
              />
              <div className="absolute inset-0 bg-botanical-forest/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-botanical-alabaster p-12 text-center">
                 <h2 className="text-4xl font-headline font-bold mb-4">{photo.title}</h2>
                 <p className="text-botanical-sage font-bold uppercase tracking-[0.2em] text-xs italic">{photo.publisher}</p>
                 <div className="mt-8 w-12 h-px bg-botanical-terracotta"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
