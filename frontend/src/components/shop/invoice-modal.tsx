'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { Loader2, X, Printer, FileText } from 'lucide-react';

interface InvoiceItem {
  bookTitle: string;
  bookType: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  qrCodes?: string[];
}

interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  orderDate: string;
  customer: { name: string; email: string };
  status: string;
  payment: { provider: string; status: string; transactionId: string } | null;
  items: InvoiceItem[];
  subtotalAmount?: number;
  deliveryCharge?: number;
  grandTotal: number;
  qrCodes?: { bookId: string; imageUrl: string }[];
}

interface InvoiceModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export default function InvoiceModal({ orderId, open, onClose }: InvoiceModalProps) {
  const api = useApi();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !orderId) return;
    setLoading(true);
    setError(null);
    api.get(`/orders/${orderId}/invoice`)
      .then((res: any) => {
        setInvoice(res.data || res);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load invoice');
      })
      .finally(() => setLoading(false));
  }, [open, orderId, api]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-up" id="invoice-print">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-botanical-clay/20 transition-colors z-10"
        >
          <X className="w-5 h-5 text-botanical-forest" />
        </button>

        {loading && (
          <div className="flex items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" />
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {invoice && !loading && (
          <div className="p-8 md:p-12">
            {/* Print button */}
            <div className="flex justify-end mb-6 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-botanical-terracotta hover:text-botanical-forest transition-colors border border-botanical-terracotta/30 rounded-full hover:border-botanical-forest/30"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-headline font-bold text-botanical-forest">Invoice</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-botanical-sage mt-1">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 rounded-full bg-botanical-forest flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-botanical-clay/10 rounded-2xl">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40 mb-1">Order ID</p>
                <p className="font-mono text-sm text-botanical-forest">{invoice.orderId}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40 mb-1">Date</p>
                <p className="text-sm text-botanical-forest">{new Date(invoice.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  invoice.status === 'PAID' ? 'bg-green-100 text-green-700' :
                  invoice.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40 mb-1">Payment</p>
                {invoice.payment ? (
                  <p className="text-sm text-botanical-forest">
                    {invoice.payment.provider} — {invoice.payment.status}
                  </p>
                ) : (
                  <p className="text-sm text-botanical-forest/40">—</p>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="mb-8">
              <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40 mb-2">Customer</p>
              <p className="font-bold text-botanical-forest">{invoice.customer.name}</p>
              <p className="text-sm text-botanical-forest/60">{invoice.customer.email}</p>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40 mb-3">Items</p>
              <div className="overflow-hidden rounded-2xl border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-botanical-clay/20 text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60">
                      <th className="text-left p-4">Item</th>
                      <th className="text-left p-4">Type</th>
                      <th className="text-center p-4">Qty</th>
                      <th className="text-right p-4">Unit Price</th>
                      <th className="text-right p-4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-border/40 align-top">
                        <td className="p-4 font-medium text-botanical-forest">
                          <div>{item.bookTitle}</div>
                          {item.qrCodes && item.qrCodes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 print:mt-1">
                              {item.qrCodes.map((qrUrl, qIdx) => (
                                <div key={qIdx} className="border border-border/40 p-1.5 rounded-lg bg-white inline-block">
                                  <img src={qrUrl} alt="Item QR Code" className="w-16 h-16 object-contain" />
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-botanical-clay/20">
                            {item.bookType}
                          </span>
                        </td>
                        <td className="p-4 text-center">{item.quantity}</td>
                        <td className="p-4 text-right">₹{item.unitPrice.toLocaleString()}</td>
                        <td className="p-4 text-right font-bold">₹{item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-72 p-6 bg-botanical-forest text-white rounded-2xl space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-60">Subtotal</span>
                  <span>₹{(invoice.subtotalAmount ?? invoice.grandTotal).toLocaleString()}</span>
                </div>
                {(invoice.deliveryCharge ?? 0) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="opacity-60">Delivery</span>
                    <span>₹{Number(invoice.deliveryCharge).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t border-white/20 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Grand Total</span>
                  <span className="text-2xl font-bold italic">₹{invoice.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/30">
                Swapno Uran Prakashan
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
