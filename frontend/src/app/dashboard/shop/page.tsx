'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { ShoppingCart, Search, SlidersHorizontal, Check, Eye, Heart, BookOpen, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const PreviewPdfViewer = dynamic(
  () => import('@/components/ebooks/preview-pdf-viewer').then(m => m.PreviewPdfViewer),
  { ssr: false }
);

type Book = {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  type: 'PHYSICAL' | 'EBOOK';
  coverImage?: string;
  fileUrl?: string;
};

export default function ShopPage() {
  const { addItem } = useCart();
  const api = useApi();
  const router = useRouter();
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'PHYSICAL' | 'EBOOK'>('ALL');
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchBooks = async () => {
      try {
        const response = await api.get('/books?limit=100');
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
    return () => { mounted = false; };
  }, [api]);

  const parsePrice = (price: number | string) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/,/g, ''));
  };

  const handleAddToCart = (book: Book) => {
    const parsedPrice = parsePrice(book.price);
    if (isNaN(parsedPrice)) return;
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

  const handleBuyNow = (book: Book) => {
    handleAddToCart(book);
    router.push('/dashboard/orders');
  };

  const toggleWishlist = (bookId: string) => {
    setWishlistItems((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handlePreview = async (book: Book) => {
    setPreviewBook(book);
    try {
      const res = await api.get(`/ebooks/${book.id}/preview`);
      if (res.data?.streamUrl) {
        setPreviewUrl(res.data.streamUrl);
      }
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewBook(null);
    }
  };

  const filteredBooks = books
    .filter((b) => {
      if (typeFilter !== 'ALL' && b.type !== typeFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return parsePrice(a.price) - parsePrice(b.price);
      if (sortBy === 'price-high') return parsePrice(b.price) - parsePrice(a.price);
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 pb-6 border-b border-border/40">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
            <div className="w-8 h-px bg-botanical-sage" />
            Curated Collection
          </div>
          <h1 className="text-4xl font-headline font-bold text-botanical-forest">
            Book <span className="italic font-normal text-botanical-terracotta">Shop</span>
          </h1>
        </div>

        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-botanical-forest/30 w-4 h-4" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-botanical-clay/10 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 transition-all"
            />
          </div>
          <button
            suppressHydrationWarning
            onClick={() => setShowFilters(!showFilters)}
            className="p-3 w-11 h-11 flex items-center justify-center rounded-lg border border-border hover:bg-botanical-clay/10 transition-colors"
          >
            <SlidersHorizontal suppressHydrationWarning className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'PHYSICAL', 'EBOOK'] as const).map((t) => (
          <button
            key={t}
            suppressHydrationWarning
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              typeFilter === t
                ? 'bg-botanical-forest text-white'
                : 'bg-botanical-clay/10 border border-border text-botanical-forest/60 hover:bg-botanical-clay/20'
            }`}
          >
            {t === 'ALL' ? 'All Books' : t === 'PHYSICAL' ? 'Physical' : 'Ebook'}
          </button>
        ))}
      </div>

      {/* Sort Filters */}
      {showFilters && (
        <div className="flex items-center gap-3 p-4 bg-botanical-clay/10 rounded-lg border border-border/40 -mt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-botanical-sage">Sort:</span>
          {(['newest', 'price-low', 'price-high'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setSortBy(opt)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
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

      {/* Loading / Error / Empty */}
      {loading && (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" />
        </div>
      )}
      {error && <div className="text-sm text-red-500">{error}</div>}
      {!loading && !error && filteredBooks.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border/40 rounded-lg">
          <p className="text-botanical-forest/60 font-bold uppercase tracking-widest text-sm">No books match your search.</p>
        </div>
      )}

      {/* Book Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredBooks.map((book, i) => (
          <div key={book.id} className="group">
            <div className="relative rounded-xl bg-white border border-border/40 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              {/* Cover Image */}
              <div className="aspect-[3/4] relative overflow-hidden bg-botanical-clay/10">
                <Image
                  src={book.coverImage || PlaceHolderImages[i % PlaceHolderImages.length].imageUrl}
                  alt={book.title}
                  fill
                  className="object-cover transition-all duration-500 group-hover:scale-105"
                  data-ai-hint="book cover"
                />
                {/* Type Badge */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                  book.type === 'EBOOK'
                    ? 'bg-blue-600 text-white'
                    : 'bg-botanical-forest text-white'
                }`}>
                  {book.type === 'EBOOK' ? 'Ebook' : 'Physical'}
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                  <button
                    onClick={() => handleAddToCart(book)}
                    className="w-full py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-botanical-forest font-bold text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {addedItems.includes(book.id) ? (
                      <><Check className="w-3.5 h-3.5" /> Added</>
                    ) : (
                      <><ShoppingCart className="w-3.5 h-3.5" /> Add to Cart</>
                    )}
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="text-sm font-headline font-bold text-botanical-forest leading-tight line-clamp-2">{book.title}</h3>
                  <p className="text-[9px] font-medium text-botanical-sage uppercase tracking-widest mt-0.5 italic">Swapno Uran Prakashan</p>
                </div>

                {book.description && (
                  <p className="text-[11px] text-botanical-forest/50 leading-relaxed line-clamp-2">{book.description}</p>
                )}

                {/* Price + Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border/10">
                  <span className="text-lg font-headline font-bold text-botanical-terracotta">₹{parsePrice(book.price).toLocaleString()}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleWishlist(book.id)}
                      className="p-2 rounded-lg bg-botanical-clay/10 text-botanical-forest hover:bg-botanical-clay/20 transition-colors"
                      title="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 transition-colors ${wishlistItems.includes(book.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button
                      onClick={() => router.push(`/shop/${book.id}`)}
                      className="p-2 rounded-lg bg-botanical-clay/10 text-botanical-forest hover:bg-botanical-clay/20 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {book.type === 'EBOOK' && book.fileUrl && (
                      <button
                        onClick={() => handlePreview(book)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Preview"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Buy Now */}
                <button
                  onClick={() => handleBuyNow(book)}
                  className="w-full py-2.5 rounded-lg bg-botanical-forest text-white font-bold text-[10px] uppercase tracking-widest hover:bg-botanical-forest/90 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview PDF Viewer Overlay */}
      {previewBook && previewUrl && (
        <PreviewPdfViewer
          url={previewUrl}
          title={previewBook.title}
          price={parsePrice(previewBook.price)}
          bookId={previewBook.id}
          onClose={() => {
            setPreviewBook(null);
            setPreviewUrl(null);
          }}
        />
      )}
    </div>
  );
}
