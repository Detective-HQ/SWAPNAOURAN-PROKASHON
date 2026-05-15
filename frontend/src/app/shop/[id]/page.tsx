'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { SamplePreview } from '@/components/ebooks/sample-preview';
import { ReviewSection } from '@/components/shop/review-section';
import { ShoppingCart, BookOpen, Heart, Loader2, Check, Star, ChevronLeft, Eye } from 'lucide-react';
import Link from 'next/link';

const PreviewPdfViewer = dynamic(() => import('@/components/ebooks/preview-pdf-viewer').then(m => m.PreviewPdfViewer), { ssr: false });

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();
  const api = useApi();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const [bookRes, reviewsRes] = await Promise.all([
        api.get(`/books/${id}`),
        api.get(`/reviews/book/${id}?limit=1`).catch(() => null)
      ]);
      setBook(bookRes.data);
      if (reviewsRes?.data) {
        setAvgRating(reviewsRes.data.averageRating || 0);
        setTotalReviews(reviewsRes.data.totalReviews || 0);
      }
    } catch (err) {
      console.error('Failed to load book:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      api.get(`/wishlist/check/${id}`).then((res) => {
        setIsWishlisted(res.data?.isWishlisted || false);
      }).catch(() => {});
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    const price = typeof book.price === 'number' ? book.price : parseFloat(String(book.price).replace(/,/g, ''));
    if (isNaN(price)) return;
    addItem({
      id: book.id,
      title: book.title,
      author: 'Swapno Uran Prakashan',
      price,
      image: book.coverImage || '',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleToggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await api.del(`/wishlist/${book.id}`);
        setIsWishlisted(false);
      } else {
        await api.post('/wishlist', { bookId: book.id });
        setIsWishlisted(true);
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const handlePreview = async () => {
    if (!book || !book.fileUrl) return;
    setPreviewLoading(true);
    try {
      const res = await api.get(`/ebooks/${book.id}/preview`);
      setPreviewUrl(res.data?.streamUrl || null);
      setShowPreview(true);
    } catch (err) {
      console.error('Preview error:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-40">
          <Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-40">
          <p className="text-botanical-forest/60">Book not found</p>
          <Link href="/shop" className="text-botanical-terracotta mt-4 inline-block">Back to shop</Link>
        </div>
      </div>
    );
  }

  const price = typeof book.price === 'number' ? book.price : parseFloat(String(book.price).replace(/,/g, ''));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-botanical-forest/60 hover:text-botanical-forest mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="aspect-[3/4] relative rounded-[32px] overflow-hidden bg-botanical-clay/10 border border-border/40">
              <Image
                src={book.coverImage || '/placeholder-book.jpg'}
                alt={book.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-botanical-sage uppercase tracking-[0.3em] text-xs font-bold">
                  <div className="w-8 h-px bg-botanical-sage" />
                  {book.type === 'EBOOK' ? 'Digital Edition' : 'Physical Book'}
                </div>
                <h1 className="text-5xl font-headline font-bold text-botanical-forest leading-tight">{book.title}</h1>
                <p className="text-sm font-medium text-botanical-sage uppercase tracking-widest italic">Swapno Uran Prakashan</p>
              </div>

              {avgRating > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-botanical-forest/60">
                    {avgRating.toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              <p className="text-4xl font-headline font-bold text-botanical-terracotta">
                ₹{price.toLocaleString()}
              </p>

              {book.description && (
                <p className="text-botanical-forest/70 leading-relaxed">{book.description}</p>
              )}

              <div className="flex flex-wrap gap-4 pt-4">
                <BauhausButton variant="primary" size="lg" onClick={handleAddToCart}>
                  {addedToCart ? (
                    <><Check className="w-5 h-5" /> Added to Cart</>
                  ) : (
                    <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                  )}
                </BauhausButton>

                {book.sampleChapterUrl && (
                  <BauhausButton variant="ghost" size="lg" onClick={() => setShowSample(true)}>
                    <BookOpen className="w-5 h-5" /> Read Sample
                  </BauhausButton>
                )}

                {book.type === 'EBOOK' && book.fileUrl && (
                  <BauhausButton variant="outline" size="lg" onClick={handlePreview} disabled={previewLoading}>
                    {previewLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                    Preview (First 4 Pages)
                  </BauhausButton>
                )}

                <button
                  onClick={handleToggleWishlist}
                  className={`p-4 rounded-2xl border transition-all ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'border-border/40 text-botanical-forest/60 hover:text-red-400 hover:border-red-200'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <div className="border-t border-border/40 pt-8">
                <ReviewSection bookId={book.id} onStatsChange={(avg, total) => { setAvgRating(avg); setTotalReviews(total); }} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSample && book.sampleChapterUrl && (
        <SamplePreview
          url={book.sampleChapterUrl}
          title={book.title}
          onClose={() => setShowSample(false)}
        />
      )}

      {showPreview && previewUrl && (
        <PreviewPdfViewer
          url={previewUrl}
          title={book.title}
          price={price}
          bookId={book.id}
          onClose={() => { setShowPreview(false); setPreviewUrl(null); }}
        />
      )}
    </div>
  );
}
