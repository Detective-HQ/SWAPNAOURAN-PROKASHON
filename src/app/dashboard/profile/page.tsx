import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { User, Mail, Shield, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <h1 className="text-5xl lg:text-7xl font-black">YOUR PROFILE</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BauhausCard className="col-span-1 md:col-span-2">
           <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
             <div className="w-32 h-32 rounded-full bg-[#1040C0] border-4 border-black flex items-center justify-center text-white">
                <User size={64} />
             </div>
             <div className="flex-grow text-center md:text-left">
               <h2 className="text-3xl font-black mb-2 uppercase">Gropius Walter</h2>
               <p className="text-muted-foreground font-bold mb-6">member since 1919</p>
               
               <div className="space-y-4 font-bold text-sm">
                 <div className="flex items-center gap-4 justify-center md:justify-start">
                    <Mail className="text-[#D02020] w-5 h-5" />
                    <span>walter.g@bauhaus.edu</span>
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
           <h3 className="text-xl font-black mb-8 border-b border-white/20 pb-2">ACCOUNT TIER</h3>
           <div className="text-center">
              <p className="text-6xl font-black text-[#F0C020] mb-4">C-01</p>
              <p className="font-black text-xs uppercase tracking-widest text-muted-foreground">Certified Collector</p>
           </div>
        </BauhausCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BauhausCard decorationColor="red" className="bg-[#D02020] text-white text-center">
           <DollarSign className="mx-auto mb-4 w-10 h-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Total Spending</p>
           <p className="text-4xl font-black">$452.20</p>
        </BauhausCard>
        
        <BauhausCard decorationColor="blue" className="bg-[#1040C0] text-white text-center">
           <Package className="mx-auto mb-4 w-10 h-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Total Orders</p>
           <p className="text-4xl font-black">18</p>
        </BauhausCard>

        <BauhausCard decorationColor="yellow" className="bg-[#F0C020] text-black text-center">
           <TrendingUp className="mx-auto mb-4 w-10 h-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">Reading Velocity</p>
           <p className="text-4xl font-black">4.2/mo</p>
        </BauhausCard>
      </div>
    </div>
  );
}
