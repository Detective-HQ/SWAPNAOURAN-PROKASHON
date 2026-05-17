'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApi } from '@/hooks/use-api';
import { useCart } from '@/lib/cart-context';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { Heart, ShoppingCart, Trash2, Loader2, Check } from 'lucide-react';

export default function WishlistPage() {
  const api = useApi();
  const { addItem } = useCart();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchWishlist();
  }, [api]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist');
      setItems(res.data || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookId: string) => {
    try {
      await api.del(`/wishlist/${bookId}`);
      setItems((prev) => prev.filter((i) => i.bookId !== bookId));
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  const handleAddToCart = (item: any) => {
    const book = item.book;
    const price = typeof book.price === 'number' ? book.price : parseFloat(String(book.price).replace(/,/g, ''));
    if (isNaN(price)) return;
    addItem({
      id: book.id,
      title: book.title,
      author: book.authorName ? `${book.authorName} | Swapno Uran Prakashan` : 'Swapno Uran Prakashan',
      price,
      image: book.coverImage || '',
    });
    setAddedIds((prev) => [...prev, book.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== book.id)), 2000);
  };

  return (
    <div className="space-y-12 animate-fade-up">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-[10px] font-bold">
          <div className="w-8 h-px bg-botanical-sage" />
          My Collection
        </div>
        <div className="flex items-center gap-4">
          <Heart className="text-botanical-terracotta w-6 h-6" />
          <h1 className="text-5xl font-headline font-bold text-botanical-forest">My <span className="italic font-normal">Wishlist</span></h1>
          <span className="bg-botanical-clay/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-botanical-forest">
            {items.length} Items
          </span>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" /></div>
      ) : items.length === 0 ? (
        <div className="p-20 text-center bg-botanical-clay/10 rounded-[40px] border border-dashed border-border">
          <Heart className="w-12 h-12 mx-auto text-botanical-forest/20 mb-4" />
          <p className="text-botanical-forest/40 font-bold uppercase tracking-[0.2em] text-xs italic">Your wishlist is empty</p>
          <Link href="/shop" className="text-botanical-terracotta text-sm mt-4 inline-block hover:underline">Explore books</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const book = item.book;
            if (!book) return null;
            return (
              <BauhausCard key={item.id} className="group">
                <div className="aspect-[3/4] relative mb-6 rounded-2xl overflow-hidden bg-botanical-clay/10">
                  <Image src={book.coverImage || '/placeholder-book.jpg'} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <Link href={`/shop/${book.id}`}>
                  <h3 className="text-lg font-headline font-bold text-botanical-forest hover:text-botanical-terracotta transition-colors">{book.title}</h3>
                </Link>
                <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest mt-1 italic mb-1">{book.authorName ? `${book.authorName} | Swapno Uran Prakashan` : 'Swapno Uran Prakashan'}</p>
                <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest italic mb-4">{book.type}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <span className="text-xl font-headline font-bold text-botanical-terracotta">₹{Number(book.price).toLocaleString()}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleRemove(book.id)} className="p-2.5 rounded-xl border border-border/40 text-botanical-forest/60 hover:text-red-400 hover:border-red-200 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAddToCart(item)} className={`p-2.5 rounded-xl border transition-all ${addedIds.includes(book.id) ? 'bg-botanical-forest text-white border-botanical-forest' : 'border-border/40 text-botanical-forest/60 hover:bg-botanical-forest hover:text-white'}`}>
                      {addedIds.includes(book.id) ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </BauhausCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
