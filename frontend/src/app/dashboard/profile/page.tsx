'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { User, Mail, Shield, DollarSign, Package, Loader2 } from 'lucide-react';
import { AddressManager } from '@/components/profile/address-manager';
import { useApi } from '@/hooks/use-api';

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const api = useApi();
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const [totalOrders, setTotalOrders] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get('/orders/my');
        const orders = res.data || [];
        const paid = orders.filter((o: any) => o.status === 'PAID');
        setTotalOrders(paid.length);
        setTotalSpent(paid.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0));
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [user, api]);

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-5xl lg:text-7xl font-black">YOUR PROFILE</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto space-y-12">
        <h1 className="text-5xl lg:text-7xl font-black">YOUR PROFILE</h1>
        <BauhausCard>
          <p className="text-center text-muted-foreground">Please sign in to view your profile.</p>
        </BauhausCard>
      </div>
    );
  }

  const fullName = user.fullName || user.firstName || 'Book Lover';
  const email = user.emailAddresses[0]?.emailAddress || 'No email';
  const profileImage = user.imageUrl;
  const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <h1 className="text-5xl lg:text-7xl font-black">YOUR PROFILE</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
<BauhausCard className="col-span-1 md:col-span-2">
            <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
              <div className="w-32 h-32 rounded-full bg-[#1040C0] border-4 border-black flex items-center justify-center text-white overflow-hidden">
                 {profileImage ? (
                   <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                 ) : (
                   <User size={64} />
                 )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-3xl font-black mb-2 uppercase">{fullName}</h2>
                <p className="text-muted-foreground font-bold mb-6">member since {createdAt}</p>
                
                <div className="space-y-4 font-bold text-sm">
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                     <Mail className="text-[#D02020] w-5 h-5" />
                     <span>{email}</span>
                  </div>
                  <div className="flex items-center gap-4 justify-center md:justify-start">
                     <Shield className="text-[#F0C020] w-5 h-5" />
                     <span>Authenticated User</span>
                  </div>
                </div>

                <div className="mt-8">
                   <BauhausButton variant="outline" size="sm">Edit Details</BauhausButton>
                </div>
              </div>
            </div>
         </BauhausCard>

        <BauhausCard decorationColor="yellow" className="bg-[#121212] text-white">
           <h3 className="text-xl font-black mb-8 border-b border-white/20 pb-2">MEMBERSHIP</h3>
           <div className="text-center">
              <p className="text-6xl font-black text-[#F0C020] mb-4">{totalOrders !== null && totalOrders >= 3 ? 'GOLD' : totalOrders !== null && totalOrders >= 1 ? 'SILVER' : 'BRONZE'}</p>
              <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">{totalOrders !== null ? `${totalOrders} purchase${totalOrders !== 1 ? 's' : ''}` : '...'}</p>
           </div>
        </BauhausCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <BauhausCard decorationColor="red" className="bg-[#D02020] text-white text-center">
           <DollarSign className="mx-auto mb-4 w-10 h-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Total Spent</p>
           {statsLoading ? (
             <Loader2 className="mx-auto w-6 h-6 animate-spin" />
           ) : (
             <p className="text-4xl font-black">₹{totalSpent !== null ? totalSpent.toLocaleString() : '0'}</p>
           )}
        </BauhausCard>
        
        <BauhausCard decorationColor="blue" className="bg-[#1040C0] text-white text-center">
           <Package className="mx-auto mb-4 w-10 h-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Paid Orders</p>
           {statsLoading ? (
             <Loader2 className="mx-auto w-6 h-6 animate-spin" />
           ) : (
             <p className="text-4xl font-black">{totalOrders !== null ? totalOrders : '0'}</p>
           )}
        </BauhausCard>
      </div>

      <div className="mt-12">
        <AddressManager />
      </div>
    </div>
  );
}
