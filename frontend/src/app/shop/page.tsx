'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { useUser } from '@clerk/nextjs';
import { ShoppingCart, Search, SlidersHorizontal, Check, X, BookOpen, Heart, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Book = {
  id: string;
  title: string;
  description?: string;
  price: number | string;
  mrp?: number | string;
  discountPercentage?: number | string;
  coverImage?: string;
  type: string;
  sampleChapterUrl?: string;
  authorName?: string;
  isbn?: string;
  pageCount?: number;
  bindingDetails?: string;
  weight?: string;
  stockQuantity?: number;
  copiesSold?: number;
  createdAt?: string;
};

const getBookMetaItems = (book: Book) => {
  const items: string[] = [];

  if (typeof book.copiesSold === 'number' && book.copiesSold > 0) items.push(`${book.copiesSold} sold`);
  if (typeof book.pageCount === 'number' && book.pageCount > 0) items.push(`${book.pageCount} pages`);
  if (book.bindingDetails) items.push(book.bindingDetails);
  if (book.weight) items.push(book.weight);
  if (book.isbn) items.push(`ISBN: ${book.isbn}`);

  return items;
};

export default function ShopPage() {
  const { addItem } = useCart();
  const api = useApi();
  const { isSignedIn } = useUser();
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'best-sellers' | 'price-low' | 'price-high'>('newest');
  const [wishlistLoading, setWishlistLoading] = useState<string[]>([]);

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
    return () => {
      mounted = false;
    };
  }, [api]);

  const parsePrice = (price: number | string) => {
    if (typeof price === 'number') return price;
    return parseFloat(String(price).replace(/,/g, ''));
  };

  const filteredBooks = useMemo(() => {
    const result = [...books];
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const searched = normalizedQuery
      ? result.filter(
          (book) =>
            book.title.toLowerCase().includes(normalizedQuery) ||
            (book.description && book.description.toLowerCase().includes(normalizedQuery)) ||
            (book.isbn && book.isbn.toLowerCase().includes(normalizedQuery))
        )
      : result;

    searched.sort((a, b) => {
      switch (sortBy) {
        case 'best-sellers':
          return (b.copiesSold || 0) - (a.copiesSold || 0);
        case 'price-low':
          return parsePrice(a.price) - parsePrice(b.price);
        case 'price-high':
          return parsePrice(b.price) - parsePrice(a.price);
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return searched;
  }, [books, searchQuery, sortBy]);

  useEffect(() => {
    if (!isSignedIn || books.length === 0) return;
    const ids = books.map((book) => book.id);
    Promise.all(
      ids.map((id) =>
        api
          .get(`/wishlist/check/${id}`)
          .then((response) => {
            if (response.data?.isWishlisted) {
              setWishlistedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
            }
          })
          .catch(() => {})
      )
    );
  }, [api, books, isSignedIn]);

  const handleToggleWishlist = async (event: React.MouseEvent, bookId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isSignedIn) return;

    setWishlistLoading((prev) => [...prev, bookId]);
    try {
      if (wishlistedIds.includes(bookId)) {
        await api.del(`/wishlist/${bookId}`);
        setWishlistedIds((prev) => prev.filter((id) => id !== bookId));
      } else {
        await api.post('/wishlist', { bookId });
        setWishlistedIds((prev) => [...prev, bookId]);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setWishlistLoading((prev) => prev.filter((id) => id !== bookId));
    }
  };

  const handleAddToCart = (book: Book) => {
    const parsedPrice = parsePrice(book.price);
    if (isNaN(parsedPrice)) return;

    addItem({
      id: book.id,
      title: book.title,
      author: book.authorName ? `${book.authorName} | Swapno Uran Prakashan` : 'Swapno Uran Prakashan',
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

      <header className="bg-white px-4 py-14 sm:px-6 md:py-20 lg:px-12 lg:py-24 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between md:items-end gap-8 md:gap-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
              <div className="h-px w-8 bg-botanical-sage sm:w-12" />
              The Collection
            </div>
            <h1 className="font-headline text-4xl font-bold leading-none text-botanical-forest sm:text-5xl lg:text-6xl">
              Curated <br /> <span className="italic font-normal">Physical Library</span>
            </h1>
          </div>

          <div className="flex w-full gap-3 md:w-auto md:gap-4">
            <div className="relative min-w-0 flex-grow md:w-96">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-botanical-forest/30 sm:left-6" />
              <input
                type="text"
                placeholder="Find your story..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-border bg-botanical-clay/10 py-4 pl-12 pr-5 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-botanical-sage/30 sm:py-5 sm:pl-16 sm:pr-8"
              />
            </div>
            <BauhausButton variant="ghost" className="shrink-0 border border-border p-4 sm:p-5" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="w-5 h-5" />
            </BauhausButton>
          </div>
        </div>

        {showFilters && (
          <div className="max-w-7xl mx-auto mt-8 flex flex-wrap items-center gap-3 p-4 bg-botanical-clay/10 rounded-2xl border border-border/40">
            <span className="w-full text-xs font-bold uppercase tracking-widest text-botanical-sage sm:w-auto">Sort by:</span>
            {(['newest', 'best-sellers', 'price-low', 'price-high'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                  sortBy === option
                    ? 'bg-botanical-forest text-white'
                    : 'bg-white border border-border text-botanical-forest/60 hover:text-botanical-forest'
                }`}
              >
                {option === 'newest'
                  ? 'Newest'
                  : option === 'best-sellers'
                    ? 'Best Sellers'
                    : option === 'price-low'
                      ? 'Price: Low'
                      : 'Price: High'}
              </button>
            ))}
            <button onClick={() => setShowFilters(false)} className="ml-auto p-2 text-botanical-forest/40 hover:text-botanical-forest">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="px-4 py-14 sm:px-6 md:py-20 lg:px-12 lg:py-24">
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
              {filteredBooks.map((book) => {
                const metadataItems = getBookMetaItems(book);

                return (
                <div key={book.id} className="group">
                  <Link href={`/shop/${book.id}`}>
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
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 space-y-2">
                          <button
                            onClick={(event) => {
                              event.preventDefault();
                              if (book.type === 'EBOOK' || (book.stockQuantity !== undefined && book.stockQuantity > 0)) {
                                handleAddToCart(book);
                              }
                            }}
                            className={`w-full py-3 rounded-2xl bg-white/90 backdrop-blur-sm font-bold text-[11px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                              book.type !== 'EBOOK' && book.stockQuantity !== undefined && book.stockQuantity <= 0
                                ? 'text-rose-500 opacity-50 cursor-not-allowed'
                                : 'text-botanical-forest'
                            }`}
                            disabled={book.type !== 'EBOOK' && book.stockQuantity !== undefined && book.stockQuantity <= 0}
                          >
                            {addedItems.includes(book.id) ? (
                              <>
                                <Check className="w-4 h-4" /> Added
                              </>
                            ) : book.type !== 'EBOOK' && book.stockQuantity !== undefined && book.stockQuantity <= 0 ? (
                              <>
                                <X className="w-4 h-4" /> Out of Stock
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" /> Add to Cart
                              </>
                            )}
                          </button>
                          {book.sampleChapterUrl && (
                            <Link
                              href={`/shop/${book.id}`}
                              className="block w-full py-2.5 rounded-2xl bg-black/70 backdrop-blur-sm text-white font-bold text-[9px] uppercase tracking-widest hover:bg-black/90 transition-all text-center"
                            >
                              <BookOpen className="w-3 h-3 inline mr-1" /> Read Sample
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-base font-headline font-bold text-botanical-forest leading-tight line-clamp-2">{book.title}</h3>
                          <p className="text-[10px] font-medium text-botanical-sage uppercase tracking-widest mt-1 italic">
                            {book.authorName ? `${book.authorName} | Swapno Uran Prakashan` : 'Swapno Uran Prakashan'}
                          </p>
                        </div>

                        {book.description && (
                          <p className="text-xs text-botanical-forest/50 leading-relaxed line-clamp-2">{book.description}</p>
                        )}

                        {metadataItems.length > 0 && (
                          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-botanical-forest/45">
                            {metadataItems.map((item) => (
                              <span key={item}>{item}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/10">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xl font-headline font-bold text-botanical-terracotta">
                                ₹{parsePrice(book.price).toLocaleString()}
                              </span>
                              {book.mrp && Number(book.mrp) > Number(book.price) && (
                                <span className="text-[10px] font-medium text-botanical-forest/40 line-through">
                                  ₹{parsePrice(book.mrp).toLocaleString()}
                                </span>
                              )}
                            </div>
                            {book.discountPercentage && Number(book.discountPercentage) > 0 && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded w-fit inline-block leading-none">
                                {Number(book.discountPercentage)}% OFF
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1.5">
                            {isSignedIn && (
                              <button
                                onClick={(event) => handleToggleWishlist(event, book.id)}
                                disabled={wishlistLoading.includes(book.id)}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  wishlistedIds.includes(book.id)
                                    ? 'bg-red-50 border-red-200 text-red-500'
                                    : 'border-border/40 text-botanical-forest/40 hover:text-red-400 hover:border-red-200'
                                }`}
                                title={wishlistedIds.includes(book.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                              >
                                {wishlistLoading.includes(book.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Heart className={`w-4 h-4 ${wishlistedIds.includes(book.id) ? 'fill-red-500' : ''}`} />
                                )}
                              </button>
                            )}

                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                if (book.type === 'EBOOK' || (book.stockQuantity !== undefined && book.stockQuantity > 0)) {
                                  handleAddToCart(book);
                                }
                              }}
                              disabled={book.type !== 'EBOOK' && book.stockQuantity !== undefined && book.stockQuantity <= 0}
                              className={`p-2.5 rounded-xl transition-colors ${
                                addedItems.includes(book.id)
                                  ? 'bg-botanical-forest text-white'
                                  : book.type !== 'EBOOK' && book.stockQuantity !== undefined && book.stockQuantity <= 0
                                    ? 'bg-rose-50 text-rose-300 cursor-not-allowed'
                                    : 'bg-botanical-clay/20 text-botanical-forest hover:bg-botanical-clay/40'
                              }`}
                            >
                              {addedItems.includes(book.id) ? (
                                <Check className="w-4 h-4" />
                              ) : book.type !== 'EBOOK' && book.stockQuantity !== undefined && book.stockQuantity <= 0 ? (
                                <X className="w-4 h-4" />
                              ) : (
                                <ShoppingCart className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
