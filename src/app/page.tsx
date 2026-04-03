import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { BauhausButton, GeometricShape, SectionDivider } from '@/components/bauhaus/bauhaus-primitives';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { ArrowRight, Star, ShoppingCart, Zap, ShieldCheck, BookOpen } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const featuredBooks = [
    { id: 1, title: 'The Silent Modernist', author: 'L. Van der Rohe', price: '$24.99', image: PlaceHolderImages[0].imageUrl },
    { id: 2, title: 'Primary Colors', author: 'K. Malevich', price: '$19.99', image: PlaceHolderImages[1].imageUrl },
    { id: 3, title: 'Form & Function', author: 'W. Gropius', price: '$32.00', image: PlaceHolderImages[2].imageUrl },
    { id: 4, title: 'Grid Theory', author: 'J. Müller-Brockmann', price: '$28.50', image: PlaceHolderImages[0].imageUrl },
  ];

  const bestSellers = featuredBooks.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b-4 border-black">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] lg:min-h-[800px]">
            <div className="bg-[#F0F0F0] p-8 lg:p-24 flex flex-col justify-center relative">
              <div className="absolute top-10 left-10 opacity-20 hidden lg:block">
                <GeometricShape type="square" color="red" className="w-32 h-32 rotate-12" />
              </div>
              <h1 className="text-6xl lg:text-9xl font-black mb-8 relative z-10">
                DISCOVER STORIES <br /><span className="text-[#D02020]">THAT MATTER</span>
              </h1>
              <p className="text-xl font-medium mb-10 max-w-lg leading-relaxed uppercase tracking-wide">
                Explore a curated selection of books from emerging publishers and modernist authors who push the boundaries of storytelling.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop">
                  <BauhausButton variant="red" size="lg">Explore Books</BauhausButton>
                </Link>
                <Link href="/ebooks">
                  <BauhausButton variant="outline" size="lg">Browse Ebooks</BauhausButton>
                </Link>
              </div>
            </div>
            <div className="bg-[#1040C0] p-12 lg:p-24 flex items-center justify-center relative bauhaus-grid-dots overflow-hidden border-l-0 lg:border-l-4 border-black">
               <div className="relative z-10 grid grid-cols-2 gap-4 w-full h-full max-w-md aspect-square">
                  <div className="bg-[#D02020] border-4 border-black bauhaus-shadow-md"></div>
                  <div className="bg-white rounded-full border-4 border-black bauhaus-shadow-md"></div>
                  <div className="bg-[#F0C020] border-4 border-black bauhaus-shadow-md rotate-45"></div>
                  <div className="bg-black flex items-center justify-center">
                    <GeometricShape type="triangle" color="white" className="scale-150 rotate-90" />
                  </div>
               </div>
               {/* Decorative floating shapes */}
               <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400 rounded-full opacity-50"></div>
            </div>
          </div>
        </section>

        {/* FEATURED BOOKS - HORIZONTAL SCROLL */}
        <section className="py-24 px-4 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-5xl lg:text-7xl font-black">Featured Books</h2>
                <div className="w-32 h-6 bg-[#1040C0] mt-4"></div>
              </div>
              <div className="hidden sm:block">
                <Link href="/shop">
                  <BauhausButton variant="outline" shape="pill">View All</BauhausButton>
                </Link>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-12 pb-12 scrollbar-hide snap-x">
              {featuredBooks.map((book) => (
                <div key={book.id} className="min-w-[320px] lg:min-w-[400px] snap-start">
                  <BauhausCard decorationShape={book.id % 2 === 0 ? 'circle' : 'square'} decorationColor="blue">
                    <div className="aspect-[2/3] relative mb-8 border-4 border-black overflow-hidden bg-muted group">
                      <Image 
                        src={book.image} 
                        alt={book.title} 
                        fill 
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        data-ai-hint="book cover"
                      />
                      <div className="absolute bottom-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform">
                         <BauhausButton variant="black" shape="pill" size="sm">Quick View</BauhausButton>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black leading-tight mb-2 uppercase">{book.title}</h3>
                    <p className="text-muted-foreground font-bold text-xs mb-6 uppercase tracking-widest">{book.author}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-3xl font-black">{book.price}</span>
                      <BauhausButton variant="yellow" size="sm">Details</BauhausButton>
                    </div>
                  </BauhausCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ADVERTISEMENT SECTION - RED BLOCK */}
        <section className="bg-[#D02020] text-white py-32 px-4 border-b-4 border-black overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-black/10 -skew-x-12 transform translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            <div>
              <h2 className="text-6xl lg:text-9xl font-black mb-8 leading-[0.85]">THE MASTER'S COLLECTION</h2>
              <p className="text-2xl font-bold mb-12 leading-relaxed uppercase tracking-wide max-w-xl">
                Exclusive limited editions and signed copies from the vanguard of 21st-century literature. Hand-bound and numbered.
              </p>
              <BauhausButton variant="outline" className="text-black bg-white" size="lg">Join Collection</BauhausButton>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border-4 border-black h-64 bauhaus-shadow-md p-6 flex flex-col justify-end">
                <span className="text-black font-black text-6xl">50+</span>
                <span className="text-black font-black text-xs uppercase tracking-widest">Rare Editions</span>
              </div>
              <div className="bg-[#F0C020] border-4 border-black h-64 bauhaus-shadow-md rotate-6"></div>
              <div className="bg-[#1040C0] border-4 border-black h-64 bauhaus-shadow-md -rotate-3"></div>
              <div className="bg-black border-4 border-white h-64 bauhaus-shadow-md flex items-center justify-center">
                 <Star className="text-white w-24 h-24 fill-current animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* BESTSELLERS SECTION - GRID */}
        <section className="py-24 px-4 bg-white border-b-4 border-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-6xl font-black">BESTSELLERS</h2>
              <div className="w-48 h-4 bg-[#F0C020] mx-auto mt-4"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {bestSellers.map((book, idx) => (
                <BauhausCard key={book.id} decorationColor={idx === 0 ? "red" : idx === 1 ? "blue" : "yellow"}>
                  <div className="relative">
                    <div className="absolute -top-10 -left-10 bg-black text-white w-16 h-16 flex items-center justify-center font-black text-3xl z-10">
                      0{idx + 1}
                    </div>
                    <div className="aspect-[3/4] relative mb-6 border-4 border-black overflow-hidden grayscale hover:grayscale-0 transition-all">
                       <Image src={book.image} alt={book.title} fill className="object-cover" />
                    </div>
                    <h3 className="text-xl font-black mb-2">{book.title}</h3>
                    <div className="flex justify-between items-center">
                       <span className="text-2xl font-black">{book.price}</span>
                       <BauhausButton variant="black" size="sm"><ShoppingCart size={16} /></BauhausButton>
                    </div>
                  </div>
                </BauhausCard>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PLANS */}
        <section className="py-24 px-4 bg-[#F0F0F0] border-b-4 border-black bauhaus-grid-dots">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-5xl font-black uppercase">Membership Plans</h2>
          </div>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <BauhausCard decorationColor="yellow">
              <h3 className="text-2xl font-black mb-4">BASIC</h3>
              <p className="text-5xl font-black mb-8">$9.99<span className="text-lg font-bold text-muted-foreground">/mo</span></p>
              <ul className="space-y-4 mb-8 font-bold text-sm uppercase tracking-wider">
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#F0C020]" /> 1 physical book / mo</li>
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#F0C020]" /> Unlimited Ebooks</li>
                <li className="flex items-center gap-4 text-muted-foreground opacity-50 line-through"><Zap className="w-5 h-5" /> Priority Delivery</li>
              </ul>
              <BauhausButton variant="outline" className="w-full">Select Plan</BauhausButton>
            </BauhausCard>

            <BauhausCard decorationColor="red" className="md:-translate-y-8 bg-white z-10 ring-8 ring-[#D02020] bauhaus-shadow-lg">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#D02020] text-white px-6 py-2 font-black text-sm uppercase tracking-widest border-4 border-black">Most Popular</div>
              <h3 className="text-2xl font-black mb-4">PREMIUM</h3>
              <p className="text-5xl font-black mb-8">$24.99<span className="text-lg font-bold text-muted-foreground">/mo</span></p>
              <ul className="space-y-4 mb-8 font-bold text-sm uppercase tracking-wider">
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#D02020]" /> 3 physical books / mo</li>
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#D02020]" /> Unlimited Ebooks</li>
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#D02020]" /> Priority Delivery</li>
              </ul>
              <BauhausButton variant="red" className="w-full">Select Plan</BauhausButton>
            </BauhausCard>

            <BauhausCard decorationColor="blue">
              <h3 className="text-2xl font-black mb-4">COLLECTOR</h3>
              <p className="text-5xl font-black mb-8">$49.99<span className="text-lg font-bold text-muted-foreground">/mo</span></p>
              <ul className="space-y-4 mb-8 font-bold text-sm uppercase tracking-wider">
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#1040C0]" /> 5 physical books / mo</li>
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#1040C0]" /> Exclusive Prints</li>
                <li className="flex items-center gap-4"><Zap className="w-5 h-5 text-[#1040C0]" /> Free Global Shipping</li>
              </ul>
              <BauhausButton variant="blue" className="w-full">Select Plan</BauhausButton>
            </BauhausCard>
          </div>
        </section>

        {/* SUBSCRIPTION SECTION - YELLOW BLOCK */}
        <section className="py-32 px-4 bg-[#F0C020] border-b-4 border-black">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-6xl lg:text-8xl font-black mb-8 leading-none">JOIN OUR READER COMMUNITY</h2>
            <p className="text-xl font-bold mb-12 uppercase tracking-widest">Get the latest updates on new arrivals and exclusive publisher interviews.</p>
            <form className="flex flex-col sm:flex-row gap-0 group">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="flex-grow p-6 border-4 border-black bg-white font-black text-lg focus:outline-none placeholder:text-muted-foreground sm:border-r-0"
              />
              <BauhausButton variant="black" size="lg" className="whitespace-nowrap sm:border-l-0">Subscribe</BauhausButton>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#121212] text-white py-32 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex -space-x-3 mb-10">
              <GeometricShape type="circle" color="red" className="w-12 h-12 border-4 border-white" />
              <GeometricShape type="square" color="yellow" className="w-12 h-12 border-4 border-white rotate-12" />
              <GeometricShape type="triangle" color="blue" className="w-12 h-12" />
            </div>
            <h3 className="text-5xl font-black mb-8 tracking-tighter">SWAPNO URAN<br />PRAKASHAN</h3>
            <p className="text-muted-foreground text-xl leading-relaxed font-medium uppercase max-w-md tracking-wide">
              A constructivist bookstore dedicated to the physical beauty of literature. Every book is a building, and every story is a blueprint for a new world.
            </p>
          </div>
          <div>
            <h4 className="text-xl font-black mb-10 border-b-4 border-[#D02020] inline-block tracking-widest">NAVIGATE</h4>
            <ul className="space-y-6 font-bold text-sm tracking-widest text-muted-foreground">
              <li><Link href="/shop" className="hover:text-white transition-colors">SHOP BOOKS</Link></li>
              <li><Link href="/ebooks" className="hover:text-white transition-colors">EBOOKS</Link></li>
              <li><Link href="/photo-time" className="hover:text-white transition-colors">PHOTO TIME</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">OUR STORY</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-black mb-10 border-b-4 border-[#1040C0] inline-block tracking-widest">CONNECT</h4>
            <ul className="space-y-6 font-bold text-sm tracking-widest text-muted-foreground">
              <li>EMAIL: HELLO@SWAPNO.URAN</li>
              <li>PHONE: +880 123 456 789</li>
              <li>INSTA: @SWAPNO_URAN</li>
              <li>X: @SWAPNOURAN</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t-2 border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6 text-[10px] font-black text-muted-foreground tracking-[0.3em]">
          <span>&copy; 2024 SWAPNO URAN PRAKASHAN. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-12">
            <Link href="/privacy" className="hover:text-white">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-white">TERMS OF SERVICE</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
