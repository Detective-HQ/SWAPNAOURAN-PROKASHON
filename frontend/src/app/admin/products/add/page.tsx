"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Upload, FileText, ImageIcon, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    type: "PHYSICAL",
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [sampleChapterFile, setSampleChapterFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<{ cover: string | null }>({ cover: null });

  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: "cover" | "ebook" | "sample") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === "cover") {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => ({ ...prev, cover: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else if (field === "ebook") {
      setEbookFile(file);
    } else {
      setSampleChapterFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("type", formData.type);

      if (coverImage) {
        data.append("coverImage", coverImage);
      }

      if (formData.type === "EBOOK" && ebookFile) {
        data.append("file", ebookFile);
      } else if (formData.type === "EBOOK" && !ebookFile) {
        throw new Error("Please upload an ebook file");
      }

      if (sampleChapterFile) {
        data.append("sampleChapter", sampleChapterFile);
      }

      await api.post("/books/with-files", data);

      toast({
        title: "Success!",
        description: "Book has been added successfully.",
      });
      router.push("/admin/products");
    } catch (error: any) {
      toast({
        title: "Error adding book",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-headline font-bold text-botanical-forest">Add New Book</h1>
          <p className="text-botanical-forest/70 font-body">List a new physical book or ebook in the store.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-botanical-forest/80">Book Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. The Great Gatsby"
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
              placeholder="Detailed description of the book..."
              className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest min-h-[150px] focus-visible:ring-botanical-terracotta"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-botanical-forest/80">Price (₹)</label>
              <Input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="299"
                className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest focus-visible:ring-botanical-terracotta"
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
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right Column: Media Uploads */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-botanical-forest/80">Cover Image</label>
            <div 
              className="border-2 border-dashed border-botanical-sage/40 rounded-2xl p-4 flex flex-col items-center justify-center gap-4 bg-botanical-alabaster hover:bg-botanical-sage/10 transition-colors cursor-pointer relative overflow-hidden h-[300px]"
              onClick={() => document.getElementById("cover-upload")?.click()}
            >
              {previews.cover ? (
                <img 
                  src={previews.cover} 
                  alt="Cover preview" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <>
                  <div className="p-4 rounded-full bg-botanical-sage/10 text-botanical-forest/60">
                    <ImageIcon size={32} />
                  </div>
                  <p className="text-sm text-botanical-forest/60 text-center font-medium">
                    Click to upload cover image<br />
                    <span className="text-xs font-normal">Supports JPG, PNG, WEBP</span>
                  </p>
                </>
              )}
              <input 
                id="cover-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, "cover")}
              />
            </div>
          </div>

          {formData.type === "EBOOK" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-botanical-forest/80">E-Book File (PDF/EPUB)</label>
              <div 
                className="border border-botanical-sage/30 rounded-xl p-4 flex items-center gap-4 bg-botanical-alabaster hover:bg-botanical-sage/10 transition-colors cursor-pointer"
                onClick={() => document.getElementById("ebook-upload")?.click()}
              >
                <div className="p-2 rounded-lg bg-botanical-sage/20 text-botanical-forest">
                  <FileText size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-botanical-forest truncate">
                    {ebookFile ? ebookFile.name : "Select ebook file"}
                  </p>
                  <p className="text-xs text-botanical-forest/60">Max size 50MB</p>
                </div>
                <Upload size={16} className="text-botanical-forest/50" />
                <input 
                  id="ebook-upload" 
                  type="file" 
                  accept=".pdf,.epub" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e, "ebook")}
                />
              </div>
            </motion.div>
          )}

          {/* Sample Chapter Upload */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-botanical-forest/80">Sample Chapter (PDF) — Optional</label>
            <div
              className="border-2 border-dashed border-botanical-sage/30 rounded-xl p-4 flex items-center gap-4 bg-botanical-alabaster hover:bg-botanical-sage/10 transition-colors cursor-pointer"
              onClick={() => document.getElementById("sample-upload")?.click()}
            >
              <div className="p-2 rounded-lg bg-botanical-sage/20 text-botanical-forest">
                <BookOpen size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-botanical-forest truncate">
                  {sampleChapterFile ? sampleChapterFile.name : "Upload a sample chapter PDF"}
                </p>
                <p className="text-xs text-botanical-forest/60">Let readers preview before buying</p>
              </div>
              <Upload size={16} className="text-botanical-forest/50" />
              <input
                id="sample-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e, "sample")}
              />
            </div>
          </motion.div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-semibold bg-botanical-forest hover:bg-botanical-forest/90 text-white rounded-xl shadow-lg transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Product...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
