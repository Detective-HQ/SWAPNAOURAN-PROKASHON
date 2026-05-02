'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingBag, Trash2, ChevronRight, Package, CheckCircle2, Loader2 } from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve((window as any).Razorpay);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve((window as any).Razorpay);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
};

export default function OrdersPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const { items: cartItems, removeItem, updateQty, clearCart, total: subtotal } = useCart();
  const api = useApi();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!userLoaded) return;
      try {
        const data = await api.get('/orders/my');
        setOrders(data.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userLoaded, api]);

  const initiateRazorpayPayment = async () => {
    if (cartItems.length === 0) return;
    
    setProcessingPayment(true);
    setError(null);

    try {
      // Step 1: Create order from cart items - map 'id' to 'bookId' for backend
      const orderResponse = await api.post('/orders', {
        items: cartItems.map(item => ({
          bookId: String(item.id),
          quantity: item.qty || 1
        })),
        shippingAddress: {
          name: user?.fullName || user?.firstName || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
          phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
          address: ''
        }
      });

      const order = orderResponse.data;
      const orderId = order?.id;
      if (!orderId) {
        throw new Error('Failed to create order - no order ID returned');
      }

      // Step 2: Initiate payment through backend
      const paymentResponse = await api.post(`/orders/${orderId}/pay`);
      const paymentData = paymentResponse.data;

      // Step 3: Load and prepare Razorpay
      const Razorpay = await loadRazorpayScript() as any;
      if (!Razorpay) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }
      
      const options = {
        key: paymentData.checkoutData.key,
        amount: paymentData.checkoutData.amount,
        currency: paymentData.checkoutData.currency,
        name: 'Swapno Uran Prakashan',
        description: paymentData.checkoutData.description,
        order_id: paymentData.checkoutData.orderId,
        handler: async (response: any) => {
          try {
            // Step 4: Verify payment with backend
            await api.post(`/orders/${orderId}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            
            clearCart();
            window.location.href = '/dashboard/orders?payment=success';
          } catch (verifyErr: any) {
            console.error('Payment verification failed:', verifyErr);
            setError(verifyErr.message || 'Payment verification failed');
            setProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.fullName || user?.firstName || '',
          email: user?.emailAddresses[0]?.emailAddress || '',
          contact: user?.phoneNumbers?.[0]?.phoneNumber || '',
        },
        theme: {
          color: '#2A4D2A'
        }
      };

      const razorpay = new Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      console.error('Payment error:', err);
      const message = err?.message || 'Payment failed. Please try again.';
      if (/Some books are invalid or inactive/i.test(message)) {
        setError('Some cart items are outdated. Please remove them and add books again from the Shop page.');
      } else {
        setError(message);
      }
      setProcessingPayment(false);
    }
  };

  if (!userLoaded || loading) {
    return (
      <div className="space-y-16 animate-fade-up">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-botanical-terracotta" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-16 animate-fade-up">
        <BauhausCard>
          <p className="text-center text-muted-foreground">Please sign in to view your orders.</p>
        </BauhausCard>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-fade-up">
      {/* Flipkart Style Cart Section */}
      <section className="space-y-8">
        <header className="flex items-center gap-4">
          <ShoppingBag className="text-botanical-terracotta w-6 h-6" />
          <h2 className="text-3xl font-headline font-bold text-botanical-forest">My <span className="italic font-normal">Active Cart</span></h2>
          <span className="bg-botanical-clay/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-botanical-forest">
            {cartItems.length} Items
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <BauhausCard key={item.id} className="p-0 overflow-hidden border border-border/40">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-40 aspect-[3/4] sm:aspect-auto">
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-grow p-8 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-headline font-bold text-botanical-forest">{item.title}</h3>
                          <p className="text-[10px] font-bold text-botanical-sage uppercase tracking-widest italic">{item.author}</p>
                        </div>
                        <span className="text-xl font-bold italic">₹{item.price.toLocaleString()}</span>
                      </div>
                      
                      <p className="text-xs text-botanical-forest/60 font-medium">Standard Delivery by Wednesday</p>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-4 bg-botanical-clay/10 rounded-full px-4 py-2 border border-border/40">
                          <button className="text-botanical-forest font-bold hover:text-botanical-terracotta transition-colors" onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                          <span className="text-sm font-bold w-6 text-center">{item.qty}</span>
                          <button className="text-botanical-forest font-bold hover:text-botanical-terracotta transition-colors" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </BauhausCard>
              ))
            ) : (
              <div className="p-20 text-center bg-botanical-clay/10 rounded-[40px] border border-dashed border-border">
                <p className="text-botanical-forest/40 font-bold uppercase tracking-[0.2em] text-xs italic">Your cart is silent...</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <BauhausCard variant="clay" className="sticky top-24">
              <h3 className="text-lg font-headline font-bold text-botanical-forest mb-6 border-b border-botanical-forest/10 pb-4 uppercase tracking-widest text-[11px]">Price Details</h3>
              <div className="space-y-4 font-medium text-sm">
                <div className="flex justify-between">
                  <span className="text-botanical-forest/60">Price ({cartItems.length} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-botanical-forest/60">Delivery Charges</span>
                  <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                </div>
                <div className="h-px bg-botanical-forest/10 my-6" />
                <div className="flex justify-between items-end">
                  <span className="text-lg font-headline font-bold">Total Amount</span>
                  <span className="text-2xl font-bold italic text-botanical-terracotta">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>
<BauhausButton variant="primary" className="w-full mt-10" size="lg" onClick={initiateRazorpayPayment} disabled={processingPayment}>
                {processingPayment ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'CHECKOUT'
                )}
              </BauhausButton>
              {error && <p className="text-red-500 text-xs text-center mt-4">{error}</p>}
              <p className="text-[9px] font-bold text-botanical-forest/40 text-center mt-6 uppercase tracking-widest">
                Safe and secure botanical payments
              </p>
            </BauhausCard>
          </div>
        </div>
      </section>

      {/* Flipkart Style Order History Section */}
      <section className="space-y-8 pt-16 border-t border-border/40">
        <header className="flex items-center gap-4">
          <Package className="text-botanical-sage w-6 h-6" />
          <h2 className="text-3xl font-headline font-bold text-botanical-forest">Order <span className="italic font-normal">History</span></h2>
        </header>

        <div className="space-y-4">
          {orders.map((order) => (
            <BauhausCard key={order.id} className="p-0 overflow-hidden hover:-translate-y-1 transition-all border border-border/40">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="p-8 md:w-48 bg-botanical-clay/10 flex flex-col justify-center">
                  <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-1">Order ID</span>
                  <span className="font-bold text-botanical-forest">{order.id}</span>
                </div>
                <div className="flex-grow p-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                  <div>
                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest block mb-1">Placed On</span>
                    <span className="font-medium">{order.date}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest block mb-1">Items</span>
                    <span className="font-medium">{order.items} Books</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest block mb-1">Amount</span>
                    <span className="font-bold italic">{order.total}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold opacity-40 uppercase tracking-widest block mb-1">Status</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className={order.status === 'Delivered' ? 'text-green-500' : 'text-botanical-sage'} size={14} />
                      <span className="font-bold uppercase tracking-widest text-[10px]">{order.status}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 md:border-l border-border/40 flex items-center justify-center">
                  <button className="p-3 rounded-full hover:bg-botanical-clay/20 transition-colors text-botanical-sage">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </BauhausCard>
          ))}
        </div>
      </section>
    </div>
  );
}
