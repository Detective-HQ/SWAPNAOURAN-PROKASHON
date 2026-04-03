import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function PhotoTimePage() {
  const photos = [
    { id: 1, title: 'Studio A', publisher: 'Uranus Pubs', image: PlaceHolderImages[3].imageUrl, size: 'large' },
    { id: 2, title: 'Ink Wash', publisher: 'Monolith', image: PlaceHolderImages[4].imageUrl, size: 'medium' },
    { id: 3, title: 'Press Room', publisher: 'Bauhaus Collective', image: PlaceHolderImages[5].imageUrl, size: 'small' },
    { id: 4, title: 'Binding', publisher: 'The Archive', image: PlaceHolderImages[3].imageUrl, size: 'medium' },
    { id: 5, title: 'Archive 01', publisher: 'Bauhaus Collective', image: PlaceHolderImages[4].imageUrl, size: 'large' },
    { id: 6, title: 'Colors', publisher: 'Monolith', image: PlaceHolderImages[5].imageUrl, size: 'small' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="bg-[#1040C0] text-white py-24 px-4 border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl lg:text-8xl font-black mb-4">PHOTO TIME</h1>
          <p className="text-2xl font-bold uppercase tracking-[0.2em] opacity-80">A GLIMPSE INTO OUR PUBLISHING HOUSES</p>
        </div>
      </div>

      <main className="py-16 px-4">
        <div className="max-w-7xl mx-auto columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group overflow-hidden border-4 border-black bauhaus-shadow-md break-inside-avoid">
              <Image 
                src={photo.image} 
                alt={photo.title} 
                width={800}
                height={photo.size === 'large' ? 1000 : photo.size === 'medium' ? 600 : 400}
                className="w-full grayscale group-hover:grayscale-0 transition-all duration-700"
                data-ai-hint="creative workspace"
              />
              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-white p-6 text-center">
                 <h2 className="text-3xl font-black mb-2">{photo.title}</h2>
                 <p className="text-[#F0C020] font-bold uppercase tracking-widest">{photo.publisher}</p>
                 <div className="mt-8 w-12 h-1 bg-[#D02020]"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
