'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { SecurePdfViewer } from '@/components/ebooks/secure-pdf-viewer';

export default function EbooksPage() {
  const [readingEbook, setReadingEbook] = useState<any | null>(null);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    let mounted = true;

    const fetchEbooks = async () => {
      try {
        const res = await api.get('/ebooks');
        if (!mounted) return;

        const items = Array.isArray(res?.data)
          ? res.data
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

  const handleReadNow = async (book: any) => {
    try {
      const res = await api.get(`/ebooks/${book.id}/read`);
      const payload = (res as any)?.data ?? res;
      if (payload && payload.streamUrl) {
        setReadingEbook({
          id: book.id,
          title: book.title,
          url: payload.streamUrl
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to open ebook. Ensure you have access.');
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
          <div className="w-8 h-px bg-botanical-sage" />
          Digital Library
        </div>
        <h1 className="text-5xl font-headline font-bold text-botanical-forest">My <span className="italic font-normal text-botanical-terracotta">Ebooks</span></h1>
        <p className="text-botanical-forest/60 font-medium max-w-xl">
          Your purchased digital books. Click "Read Now" to open the full book.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" />
        </div>
      ) : ebooks.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-border/40 rounded-[40px]">
          <p className="text-botanical-forest/60 font-bold uppercase tracking-widest text-sm">No e-books in your collection yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ebooks.map((ebook, i) => (
            <BauhausCard key={ebook.id} className="group">
              <div className="aspect-[3/4] relative mb-6 rounded-2xl overflow-hidden arch-image shadow-md">
                <Image
                  src={ebook.coverImage || PlaceHolderImages[i % PlaceHolderImages.length].imageUrl}
                  alt={ebook.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  data-ai-hint="digital book cover"
                />
                <div className="absolute inset-0 bg-botanical-forest/20 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-lg font-headline font-bold text-botanical-forest mb-1">{ebook.title}</h3>
              <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest mb-6 italic">Swapno Uran Prakashan</p>
              <div className="flex justify-end pt-4 border-t border-border/40">
                <BauhausButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleReadNow(ebook)}
                >
                  READ NOW
                </BauhausButton>
              </div>
            </BauhausCard>
          ))}
        </div>
      )}

      {/* Secure PDF Viewer Overlay */}
      {readingEbook && (
        <SecurePdfViewer
          url={readingEbook.url}
          title={readingEbook.title}
          onClose={() => setReadingEbook(null)}
        />
      )}
    </div>
  );
}
