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
import { Search, Package, IndianRupee, Eye, EyeOff } from "lucide-react";

export default function AdminProductsPage() {
  const api = useApi();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    void fetchProducts();
  }, [api]);

  const fetchProducts = async () => {
    try {
      const data = await api.get("/admin/books");
      setProducts(data?.data || []);
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

  const toggleActive = async (book: any) => {
    try {
      await api.put(`/books/${book.id}`, { isActive: !book.isActive });
      setProducts((prev) =>
        prev.map((b) => (b.id === book.id ? { ...b, isActive: !b.isActive } : b))
      );
      toast({
        title: book.isActive ? "Product Disabled" : "Product Enabled",
        description: `${book.title} is now ${book.isActive ? "hidden" : "visible"} in the shop.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-botanical-forest/60">Loading products...</div>;
  }

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
            Products Management
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">
            Manage your book catalog — enable, disable, or add new titles.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-botanical-forest/50" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-botanical-alabaster border border-botanical-sage/30 text-botanical-forest rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-botanical-terracotta w-full sm:w-64 transition-all"
            />
          </div>
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
              <TableHead className="text-botanical-forest/70 font-semibold py-4">Title</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Type</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Price</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Status</TableHead>
              <TableHead className="text-right text-botanical-forest/70 font-semibold pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((book) => (
              <TableRow key={book.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/40 transition-colors group">
                <TableCell className="font-medium text-botanical-forest py-3">
                  <div className="flex items-center gap-3">
                    {book.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImage} alt="" className="w-10 h-14 rounded object-cover" />
                    )}
                    <span>{book.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-botanical-sage/30 text-botanical-forest/70 text-[10px] uppercase font-bold">
                    {book.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-botanical-terracotta font-semibold">
                  <span className="flex items-center">
                    <IndianRupee size={14} className="mr-0.5" />
                    {Number(book.price).toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold ${
                      book.isActive
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-rose-100 text-rose-700 border-rose-200"
                    }`}
                  >
                    {book.isActive ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <button
                    onClick={() => toggleActive(book)}
                    className={`p-2 rounded-lg transition-all ${
                      book.isActive
                        ? "text-rose-500 hover:bg-rose-50"
                        : "text-emerald-500 hover:bg-emerald-50"
                    }`}
                    title={book.isActive ? "Disable" : "Enable"}
                  >
                    {book.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-botanical-forest/50">
                  {searchQuery ? "No products match your search." : "No products found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
