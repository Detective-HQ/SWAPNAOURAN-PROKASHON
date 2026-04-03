import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { FileText, Download, CheckCircle2 } from 'lucide-react';

export default function OrdersPage() {
  const orders = [
    { id: 'ORD-101', date: '2024-03-15', total: '$45.00', status: 'Delivered', items: 2 },
    { id: 'ORD-102', date: '2024-03-10', total: '$12.50', status: 'Processing', items: 1 },
    { id: 'ORD-103', date: '2024-02-28', total: '$89.99', status: 'Delivered', items: 4 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div>
          <h1 className="text-5xl lg:text-7xl font-black">MY ORDERS</h1>
          <p className="text-xl font-bold uppercase tracking-widest text-[#1040C0] mt-4">Order History & Deliveries</p>
        </div>
        <BauhausButton variant="black" shape="pill">View Cart</BauhausButton>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <BauhausCard key={order.id} decorationColor={order.status === 'Delivered' ? 'blue' : 'yellow'} className="p-0 overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="bg-[#121212] text-white p-8 flex flex-col justify-center min-w-[200px]">
                <p className="text-xs font-black opacity-60 uppercase mb-1">ID</p>
                <p className="text-xl font-black text-[#F0C020]">{order.id}</p>
              </div>
              <div className="flex-grow p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase mb-1">Date</p>
                  <p className="font-bold">{order.date}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase mb-1">Total</p>
                  <p className="font-bold">{order.total}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase mb-1">Items</p>
                  <p className="font-bold">{order.items} Physical</p>
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={order.status === 'Delivered' ? 'text-green-500' : 'text-yellow-500'} size={16} />
                    <p className="font-bold">{order.status}</p>
                  </div>
                </div>
              </div>
              <div className="p-8 flex items-center border-l-2 border-black bg-[#F0F0F0]">
                <BauhausButton variant="outline" size="sm">Details</BauhausButton>
              </div>
            </div>
          </BauhausCard>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-4xl font-black mb-8">DIGITAL ARCHIVE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BauhausCard decorationShape="triangle" decorationColor="red" className="flex items-center gap-8">
             <div className="bg-[#D02020] p-4 text-white">
                <FileText size={32} />
             </div>
             <div className="flex-grow">
               <h3 className="font-black text-lg">Screen Modernism.pdf</h3>
               <p className="text-xs font-bold text-muted-foreground">Purchased: 2024-03-01</p>
             </div>
             <BauhausButton variant="black" size="sm">READ NOW</BauhausButton>
          </BauhausCard>

          <BauhausCard decorationShape="triangle" decorationColor="blue" className="flex items-center gap-8">
             <div className="bg-[#1040C0] p-4 text-white">
                <FileText size={32} />
             </div>
             <div className="flex-grow">
               <h3 className="font-black text-lg">Digital Type Spec.pdf</h3>
               <p className="text-xs font-bold text-muted-foreground">Purchased: 2024-02-15</p>
             </div>
             <BauhausButton variant="black" size="sm">READ NOW</BauhausButton>
          </BauhausCard>
        </div>
      </div>
    </div>
  );
}
