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
import { Button } from "@/components/ui/button";
import { Trash2, Search, PlusCircle, ExternalLink, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function AdminProductsPage() {
  const api = useApi();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    void fetchItems();
  }, [api]);

  const fetchItems = async () => {
    try {
      const data = await api.get("/admin/books");
      setItems(data?.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.del(`/books/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Success",
        description: "Book deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-botanical-terracotta"></div>
      </div>
    );
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
            Books Management
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">Manage your physical and digital book inventory.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-botanical-forest/50" size={16} />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-botanical-alabaster border border-botanical-sage/30 text-botanical-forest rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-botanical-terracotta w-full sm:w-64 transition-all"
            />
          </div>
          <Link href="/admin/products/add">
            <Button className="bg-botanical-terracotta hover:bg-botanical-terracotta/90 text-white gap-2">
              <PlusCircle size={18} />
              Add Book
            </Button>
          </Link>
        </div>
      </div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-botanical-sage/20 overflow-hidden bg-white shadow-sm relative"
      >
        <Table>
          <TableHeader className="bg-botanical-alabaster/50">
            <TableRow className="border-b border-botanical-sage/20 hover:bg-transparent">
              <TableHead className="text-botanical-forest/70 font-semibold py-4">Title</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Type</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Price</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Created At</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Status</TableHead>
              <TableHead className="text-right text-botanical-forest/70 font-semibold pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/50 transition-colors group">
                <TableCell className="font-medium text-botanical-forest max-w-xs truncate py-4 flex items-center gap-3">
                  {item.coverImage ? (
                    <img src={item.coverImage} className="w-10 h-14 object-cover rounded shadow-sm border border-botanical-sage/20" alt="" />
                  ) : (
                    <div className="w-10 h-14 bg-botanical-alabaster rounded border border-botanical-sage/20 flex items-center justify-center text-botanical-forest/40">
                      <BookOpen size={16} />
                    </div>
                  )}
                  <span className="truncate font-body">{item.title}</span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs border font-medium ${
                    item.type === 'EBOOK' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : item.type === 'BOTH'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-botanical-terracotta/10 text-botanical-terracotta border-botanical-terracotta/20'
                  }`}>
                    {item.type}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-botanical-forest font-semibold">
                    ₹{item.price}
                  </span>
                </TableCell>
                <TableCell className="text-botanical-forest/70 text-sm">
                  {new Date(item.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-md text-[11px] uppercase tracking-wider font-semibold ${
                    item.isActive 
                      ? 'bg-botanical-forest/10 text-botanical-forest border border-botanical-forest/20'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}>
                    {item.isActive ? 'Active' : 'Hidden'}
                  </span>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-botanical-forest/50">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}

