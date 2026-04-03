import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, ShieldCheck, Zap } from 'lucide-react';

export default function EbooksPage() {
  const ebooks = [
    { id: 1, title: 'Digital Typography', price: '$4.99', image: PlaceHolderImages[0].imageUrl },
    { id: 2, title: 'Screen Modernism', price: '$3.50', image: PlaceHolderImages[1].imageUrl },
    { id: 3, title: 'Pixels as Points', price: '$5.99', image: PlaceHolderImages[2].imageUrl },
    { id: 4, title: 'Vector Bauhaus', price: '$4.25', image: PlaceHolderImages[0].imageUrl },
  ];

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      <Navbar />
      
      <header className="bg-[#F0C020] border-b-4 border-black py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
           <div className="w-96 h-96 bg-black rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-6xl lg:text-9xl font-black mb-6">EBOOKS</h1>
          <p className="text-2xl font-bold uppercase tracking-widest max-w-2xl">High-quality digital blueprints for the modern reader. Pure information. Zero weight.</p>
        </div>
      </header>

      <section className="bg-white py-12 px-4 border-b-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-12 justify-center">
           <div className="flex items-center gap-4">
              <div className="bg-[#D02020] p-3 border-2 border-black rounded-full text-white"><Zap className="w-6 h-6" /></div>
              <span className="font-black text-sm uppercase">Instant Delivery</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-[#1040C0] p-3 border-2 border-black rounded-none text-white"><ShieldCheck className="w-6 h-6" /></div>
              <span className="font-black text-sm uppercase">Secure PDF Viewer</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-black p-3 border-2 border-black rounded-none rotate-45 text-white"><BookOpen className="w-6 h-6 -rotate-45" /></div>
              <span className="font-black text-sm uppercase">Device Sync</span>
           </div>
        </div>
      </section>

      <main className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {ebooks.map((ebook) => (
              <BauhausCard key={ebook.id} decorationShape="triangle" decorationColor="blue">
                <div className="aspect-[4/5] relative mb-6 border-2 border-black group overflow-hidden">
                  <Image 
                    src={ebook.image} 
                    alt={ebook.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    data-ai-hint="digital book cover"
                  />
                  <div className="absolute inset-0 bg-[#1040C0]/20 mix-blend-multiply"></div>
                </div>
                <h2 className="text-xl font-black mb-6">{ebook.title}</h2>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-black">{ebook.price}</span>
                  <BauhausButton variant="red" size="sm">BUY NOW</BauhausButton>
                </div>
              </BauhausCard>
            ))}
          </div>
        </div>
      </main>

      <section className="bg-black text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-4xl lg:text-6xl font-black mb-8 text-[#F0C020]">SECURE DIGITAL DELIVERY</h2>
           <p className="text-lg font-medium text-muted-foreground leading-relaxed">
             Our proprietary reader ensures that authors are protected while you enjoy a seamless reading experience across all devices. No downloads required—just purchase and unlock instantly.
           </p>
        </div>
      </section>
    </div>
  );
}
