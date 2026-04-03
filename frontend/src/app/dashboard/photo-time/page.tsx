'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function PhotoTimePage() {
  const photos = [
    { id: 1, title: 'Atelier Light', publisher: 'Botanical Press', image: PlaceHolderImages[3].imageUrl, height: 'aspect-[3/4]' },
    { id: 2, title: 'Indigo Ink', publisher: 'Monolith', image: PlaceHolderImages[4].imageUrl, height: 'aspect-square' },
    { id: 3, title: 'Paper Grain', publisher: 'The Archive', image: PlaceHolderImages[5].imageUrl, height: 'aspect-[4/5]' },
    { id: 4, title: 'Binding Ritual', publisher: 'Botanical Press', image: PlaceHolderImages[0].imageUrl, height: 'aspect-video' },
    { id: 5, title: 'Archive Dusk', publisher: 'The Archive', image: PlaceHolderImages[1].imageUrl, height: 'aspect-[3/5]' },
    { id: 6, title: 'Clay Molds', publisher: 'Monolith', image: PlaceHolderImages[2].imageUrl, height: 'aspect-square' },
    { id: 7, title: 'Morning Dew', publisher: 'Botanical Press', image: PlaceHolderImages[3].imageUrl, height: 'aspect-[2/3]' },
    { id: 8, title: 'Silent Halls', publisher: 'The Archive', image: PlaceHolderImages[4].imageUrl, height: 'aspect-[4/3]' },
  ];

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
          <div className="w-8 h-px bg-botanical-sage" />
          Visual Archive
        </div>
        <h1 className="text-5xl font-headline font-bold text-botanical-forest italic">Photo <span className="not-italic font-bold">Time</span></h1>
        <p className="text-botanical-forest/60 font-medium max-w-xl">
          A silent glimpse into the sanctuaries of our independent publishers. Curated visual inspiration from the botanical world.
        </p>
      </header>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="relative group overflow-hidden rounded-[32px] organic-shadow-lg break-inside-avoid bg-botanical-clay/10"
          >
            <div className={photo.height}>
              <Image 
                src={photo.image} 
                alt={photo.title} 
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-[2000ms] hover:scale-110"
                data-ai-hint="creative workspace"
              />
            </div>
            <div className="absolute inset-0 bg-botanical-forest/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-botanical-alabaster p-8 text-center backdrop-blur-sm">
               <h2 className="text-2xl font-headline font-bold mb-2">{photo.title}</h2>
               <p className="text-botanical-sage font-bold uppercase tracking-[0.2em] text-[9px] italic">{photo.publisher}</p>
               <div className="mt-4 w-8 h-px bg-botanical-terracotta"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
