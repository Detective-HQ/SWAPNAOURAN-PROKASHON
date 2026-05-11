import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, ShieldCheck, Zap, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';

export default function EbooksPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const api = useApi();
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEbooks();
  }, [api]);

  const fetchEbooks = async () => {
    try {
      const res = await api.get('/books?type=EBOOK&limit=100');
      setEbooks(res.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch ebooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (book: any) => {
    const price = typeof book.price === 'number' ? book.price : parseFloat(String(book.price).replace(/,/g, ''));
    addItem({
      id: book.id,
      title: book.title,
      author: 'Swapno Uran Prakashan',
      price: isNaN(price) ? 0 : price,
      image: book.coverImage || PlaceHolderImages[0].imageUrl,
    });
    router.push('/dashboard/orders');
  };

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
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-black" />
              </div>
            ) : ebooks.length === 0 ? (
              <div className="col-span-full text-center py-20 font-black uppercase text-2xl border-4 border-black border-dashed">
                NO EBOOKS AVAILABLE YET
              </div>
            ) : (
              ebooks.map((ebook, i) => (
                <BauhausCard key={ebook.id} decorationColor="blue">
                  <div className="aspect-[4/5] relative mb-6 border-2 border-black group overflow-hidden bg-white">
                    <Image 
                      src={ebook.coverImage || PlaceHolderImages[i % PlaceHolderImages.length].imageUrl} 
                      alt={ebook.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      data-ai-hint="digital book cover"
                    />
                    <div className="absolute inset-0 bg-[#1040C0]/20 mix-blend-multiply"></div>
                  </div>
                  <h2 className="text-xl font-black mb-6">{ebook.title}</h2>
                  <div className="flex justify-between items-center">
                    <span className="text-3xl font-black">₹{ebook.price}</span>
                    <BauhausButton variant="terracotta" size="sm" onClick={() => handleBuyNow(ebook)}>
                      BUY NOW
                    </BauhausButton>
                  </div>
                </BauhausCard>
              ))
            )}
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
