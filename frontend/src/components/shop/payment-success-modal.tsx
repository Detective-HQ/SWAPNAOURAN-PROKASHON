'use client';

import { CheckCircle2, Receipt, Sparkles } from 'lucide-react';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type PaymentSuccessModalProps = {
  open: boolean;
  order: {
    id: string;
    totalAmount: number | string;
    items?: Array<{ quantity?: number }>;
    createdAt?: string;
  } | null;
  onOpenChange: (open: boolean) => void;
  onViewInvoice: () => void;
  onContinueShopping: () => void;
};

export default function PaymentSuccessModal({
  open,
  order,
  onOpenChange,
  onViewInvoice,
  onContinueShopping,
}: PaymentSuccessModalProps) {
  const itemCount =
    order?.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ?? 0;
  const totalAmount = Number(order?.totalAmount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-[32px] border-none bg-transparent p-0 shadow-none sm:max-w-2xl"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-botanical-forest/10 bg-[radial-gradient(circle_at_top,_rgba(194,123,102,0.2),_transparent_32%),linear-gradient(135deg,_#fff8f2_0%,_#f6efe7_48%,_#efe2d6_100%)] p-8 sm:p-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-10 -left-8 h-28 w-28 rounded-full bg-botanical-terracotta/15 blur-xl" />
            <div className="absolute top-8 right-10 h-20 w-20 rounded-full bg-emerald-300/20 blur-2xl" />
            <div className="absolute bottom-0 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-yellow-200/20 blur-2xl" />
            <div className="absolute left-8 top-8 h-3 w-3 rounded-full bg-botanical-terracotta animate-pulse" />
            <div className="absolute right-16 top-16 h-4 w-4 rounded-full bg-botanical-sage animate-pulse [animation-delay:180ms]" />
            <div className="absolute bottom-14 left-14 h-3 w-3 rounded-full bg-yellow-500 animate-pulse [animation-delay:320ms]" />
            <div className="absolute bottom-12 right-12 h-5 w-5 rounded-full bg-botanical-forest/20 animate-pulse [animation-delay:450ms]" />
          </div>

          <div className="relative space-y-8">
            <DialogHeader className="items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-[28px] bg-botanical-forest text-white shadow-lg shadow-botanical-forest/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-botanical-terracotta/20 bg-white/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.35em] text-botanical-terracotta">
                <Sparkles className="h-3.5 w-3.5" />
                Payment Successful
              </div>
              <DialogTitle className="text-3xl font-bold text-botanical-forest sm:text-4xl">
                Order confirmed
              </DialogTitle>
              <DialogDescription className="max-w-xl text-sm leading-6 text-botanical-forest/65">
                Your payment went through and your books are now being prepared. A fresh invoice is ready whenever you want it.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-botanical-forest/40">
                  Order ID
                </p>
                <p className="mt-2 font-mono text-sm font-bold text-botanical-forest">
                  #{order?.id?.slice(0, 8) || '--------'}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-botanical-forest/40">
                  Total Paid
                </p>
                <p className="mt-2 text-2xl font-bold italic text-botanical-terracotta">
                  Rs {totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/70 bg-white/75 p-5 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-botanical-forest/40">
                  Items
                </p>
                <p className="mt-2 text-2xl font-bold text-botanical-forest">
                  {itemCount}
                </p>
              </div>
            </div>

            <div className="rounded-[28px] border border-botanical-forest/10 bg-botanical-forest px-6 py-5 text-white shadow-lg shadow-botanical-forest/10">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
                    What happens next
                  </p>
                  <p className="text-sm leading-6 text-white/85">
                    You can download the invoice now, or head back to the shop while your order appears in your history below.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <BauhausButton
                variant="primary"
                size="lg"
                className="flex-1 rounded-2xl"
                onClick={onViewInvoice}
              >
                View Invoice
              </BauhausButton>
              <BauhausButton
                variant="outline"
                size="lg"
                className="flex-1 rounded-2xl border-botanical-forest bg-white/80"
                onClick={onContinueShopping}
              >
                Continue Shopping
              </BauhausButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
