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
import { motion } from "framer-motion";
import { RotateCcw, Search } from "lucide-react";

export default function AdminReturnsPage() {
  const api = useApi();
  const [returns, setReturns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    void fetchReturns();
  }, [api]);

  const fetchReturns = async () => {
    try {
      const data = await api.get("/admin/returns");
      setReturns(data?.data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string, adminNote?: string) => {
    try {
      await api.put(`/admin/returns/${id}`, { status, adminNote: adminNote || "Status updated by admin" });
      setReturns((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: "Status Updated", description: `Return status changed to ${status}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "REJECTED": return "bg-rose-100 text-rose-700 border-rose-200";
      case "REFUNDED": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) return <div className="text-botanical-forest/60">Loading returns...</div>;

  const filtered = returns.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return r.book?.title?.toLowerCase().includes(q) || r.user?.name?.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
            Returns & Refunds
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">Manage customer return requests and process refunds.</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-botanical-forest/50" size={16} />
          <input
            type="text"
            placeholder="Search returns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-botanical-alabaster border border-botanical-sage/30 text-botanical-forest rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-botanical-terracotta w-full sm:w-64 transition-all"
          />
        </div>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-2xl border border-botanical-sage/20 overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-botanical-alabaster/60">
            <TableRow className="border-b border-botanical-sage/20 hover:bg-transparent">
              <TableHead className="text-botanical-forest/70 font-semibold py-4">Customer</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Book</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Reason</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Date</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Status</TableHead>
              <TableHead className="text-right text-botanical-forest/70 font-semibold pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ret) => (
              <TableRow key={ret.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/40 transition-colors">
                <TableCell className="py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-botanical-forest">{ret.user?.name || "Unknown"}</span>
                    <span className="text-[11px] text-botanical-forest/50">{ret.user?.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-botanical-forest">{ret.book?.title || "N/A"}</TableCell>
                <TableCell className="text-sm text-botanical-forest/70 max-w-xs truncate">{ret.reason}</TableCell>
                <TableCell className="text-sm text-botanical-forest/60">{new Date(ret.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 ${getStatusColor(ret.status)}`}>
                    {ret.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Select defaultValue={ret.status} onValueChange={(val) => handleStatusChange(ret.id, val)}>
                    <SelectTrigger className="w-[130px] ml-auto h-8 bg-botanical-alabaster border-botanical-sage/30 hover:border-botanical-terracotta/50 text-botanical-forest rounded-md focus:ring-1 focus:ring-botanical-terracotta text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-botanical-sage/20 text-botanical-forest rounded-lg shadow-md">
                      <SelectItem value="PENDING" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Pending</SelectItem>
                      <SelectItem value="APPROVED" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Approved</SelectItem>
                      <SelectItem value="REJECTED" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Rejected</SelectItem>
                      <SelectItem value="REFUNDED" className="text-xs focus:bg-botanical-alabaster cursor-pointer">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-botanical-forest/50">No return requests found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
