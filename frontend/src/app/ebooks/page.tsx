'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, ShieldCheck, Zap, Loader2, Eye } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';

const PreviewPdfViewer = dynamic(() => import('@/components/ebooks/preview-pdf-viewer'), { ssr: false });

export default function EbooksPage() {
  const router = useRouter();
  const { addItem } = useCart();
  const api = useApi();
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewBook, setPreviewBook] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchEbooks = async () => {
      try {
        const res = await api.get('/books?type=EBOOK&limit=100');
        if (!mounted) return;
        const items = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray((res as any)?.items)
            ? (res as any).items
            : [];
        setEbooks(items);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to fetch ebooks:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchEbooks();

    return () => {
      mounted = false;
    };
  }, []);

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

  const handlePreview = async (book: any) => {
    setPreviewBook(book);
    try {
      const res = await api.get('/ebooks/' + book.id + '/preview');
      if (res.data?.streamUrl) {
        setPreviewUrl(res.data.streamUrl);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewBook(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0]">
      <Navbar />
      
      <header className="bg-[#F0C020] border-b-4 border-black py-16 md:py-24 px-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 md:p-12 opacity-10">
           <div className="h-56 w-56 rounded-full bg-black md:h-96 md:w-96"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="mb-6 text-5xl font-black sm:text-6xl lg:text-9xl">EBOOKS</h1>
          <p className="max-w-2xl text-base font-bold uppercase tracking-widest sm:text-xl md:text-2xl">High-quality digital blueprints for the modern reader. Pure information. Zero weight.</p>
        </div>
      </header>

      <section className="bg-white py-12 px-4 border-b-4 border-black">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:gap-12 sm:justify-center">
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
                  <Link href={`/shop/${ebook.id}`}>
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
                  </Link>
                  <Link href={`/shop/${ebook.id}`}>
                    <h2 className="text-xl font-black mb-6 hover:text-[#1040C0] transition-colors">{ebook.title}</h2>
                  </Link>
                  <div className="flex flex-wrap gap-2 justify-between items-center">
                    <span className="text-3xl font-black">₹{ebook.price}</span>
                    <div className="flex gap-2">
                      <BauhausButton variant="outline" size="sm" onClick={() => router.push(`/shop/${ebook.id}`)}>
                        <Eye className="w-4 h-4" />
                      </BauhausButton>
                      {ebook.fileUrl && (
                        <BauhausButton variant="secondary" size="sm" onClick={() => handlePreview(ebook)}>
                          <BookOpen className="w-4 h-4" />
                        </BauhausButton>
                      )}
                      <BauhausButton variant="terracotta" size="sm" onClick={() => handleBuyNow(ebook)}>
                        BUY NOW
                      </BauhausButton>
                    </div>
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

      {previewBook && previewUrl && (
        <PreviewPdfViewer
          url={previewUrl}
          title={previewBook.title}
          price={typeof previewBook.price === 'number' ? previewBook.price : parseFloat(String(previewBook.price).replace(/,/g, ''))}
          bookId={previewBook.id}
          onClose={() => { setPreviewBook(null); setPreviewUrl(null); }}
        />
      )}
    </div>
  );
}
