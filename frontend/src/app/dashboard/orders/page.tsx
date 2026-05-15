'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/lib/cart-context';
import { useApi } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShoppingBag, Trash2, ChevronRight, Package, CheckCircle2, Loader2, FileText, Truck, RotateCcw } from 'lucide-react';
import InvoiceModal from '@/components/shop/invoice-modal';

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
  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnError, setReturnError] = useState<string | null>(null);

  const handleReturnRequest = async () => {
    if (!returnModal || !returnReason.trim()) {
      setReturnError('Please provide a reason');
      return;
    }
    if (returnReason.trim().length < 10) {
      setReturnError('Reason must be at least 10 characters');
      return;
    }
    setSubmittingReturn(true);
    setReturnError(null);
    try {
      await api.post('/returns', {
        orderId: returnModal.orderId,
        bookId: returnModal.bookId,
        reason: returnReason.trim()
      });
      setReturnModal(null);
      setReturnReason('');
      toast({ title: 'Return Requested', description: 'Your return request has been submitted.' });
    } catch (err: any) {
      setReturnError(err.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);
  const [returnModal, setReturnModal] = useState<{ orderId: string; bookId: string; bookTitle: string } | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [addressError, setAddressError] = useState<string | null>(null);
  const { toast } = useToast();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (userLoaded && user) {
      setShippingAddress({
        name: user?.fullName || user?.firstName || '',
        phone: user?.phoneNumbers?.[0]?.phoneNumber || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
    }
  }, [userLoaded, user]);

  useEffect(() => {
    async function fetchData() {
      if (!userLoaded) return;
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
        const ordersRes = await api.get('/orders/my');
        setOrders(ordersRes.data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }

      try {
        const addressesRes = await api.get('/addresses');
        const addresses = addressesRes.data || [];
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
          setSelectedAddressId(defaultAddr.id);
          setShippingAddress({
            name: defaultAddr.name,
            phone: defaultAddr.phone,
            address: defaultAddr.address,
            city: defaultAddr.city,
            state: defaultAddr.state,
            pincode: defaultAddr.pincode,
          });
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userLoaded, user, api]);

  const handleAddressSelect = (addr: any) => {
    setSelectedAddressId(addr.id);
    setShippingAddress({
      name: addr.name,
      phone: addr.phone,
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
    setShowAddressForm(false);
  };

  const initiateRazorpayPayment = async () => {
    if (cartItems.length === 0) return;
    
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      setAddressError('All address fields are required');
      setShowAddressForm(true);
      return;
    }

    setProcessingPayment(true);
    setError(null);
    setAddressError(null);

    try {
      const orderResponse = await api.post('/orders', {
        items: cartItems.map(item => ({
          bookId: String(item.id),
          quantity: item.qty || 1
        })),
        shippingAddress: {
          name: shippingAddress.name,
          email: user?.emailAddresses[0]?.emailAddress || '',
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
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
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
          },
        },
        handler: async (response: any) => {
          try {
            await api.post(`/orders/${orderId}/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (savedAddresses.length === 0 && shippingAddress.address) {
              const save = window.confirm(
                'Would you like to save this shipping address to your profile for future orders?'
              );
              if (save) {
                try {
                  await api.post('/addresses', {
                    name: shippingAddress.name,
                    phone: shippingAddress.phone,
                    address: shippingAddress.address,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    pincode: shippingAddress.pincode,
                    isDefault: true
                  });
                } catch {
                  // silently ignore — order already succeeded
                }
              }
            }

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

              <div className="mt-6 pt-6 border-t border-botanical-forest/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-headline font-bold uppercase tracking-widest text-botanical-forest">Shipping Address</h4>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-[10px] font-bold text-botanical-terracotta hover:text-botanical-forest transition-colors uppercase tracking-widest"
                  >
                    {showAddressForm ? 'Cancel New Address' : 'Add New Address'}
                  </button>
                </div>

                {!showAddressForm && savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((addr) => (
                      <div 
                        key={addr.id} 
                        onClick={() => handleAddressSelect(addr)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-botanical-terracotta bg-botanical-terracotta/5' : 'border-border/40 hover:border-botanical-terracotta/50'}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm">{addr.name}</p>
                          {selectedAddressId === addr.id && <CheckCircle2 className="w-4 h-4 text-botanical-terracotta" />}
                        </div>
                        <p className="text-xs text-botanical-forest/70">{addr.address}</p>
                        <p className="text-xs text-botanical-forest/70">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    ))}
                  </div>
                )}

                {showAddressForm && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={shippingAddress.name}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-white/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-1">Phone *</label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-white/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50"
                        placeholder="10-digit phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-1">Address *</label>
                      <textarea
                        value={shippingAddress.address}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-white/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50 resize-none"
                        rows={2}
                        placeholder="Street address, locality"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-1">City *</label>
                        <input
                          type="text"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          className="w-full px-4 py-2 text-sm bg-white/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-1">State *</label>
                        <input
                          type="text"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          className="w-full px-4 py-2 text-sm bg-white/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50"
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-1">PIN Code *</label>
                      <input
                        type="text"
                        value={shippingAddress.pincode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                        className="w-full px-4 py-2 text-sm bg-white/50 border border-border/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50"
                        placeholder="6-digit PIN code"
                        maxLength={6}
                      />
                    </div>
                    {addressError && <p className="text-red-500 text-xs">{addressError}</p>}
                  </div>
                )}

                {!showAddressForm && savedAddresses.length === 0 && (
                  <div className="text-xs text-botanical-forest/60 mt-2 p-4 text-center border border-dashed border-border/40 rounded-lg">
                    <p>No saved addresses.</p>
                  </div>
                )}
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

      {/* Order History Section */}
      <section className="space-y-8 pt-16 border-t border-border/40">
        <header className="flex items-center gap-4">
          <Package className="text-botanical-sage w-6 h-6" />
          <h2 className="text-3xl font-headline font-bold text-botanical-forest">Order <span className="italic font-normal">History</span></h2>
          {paidOrders.length > 0 && (
            <span className="bg-botanical-clay/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-botanical-forest ml-auto">
              {paidOrders.length} Total
            </span>
          )}
        </header>

        {paidOrders.length === 0 ? (
          <div className="p-20 text-center bg-botanical-clay/10 rounded-[40px] border border-dashed border-border">
            <Package className="w-12 h-12 mx-auto text-botanical-forest/20 mb-4" />
            <p className="text-botanical-forest/40 font-bold uppercase tracking-[0.2em] text-xs italic">No paid orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paidOrders.map((order) => {
              const statusColors = {
                PAID: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
                FAILED: 'bg-rose-100 text-rose-700 border-rose-200',
              } as Record<string, string>;
              const statusIcon = order.status === 'PAID' ? CheckCircle2 : order.status === 'FAILED' ? Package : Package;
              const StatusIcon = statusIcon;

              return (
                <BauhausCard key={order.id} className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/40 group">
                  {/* Top: Order meta */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-botanical-clay/5 border-b border-border/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-botanical-forest/5 flex items-center justify-center">
                        <Package className="w-5 h-5 text-botanical-forest/40" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40">Order ID</p>
                        <p className="font-mono text-sm font-bold text-botanical-forest">#{order.id.substring(0, 8)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40">Placed On</p>
                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-botanical-forest/40">Total</p>
                        <p className="text-lg font-bold italic text-botanical-terracotta">₹{Number(order.totalAmount).toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColors[order.status] || 'bg-botanical-alabaster text-botanical-forest/60 border-botanical-sage/20'}`}>
                        <StatusIcon size={12} />
                        {order.status}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Order items preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="px-6 py-4 flex items-center gap-3 overflow-x-auto">
                      {order.items.slice(0, 5).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 shrink-0 bg-botanical-alabaster/50 rounded-xl px-3 py-2 border border-border/20">
                          {item.book?.coverImage ? (
                            <Image src={item.book.coverImage} alt="" width={28} height={40} className="rounded object-cover" />
                          ) : (
                            <div className="w-7 h-10 rounded bg-botanical-clay/20" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-botanical-forest truncate max-w-[120px]">{item.book?.title || 'Book'}</p>
                            <p className="text-[9px] text-botanical-forest/50 uppercase tracking-wider">x{item.quantity || 1}</p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <span className="text-[10px] font-bold text-botanical-sage shrink-0">+{order.items.length - 5} more</span>
                      )}
                    </div>
                  )}

                  {/* Tracking Info */}
                  {(order.trackingNumber || order.deliveryStatus) && (
                    <div className="px-6 py-3 bg-botanical-clay/5 border-t border-border/20">
                      <div className="flex items-center gap-3 text-xs text-botanical-forest/70">
                        <Truck className="w-4 h-4 text-botanical-sage" />
                        {order.trackingNumber && <span>Tracking: <strong>{order.trackingNumber}</strong></span>}
                        {order.deliveryStatus && (
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            order.deliveryStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            order.deliveryStatus === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            order.deliveryStatus === 'SHIPPED' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            'bg-amber-100 text-amber-700 border-amber-200'
                          }`}>
                            {order.deliveryStatus.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom: Actions */}
                  <div className="px-6 py-3 bg-botanical-clay/5 border-t border-border/20 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setInvoiceOrderId(order.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-botanical-terracotta hover:bg-botanical-terracotta/10 transition-colors border border-botanical-terracotta/20"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Invoice
                    </button>
                    {order.items?.map((item: any) => item.book?.type === 'PHYSICAL' && (
                      <button
                        key={item.id}
                        onClick={() => setReturnModal({
                          orderId: order.id,
                          bookId: item.bookId,
                          bookTitle: item.book?.title || 'Book'
                        })}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:bg-amber-50 transition-colors border border-amber-200"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Return
                      </button>
                    ))}
                  </div>
                </BauhausCard>
              );
            })}
          </div>
        )}
      </section>
      <InvoiceModal
        orderId={invoiceOrderId || ''}
        open={!!invoiceOrderId}
        onClose={() => setInvoiceOrderId(null)}
      />

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !submittingReturn && setReturnModal(null)}>
          <div className="bg-white rounded-[32px] max-w-md w-full p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-headline font-bold text-botanical-forest mb-2">Return Request</h3>
            <p className="text-sm text-botanical-forest/60 mb-6">{returnModal.bookTitle}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-botanical-forest/60 mb-2">Reason for Return *</label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Tell us why you're returning this item (min 10 characters)..."
                  className="w-full px-4 py-3 text-sm bg-botanical-clay/10 border border-border/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-botanical-terracotta/50 resize-none"
                  rows={4}
                  maxLength={1000}
                />
              </div>
              {returnError && <p className="text-red-500 text-xs">{returnError}</p>}
              <div className="flex gap-3">
                <BauhausButton variant="ghost" className="flex-1" onClick={() => { setReturnModal(null); setReturnReason(''); setReturnError(null); }} disabled={submittingReturn}>
                  Cancel
                </BauhausButton>
                <BauhausButton variant="primary" className="flex-1" onClick={handleReturnRequest} disabled={submittingReturn}>
                  {submittingReturn ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Request'}
                </BauhausButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
