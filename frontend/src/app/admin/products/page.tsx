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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, IndianRupee, Eye, EyeOff, Plus, Edit, Trash2, AlertTriangle, RotateCcw } from "lucide-react";
import { mediaUrl } from "@/lib/media-url";

export default function AdminProductsPage() {
  const api = useApi();
  const [products, setProducts] = useState<any[]>([]);
  const [trashProducts, setTrashProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    void fetchProducts();
    void fetchTrashProducts();
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

  const fetchTrashProducts = async () => {
    try {
      const data = await api.get("/admin/books/trash");
      setTrashProducts(data?.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching trash products",
        description: error.message,
        variant: "destructive",
      });
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

  const deleteProduct = async (book: any) => {
    if (!confirm(`Are you sure you want to delete "${book.title}"? It will move to Trash.`)) return;
    try {
      const result = await api.del(`/books/${book.id}`);
      await Promise.all([fetchProducts(), fetchTrashProducts()]);
      toast({
        title: "Moved to Trash",
        description: result?.message || `${book.title} has been moved to trash.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
      await fetchProducts();
    }
  };

  const restoreProduct = async (book: any) => {
    try {
      await api.post(`/admin/books/${book.id}/restore`);
      setTrashProducts((prev) => prev.filter((b) => b.id !== book.id));
      await fetchProducts();
      toast({
        title: "Product Restored",
        description: `${book.title} has been restored successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error restoring product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTimeRemaining = (deletedAtStr: string) => {
    if (!deletedAtStr) return "Unknown";
    const deletedAt = new Date(deletedAtStr);
    const expiry = new Date(deletedAt.getTime() + 24 * 60 * 60 * 1000);
    const diffMs = expiry.getTime() - Date.now();
    if (diffMs <= 0) return "Expiring...";
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m left`;
    }
    return `${diffMins}m left`;
  };

  if (isLoading) {
    return <div className="text-botanical-forest/60">Loading products...</div>;
  }

  const filtered = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q);
  });

  const filteredTrash = trashProducts.filter((p) => {
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
            Manage your book catalog — enable, disable, or move titles to trash.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin/products/add">
            <button className="flex items-center gap-2 px-5 py-2 bg-botanical-forest text-white rounded-lg hover:bg-botanical-forest/90 transition-all text-sm font-semibold shadow-sm">
              <Plus size={18} />
              Add Product
            </button>
          </Link>
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

      <Tabs defaultValue="active" className="w-full">
        <div className="border-b border-botanical-sage/20 pb-4">
          <TabsList className="bg-botanical-alabaster border border-botanical-sage/20">
            <TabsTrigger value="active" className="px-6 py-1.5 data-[state=active]:bg-botanical-forest data-[state=active]:text-white">
              All Products
            </TabsTrigger>
            <TabsTrigger value="trash" className="px-6 py-1.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white flex items-center gap-1.5">
              <Trash2 size={14} />
              Trash
              {trashProducts.length > 0 && (
                <span className="ml-1 bg-white/20 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {trashProducts.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-6">
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
                  <TableHead className="text-botanical-forest/70 font-semibold">Stock</TableHead>
                  <TableHead className="text-botanical-forest/70 font-semibold">Sold</TableHead>
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
                          <img src={mediaUrl(book.coverImage)} alt="" className="w-10 h-14 rounded object-cover" />
                        )}
                        <div>
                          <span>{book.title}</span>
                          <p className="text-[10px] text-botanical-forest/45">
                            {book.isbn ? `ISBN: ${book.isbn}` : "ISBN not set"}
                            {book.pageCount ? ` · ${book.pageCount} pages` : ""}
                            {book.bindingDetails ? ` · ${book.bindingDetails}` : ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-botanical-sage/30 text-botanical-forest/70 text-[10px] uppercase font-bold">
                        {book.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {book.type !== "EBOOK" ? (
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-semibold text-botanical-forest">{book.stockQuantity || 0}</span>
                          {(book.stockQuantity || 0) < 10 && (
                            <span className="flex items-center text-[10px] text-amber-600 font-bold uppercase gap-1 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <AlertTriangle size={10} /> Low Stock
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-botanical-forest/40 text-xs italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-botanical-forest">{book.copiesSold || 0}</span>
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
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/products/edit/${book.id}`}>
                          <button
                            className="p-2 rounded-lg text-botanical-forest/60 hover:text-botanical-terracotta hover:bg-botanical-terracotta/10 transition-all"
                            title="Edit Product Details"
                          >
                            <Edit size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleActive(book)}
                          className={`p-2 rounded-lg transition-all ${
                            book.isActive
                              ? "text-amber-500 hover:bg-amber-50"
                              : "text-emerald-500 hover:bg-emerald-50"
                          }`}
                          title={book.isActive ? "Disable" : "Enable"}
                        >
                          {book.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => deleteProduct(book)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-all"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-botanical-forest/50">
                      {searchQuery ? "No products match your search." : "No products found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>

        <TabsContent value="trash" className="mt-6">
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
                  <TableHead className="text-botanical-forest/70 font-semibold">Deleted At</TableHead>
                  <TableHead className="text-botanical-forest/70 font-semibold">Time Remaining</TableHead>
                  <TableHead className="text-right text-botanical-forest/70 font-semibold pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrash.map((book) => (
                  <TableRow key={book.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/40 transition-colors group">
                    <TableCell className="font-medium text-botanical-forest py-3">
                      <div className="flex items-center gap-3">
                        {book.coverImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mediaUrl(book.coverImage)} alt="" className="w-10 h-14 rounded object-cover" />
                        )}
                        <div>
                          <span>{book.title}</span>
                          <p className="text-[10px] text-botanical-forest/45">
                            {book.isbn ? `ISBN: ${book.isbn}` : "ISBN not set"}
                          </p>
                        </div>
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
                    <TableCell className="text-botanical-forest/70 text-sm">
                      {new Date(book.deletedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold bg-amber-50 text-amber-700 border-amber-200 animate-pulse">
                        {getTimeRemaining(book.deletedAt)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => restoreProduct(book)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-all"
                          title="Restore Product"
                        >
                          <RotateCcw size={14} />
                          Restore
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTrash.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-botanical-forest/50">
                      {searchQuery ? "No trash products match your search." : "Trash is empty."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
