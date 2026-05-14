"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Filter, Truck, PackageCheck, ChevronDown, ChevronUp } from "lucide-react";

export default function AdminOrdersPage() {
  const api = useApi();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { number: string; status: string }>>({});
  const { toast } = useToast();

  useEffect(() => {
    void fetchOrders();
  }, [api]);

  const fetchOrders = async () => {
    try {
      const data = await api.get("/admin/orders");
      setOrders(data?.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "FAILED": return "bg-rose-100 text-rose-700 border-rose-200";
      default: return "bg-botanical-alabaster text-botanical-forest/60 border-botanical-sage/20";
    }
  };

  if (isLoading) {
    return <div className="text-botanical-forest/60">Loading orders...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
            Orders Management
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">Monitor transactions, handle disputes, and track active orders.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-botanical-forest/50" size={16} />
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-botanical-alabaster border border-botanical-sage/30 text-botanical-forest rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-botanical-terracotta w-full sm:w-64 transition-all"
            />
          </div>
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center justify-center p-2 bg-white border border-botanical-sage/30 text-botanical-forest rounded-lg hover:bg-botanical-alabaster transition-all"
            title="Clear filter"
          >
            <Filter size={18} />
          </button>
        </div>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-botanical-sage/20 overflow-hidden bg-white shadow-sm relative"
      >
        <Table>
          <TableHeader className="bg-botanical-alabaster/60">
            <TableRow className="border-b border-botanical-sage/20 hover:bg-transparent">
              <TableHead className="text-botanical-forest/70 font-semibold py-4 w-8"></TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Order ID</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Buyer</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Amount</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Date</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Status</TableHead>
              <TableHead className="text-right text-botanical-forest/70 font-semibold pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders
              .filter((o) => !searchQuery.trim() || o.id.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((order) => (
              <>
                <TableRow key={order.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/40 transition-colors group cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <TableCell className="py-3">
                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-botanical-forest/40" /> : <ChevronDown size={16} className="text-botanical-forest/40" />}
                  </TableCell>
                  <TableCell className="font-mono text-botanical-forest/60 text-xs py-3">
                    {order.id.substring(0, 8)}...{order.id.substring(order.id.length - 4)}
                  </TableCell>
                  <TableCell className="text-botanical-forest">
                    {order.user ? (
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{order.user.name}</span>
                        <span className="text-[11px] text-botanical-forest/50">{order.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-botanical-forest/50 italic">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-botanical-terracotta font-semibold tracking-wide">
                      ₹{order.totalAmount || 0}
                    </span>
                  </TableCell>
                  <TableCell className="text-botanical-forest/60 text-sm">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                    {order.deliveryStatus && (
                      <Badge variant="outline" className="ml-1 border-purple-200 bg-purple-50 text-purple-700 text-[9px] uppercase font-bold">
                        {order.deliveryStatus.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Select
                      defaultValue={order.status}
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-[130px] ml-auto h-8 bg-botanical-alabaster border-botanical-sage/30 hover:border-botanical-terracotta/50 text-botanical-forest rounded-md focus:ring-1 focus:ring-botanical-terracotta transition-all text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-botanical-sage/20 text-botanical-forest rounded-lg shadow-md">
                        <SelectItem value="PAID" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Paid</SelectItem>
                        <SelectItem value="PENDING" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Pending</SelectItem>
                        <SelectItem value="FAILED" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                {expandedOrder === order.id && (
                  <TableRow key={`${order.id}-tracking`}>
                    <TableCell colSpan={7} className="bg-botanical-alabaster/30 p-4">
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                        <div className="flex-1 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-botanical-forest/60">Tracking Number</label>
                          <Input
                            placeholder="Enter tracking number..."
                            value={trackingInputs[order.id]?.number || order.trackingNumber || ''}
                            onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: { ...prev[order.id], number: e.target.value } }))}
                            className="bg-white border-botanical-sage/30 text-botanical-forest text-sm"
                          />
                        </div>
                        <div className="w-full sm:w-44 space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-botanical-forest/60">Delivery Status</label>
                          <Select
                            value={trackingInputs[order.id]?.status || order.deliveryStatus || ''}
                            onValueChange={(val) => setTrackingInputs((prev) => ({ ...prev, [order.id]: { ...prev[order.id], status: val } }))}
                          >
                            <SelectTrigger className="bg-white border-botanical-sage/30 text-botanical-forest text-xs h-10">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-botanical-sage/20 text-botanical-forest rounded-lg">
                              <SelectItem value="PROCESSING" className="text-xs cursor-pointer">Processing</SelectItem>
                              <SelectItem value="SHIPPED" className="text-xs cursor-pointer">Shipped</SelectItem>
                              <SelectItem value="IN_TRANSIT" className="text-xs cursor-pointer">In Transit</SelectItem>
                              <SelectItem value="DELIVERED" className="text-xs cursor-pointer">Delivered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          className="bg-botanical-forest hover:bg-botanical-forest/90 text-white h-10"
                          onClick={async () => {
                            try {
                              await api.put(`/admin/orders/${order.id}/tracking`, {
                                trackingNumber: trackingInputs[order.id]?.number || order.trackingNumber,
                                deliveryStatus: trackingInputs[order.id]?.status || order.deliveryStatus
                              });
                              setOrders((prev) => prev.map((o) => o.id === order.id ? {
                                ...o,
                                trackingNumber: trackingInputs[order.id]?.number || o.trackingNumber,
                                deliveryStatus: trackingInputs[order.id]?.status || o.deliveryStatus
                              } : o));
                              toast({ title: "Tracking Updated", description: "Order tracking information saved." });
                            } catch (err: any) {
                              toast({ title: "Error", description: err.message, variant: "destructive" });
                            }
                          }}
                        >
                          <Truck className="w-4 h-4 mr-1" /> Update
                        </Button>
                      </div>
                      {order.trackingNumber && (
                        <p className="text-xs text-botanical-forest/50 mt-2">Current: {order.trackingNumber}</p>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
            {orders.filter((o) => !searchQuery.trim() || o.id.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-botanical-forest/50">
                  {searchQuery ? 'No orders match your search.' : 'No orders found in the system.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
