"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    mrp: "",
    discountPercentage: "0",
    type: "PHYSICAL",
    isActive: true
  });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (id) fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`/books/${id}`);
      const book = response.data;
      
      setFormData({
        title: book.title || "",
        description: book.description || "",
        price: book.price || "",
        mrp: book.mrp || "",
        discountPercentage: book.discountPercentage || "0",
        type: book.type || "PHYSICAL",
        isActive: book.isActive !== false
      });
    } catch (error: any) {
      toast({
        title: "Error fetching book",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "mrp" || name === "discountPercentage") {
        const mrpVal = Number(newData.mrp) || 0;
        const discountVal = Number(newData.discountPercentage) || 0;
        newData.price = (mrpVal - (mrpVal * (discountVal / 100))).toFixed(2);
      }
      return newData;
    });
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
      };

      if (formData.mrp) payload.mrp = Number(formData.mrp);
      if (formData.discountPercentage) payload.discountPercentage = Number(formData.discountPercentage);
      if (!formData.mrp) payload.price = Number(formData.price);

      await api.put(`/books/${id}`, payload);

      toast({
        title: "Success!",
        description: "Book pricing and details updated successfully.",
      });
      router.push("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error updating book",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-botanical-forest" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon" className="rounded-full text-botanical-forest hover:bg-botanical-sage/20">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-headline font-bold text-botanical-forest">Edit Product Pricing</h1>
          <p className="text-botanical-forest/70 font-body">Update MRP and Discounts for {formData.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-botanical-forest/80">Book Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest focus-visible:ring-botanical-terracotta"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-botanical-forest/80">Description</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest min-h-[150px] focus-visible:ring-botanical-terracotta"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-botanical-forest/80">Book Type</label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest focus:ring-botanical-terracotta">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-botanical-sage/20 text-botanical-forest">
                <SelectItem value="PHYSICAL" className="hover:bg-botanical-alabaster focus:bg-botanical-alabaster cursor-pointer">Physical Book</SelectItem>
                <SelectItem value="EBOOK" className="hover:bg-botanical-alabaster focus:bg-botanical-alabaster cursor-pointer">E-Book (Digital)</SelectItem>
                <SelectItem value="ENGLISH_BOOK" className="hover:bg-botanical-alabaster focus:bg-botanical-alabaster cursor-pointer">English Book</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-botanical-clay/10 p-6 rounded-2xl border border-botanical-sage/20 space-y-6">
            <h3 className="text-lg font-semibold text-botanical-forest">Pricing Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-botanical-forest/80">MRP (₹)</label>
                <Input
                  name="mrp"
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  placeholder="299"
                  className="bg-white border-botanical-sage/30 text-botanical-forest focus-visible:ring-botanical-terracotta"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-botanical-forest/80">Discount (%)</label>
                <Input
                  name="discountPercentage"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  placeholder="10"
                  className="bg-white border-botanical-sage/30 text-botanical-forest focus-visible:ring-botanical-terracotta"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-botanical-forest/80">Selling Price (₹)</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                readOnly
                className="bg-botanical-sage/20 border-botanical-sage/40 text-botanical-forest cursor-not-allowed font-bold text-lg"
              />
            </div>
            
            <p className="text-xs text-botanical-forest/60 italic">
              Note: Selling price is automatically calculated based on the MRP and Discount. To change the cover image or files, please delete and re-add the book.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-botanical-forest hover:bg-botanical-forest/90 text-white rounded-xl shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
