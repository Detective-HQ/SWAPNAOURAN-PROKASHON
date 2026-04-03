import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingCart, Search, Filter } from 'lucide-react';

export default function ShopPage() {
  // Mock data for shop
  const books = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Volume ${i + 1}: The Modern Era`,
    author: i % 2 === 0 ? 'Moholy-Nagy' : 'Herbert Bayer',
    price: (19.99 + i * 2).toFixed(2),
    publisher: 'Bauhaus Press',
    image: PlaceHolderImages[i % PlaceHolderImages.length].imageUrl
  }));

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      <Navbar />
      
      <header className="bg-white border-b-4 border-black py-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <h1 className="text-6xl font-black mb-4">THE SHOP</h1>
            <p className="text-xl font-bold text-muted-foreground uppercase tracking-widest">Physical collections only.</p>
          </div>
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="SEARCH TITLES..." 
                className="w-full pl-12 pr-4 py-4 border-4 border-black font-black uppercase tracking-wider focus:outline-none"
              />
            </div>
            <BauhausButton variant="yellow" size="lg"><Filter /></BauhausButton>
          </div>
        </div>
      </header>

      <main className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {books.map((book) => (
              <BauhausCard key={book.id} decorationColor={book.id % 3 === 0 ? 'red' : book.id % 3 === 1 ? 'blue' : 'yellow'}>
                <div className="aspect-[3/4] relative mb-6 border-2 border-black overflow-hidden group">
                  <Image 
                    src={book.image} 
                    alt={book.title} 
                    fill 
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                    data-ai-hint="book cover"
                  />
                  <div className="absolute top-0 left-0 bg-[#D02020] text-white px-3 py-1 font-black text-xs border-b-2 border-r-2 border-black">
                    #{book.id}
                  </div>
                </div>
                <h2 className="text-xl font-black leading-tight mb-1">{book.title}</h2>
                <p className="text-muted-foreground font-bold text-xs mb-2 uppercase tracking-tighter">{book.author} | {book.publisher}</p>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-2xl font-black">${book.price}</span>
                  <BauhausButton variant="black" size="sm" shape="square">
                    <ShoppingCart className="w-4 h-4 mr-2" /> ADD
                  </BauhausButton>
                </div>
              </BauhausCard>
            ))}
          </div>
          
          <div className="mt-20 text-center">
            <BauhausButton variant="outline" size="lg" className="px-16">Load More Titles</BauhausButton>
          </div>
        </div>
      </main>
    </div>
  );
}
