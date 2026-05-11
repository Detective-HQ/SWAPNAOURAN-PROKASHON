'use client';

import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { ShoppingCart, Search, SlidersHorizontal, Check, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';

type Book = {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  coverImage?: string;
  type: string;
};

export default function ShopPage() {
  const { addItem } = useCart();
  const api = useApi();
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    let mounted = true;
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books?type=PHYSICAL&limit=100');
        if (!mounted) return;
        setBooks(response?.data?.items || []);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load books:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBooks();
    return () => { mounted = false; };
  }, [api]);

  const parsePrice = (price: number | string) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/,/g, ''));
  };

  const filteredBooks = useMemo(() => {
    let result = [...books];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    }
    switch (sortBy) {
      case 'price-low': result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
      case 'price-high': result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
      default: result.sort((a, b) => String(a.id).localeCompare(String(b.id))); break;
    }
    return result;
  }, [books, searchQuery, sortBy]);

  const handleAddToCart = (book: Book) => {
    const parsedPrice = parsePrice(book.price);
    if (isNaN(parsedPrice)) return;
    addItem({
      id: book.id,
      title: book.title,
      author: 'Swapno Uran Prakashan',
      price: parsedPrice,
      image: book.coverImage || '',
    });
    setAddedItems((prev) => [...prev, book.id]);
    setTimeout(() => {
      setAddedItems((prev) => prev.filter((id) => id !== book.id));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <header className="py-24 px-6 lg:px-12 bg-white border-b border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
              <div className="w-12 h-px bg-botanical-sage" />
              The Collection
            </div>
            <h1 className="text-6xl font-headline font-bold text-botanical-forest leading-none">Curated <br /> <span className="italic font-normal">Physical Library</span></h1>
          </div>

          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-botanical-forest/30 w-5 h-5" />
              <input
                type="text"
                placeholder="Find your story..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 rounded-full bg-botanical-clay/10 border border-border font-medium focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
              />
            </div>
            <BauhausButton variant="ghost" className="p-5 border border-border" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-5 h-5" />
            </BauhausButton>
          </div>
        </div>

        {showFilters && (
          <div className="max-w-7xl mx-auto mt-8 flex items-center gap-4 p-4 bg-botanical-clay/10 rounded-2xl border border-border/40">
            <span className="text-xs font-bold uppercase tracking-widest text-botanical-sage">Sort by:</span>
            {(['newest', 'price-low', 'price-high'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortBy(opt)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  sortBy === opt
                    ? 'bg-botanical-forest text-white'
                    : 'bg-white border border-border text-botanical-forest/60 hover:text-botanical-forest'
                }`}
              >
                {opt === 'newest' ? 'Newest' : opt === 'price-low' ? 'Price: Low' : 'Price: High'}
              </button>
            ))}
            <button onClick={() => setShowFilters(false)} className="ml-auto p-2 text-botanical-forest/40 hover:text-botanical-forest">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center text-botanical-forest/60 py-20">Loading collection...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center text-botanical-forest/40 py-20">
              <p className="text-xl font-medium">No books found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10">
              {filteredBooks.map((book) => (
                <div key={book.id} className="group">
                  <div className="relative rounded-[32px] bg-white border border-border/40 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1.5">
                    <div className="aspect-[3/4] relative overflow-hidden bg-botanical-clay/10">
                      <Image
                        src={book.coverImage || '/placeholder-book.jpg'}
                        alt={book.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                        data-ai-hint="book cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                        <button
                          onClick={() => handleAddToCart(book)}
                          className="w-full py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-botanical-forest font-bold text-[11px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                          {addedItems.includes(book.id) ? (
                            <><Check className="w-4 h-4" /> Added</>
                          ) : (
                            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-base font-headline font-bold text-botanical-forest leading-tight line-clamp-2">{book.title}</h3>
                        <p className="text-[10px] font-medium text-botanical-sage uppercase tracking-widest mt-1 italic">Swapno Uran Prakashan</p>
                      </div>
                      {book.description && (
                        <p className="text-xs text-botanical-forest/50 leading-relaxed line-clamp-2">{book.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border/10">
                        <span className="text-xl font-headline font-bold text-botanical-terracotta">₹{parsePrice(book.price).toLocaleString()}</span>
                        <button
                          onClick={() => handleAddToCart(book)}
                          className="sm:hidden p-2.5 rounded-xl bg-botanical-clay/20 text-botanical-forest hover:bg-botanical-clay/40 transition-colors"
                        >
                          {addedItems.includes(book.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
