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
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Mail, Search, Users } from "lucide-react";

export default function AdminNewsletterPage() {
  const api = useApi();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    void fetchSubscribers();
  }, [api]);

  const fetchSubscribers = async () => {
    try {
      const data = await api.get("/admin/newsletter");
      setSubscribers(data?.data || []);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-botanical-forest/60">Loading subscribers...</div>;

  const active = subscribers.filter((s) => s.isActive);
  const filtered = subscribers.filter((s) => !searchQuery.trim() || s.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
            Newsletter Subscribers
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">
            <Users className="inline w-4 h-4 mr-1" />
            {active.length} active subscribers · {subscribers.length} total
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-botanical-forest/50" size={16} />
          <input
            type="text"
            placeholder="Search by email..."
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
              <TableHead className="text-botanical-forest/70 font-semibold py-4">Email</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Subscribed</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Status</TableHead>
              <TableHead className="text-right text-botanical-forest/70 font-semibold pr-6">Unsubscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sub) => (
              <TableRow key={sub.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/40 transition-colors">
                <TableCell className="font-medium text-botanical-forest py-3">{sub.email}</TableCell>
                <TableCell className="text-sm text-botanical-forest/60">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border text-[10px] uppercase font-bold ${sub.isActive ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {sub.isActive ? "Active" : "Unsubscribed"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6 text-sm text-botanical-forest/60">
                  {sub.unsubscribedAt ? new Date(sub.unsubscribedAt).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-botanical-forest/50">No subscribers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
