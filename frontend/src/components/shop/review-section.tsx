'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { useUser } from '@clerk/nextjs';
import { Star, Loader2, Trash2, MessageSquare } from 'lucide-react';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';

interface ReviewSectionProps {
  bookId: string;
  onStatsChange?: (avg: number, total: number) => void;
}

export function ReviewSection({ bookId, onStatsChange }: ReviewSectionProps) {
  const api = useApi();
  const { user, isLoaded } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/book/${bookId}?limit=50`);
      setReviews(res.data?.items || []);
      setStats({
        averageRating: res.data?.averageRating || 0,
        totalReviews: res.data?.totalReviews || 0
      });
      onStatsChange?.(res.data?.averageRating || 0, res.data?.totalReviews || 0);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/reviews', { bookId, rating, comment: comment || undefined });
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await api.del(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <MessageSquare className="w-5 h-5 text-botanical-terracotta" />
        <h3 className="text-2xl font-headline font-bold text-botanical-forest">
          Reviews <span className="italic font-normal">& Ratings</span>
        </h3>
        {stats.totalReviews > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(stats.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-botanical-forest/60">{stats.averageRating.toFixed(1)} ({stats.totalReviews})</span>
          </div>
        )}
      </div>

      {user && isLoaded && (
        <form onSubmit={handleSubmit} className="bg-botanical-clay/10 rounded-2xl p-6 border border-border/40 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-botanical-forest">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                <Star className={`w-6 h-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            className="w-full px-4 py-3 rounded-xl bg-white border border-border/40 focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50 resize-none"
            rows={3}
            maxLength={1000}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <BauhausButton variant="primary" size="sm" type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
          </BauhausButton>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-botanical-terracotta" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-botanical-forest/40 text-center py-8 italic">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-border/40 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-botanical-clay flex items-center justify-center text-xs font-bold text-botanical-forest">
                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-sm text-botanical-forest">{review.user?.name || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {(review.userId === user?.id) && (
                    <button onClick={() => handleDelete(review.id)} className="p-1 text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && <p className="text-sm text-botanical-forest/70">{review.comment}</p>}
              <p className="text-[10px] text-botanical-forest/40 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
