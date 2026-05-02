'use client';

import Image from 'next/image';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { ShoppingCart, Search, SlidersHorizontal, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

type Book = {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  coverImage?: string;
};

export default function ShopPage() {
  const { addItem } = useCart();
  const api = useApi();
  const [addedItems, setAddedItems] = useState<Array<string | number>>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchBooks = async () => {
      try {
        const response = await api.get('/books?type=PHYSICAL&limit=100');
        if (!mounted) return;
        setBooks(response?.data?.items || []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load books');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBooks();
    return () => {
      mounted = false;
    };
  }, [api]);

  const parsePrice = (price: number | string) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/,/g, ''));
  };

  const handleAddToCart = (book: Book) => {
    const parsedPrice = parsePrice(book.price);
    if (isNaN(parsedPrice)) {
      console.error(`Invalid price for book ${book.id}: ${book.price}`);
      return;
    }

    addItem({
      id: book.id,
      title: book.title,
      author: 'Swapno Uran Prakashan',
      price: parsedPrice,
      image: book.coverImage || PlaceHolderImages[0].imageUrl,
    });

    setAddedItems((prev) => [...prev, book.id]);
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((id) => id !== book.id));
    }, 2000);
  };

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="flex flex-col md:flex-row justify-between items-end gap-8 pb-8 border-b border-border/40">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
            <div className="w-8 h-px bg-botanical-sage" />
            Curated Treasures
          </div>
          <h1 className="text-5xl font-headline font-bold text-botanical-forest italic">Physical <span className="not-italic">Collection</span></h1>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-72">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-botanical-forest/30 w-4 h-4" />
            <input
              type="text"
              placeholder="Search library..."
              className="w-full pl-12 pr-6 py-3.5 rounded-full bg-botanical-clay/10 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
            />
          </div>
          <BauhausButton variant="outline" className="p-3 w-12 h-12 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </BauhausButton>
        </div>
      </header>

      {loading ? <div className="text-sm text-botanical-forest/60">Loading books...</div> : null}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
      {!loading && !error && books.length === 0 ? (
        <div className="text-sm text-botanical-forest/60">No physical books are available right now.</div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {books.map((book, i) => (
          <div key={book.id} className={i % 2 !== 0 ? 'md:translate-y-8' : ''}>
            <BauhausCard className="h-full flex flex-col group">
              <div className="aspect-[3/4] relative mb-6 rounded-3xl overflow-hidden shadow-sm">
                <Image
                  src={book.coverImage || PlaceHolderImages[i % PlaceHolderImages.length].imageUrl}
                  alt={book.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  data-ai-hint="book cover"
                />
              </div>
              <h2 className="text-xl font-headline font-bold text-botanical-forest mb-1">{book.title}</h2>
              <p className="text-botanical-sage font-bold text-[10px] uppercase tracking-widest mb-4 italic">Swapno Uran Prakashan</p>
              <p className="text-sm text-botanical-forest/60 font-medium mb-8 flex-grow leading-relaxed">
                {book.description || 'Curated physical edition from our collection.'}
              </p>
              <div className="flex justify-between items-center pt-4 border-t border-border/40">
                <span className="text-xl font-bold italic text-botanical-forest">₹{parsePrice(book.price).toLocaleString()}</span>
                <BauhausButton
                  type="button"
                  variant="terracotta"
                  size="sm"
                  className="px-5"
                  onClick={() => handleAddToCart(book)}
                >
                  {addedItems.includes(book.id) ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <ShoppingCart className="w-4 h-4 mr-2" />
                  )}
                  {addedItems.includes(book.id) ? 'ADDED' : 'ADD'}
                </BauhausButton>
              </div>
            </BauhausCard>
          </div>
        ))}
      </div>
    </div>
  );
}
