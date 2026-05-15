'use client';

import Image from 'next/image';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { ShoppingCart, Search, SlidersHorizontal, Check, Eye, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [addedItems, setAddedItems] = useState<Array<string | number>>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const toggleWishlist = (bookId: string) => {
    setWishlistItems((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const filteredBooks = books.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q));
  }).sort((a, b) => {
    if (sortBy === 'price-low') return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === 'price-high') return parsePrice(b.price) - parsePrice(a.price);
    return 0;
  });

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
              suppressHydrationWarning
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 rounded-full bg-botanical-clay/10 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
            />
          </div>
          <BauhausButton suppressHydrationWarning variant="outline" className="p-3 w-12 h-12 flex items-center justify-center" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal suppressHydrationWarning className="w-4 h-4" />
          </BauhausButton>
        </div>
      </header>

      {showFilters && (
        <div className="flex items-center gap-3 p-4 bg-botanical-clay/10 rounded-2xl border border-border/40 -mt-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-botanical-sage">Sort:</span>
          {(['newest', 'price-low', 'price-high'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                sortBy === opt
                  ? 'bg-botanical-forest text-white'
                  : 'bg-white border border-border text-botanical-forest/60'
              }`}
            >
              {opt === 'newest' ? 'Newest' : opt === 'price-low' ? 'Low Price' : 'High Price'}
            </button>
          ))}
        </div>
      )}

      {loading ? <div className="text-sm text-botanical-forest/60">Loading books...</div> : null}
      {error ? <div className="text-sm text-red-500">{error}</div> : null}
      {!loading && !error && filteredBooks.length === 0 ? (
        <div className="text-sm text-botanical-forest/60">No books match your search.</div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filteredBooks.map((book, i) => (
          <div key={book.id} className="group">
            <div className="relative rounded-[32px] bg-white border border-border/40 overflow-hidden transition-all duration-500 hover:shadow-lg hover:-translate-y-1.5">
              <div className="aspect-[3/4] relative overflow-hidden bg-botanical-clay/10">
                <Image
                  src={book.coverImage || PlaceHolderImages[i % PlaceHolderImages.length].imageUrl}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleWishlist(book.id)}
                      className="p-2.5 rounded-xl bg-botanical-clay/10 text-botanical-forest hover:bg-botanical-clay/20 transition-colors"
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${wishlistItems.includes(book.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => router.push(`/shop/${book.id}`)}
                      className="p-2.5 rounded-xl bg-botanical-clay/10 text-botanical-forest hover:bg-botanical-clay/20 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(book)}
                      className="sm:hidden p-2.5 rounded-xl bg-botanical-clay/20 text-botanical-forest hover:bg-botanical-clay/40 transition-colors"
                      title="Add to Cart"
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
          </div>
        ))}
      </div>
    </div>
  );
}
