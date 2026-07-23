"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Megaphone, Zap, Loader2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function MarketingPage() {
  const api = useApi();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [banner, setBanner] = useState({ active: false, text: "" });
  const [flashSale, setFlashSale] = useState({ active: false, bookType: "ALL", discountPercentage: "10", endTime: "" });

  type FlashSaleState = {
    active: boolean;
    bookType: string;
    discountPercentage: string;
    endTime: string;
  };

  useEffect(() => {
    fetchSettings();
  }, [api]);

  const formatEndTimeForInput = (endTime?: string) => {
    if (!endTime) return "";

    const parsed = new Date(endTime);
    if (Number.isNaN(parsed.getTime())) return "";

    const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get("/admin/settings");
      if (res?.data) {
        setBanner(res.data.announcementBanner || { active: false, text: "" });

        const fs = res.data.flashSale || { active: false, bookType: "ALL", discountPercentage: "10", endTime: "" };
        setFlashSale({
          ...fs,
          discountPercentage: String(fs.discountPercentage ?? "10"),
          endTime: formatEndTimeForInput(fs.endTime),
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSetting = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      await api.put("/admin/settings", { key, value });
      toast({ title: "Settings Saved", description: `${key} has been successfully updated.` });
    } catch (err: any) {
      toast({ title: "Error Saving", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const buildFlashSalePayload = () => {
    const normalizedDiscount = Number(flashSale.discountPercentage);
    const parsedEndTime = flashSale.endTime ? new Date(flashSale.endTime) : null;
    const fallbackEndTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const payload = {
      ...flashSale,
      active: true,
      discountPercentage: Number.isFinite(normalizedDiscount) && normalizedDiscount > 0
        ? normalizedDiscount
        : 10,
      endTime: parsedEndTime && !Number.isNaN(parsedEndTime.getTime())
        ? parsedEndTime.toISOString()
        : fallbackEndTime,
    };

    const nextState: FlashSaleState = {
      ...flashSale,
      active: true,
      discountPercentage: String(payload.discountPercentage),
      endTime: payload.endTime,
    };

    setFlashSale(nextState);
    return payload;
  };

  if (isLoading) return <div className="text-botanical-forest/60">Loading settings...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
          Marketing Campaigns
        </h1>
        <p className="text-botanical-forest/70 font-body mt-1">Manage global site banners and automated flash sales.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Announcement Banner */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100/50 rounded-xl">
                <Megaphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-botanical-forest">Announcement Banner</h2>
                <p className="text-xs text-botanical-forest/60">Scrolling marquee across the top of the site</p>
              </div>
            </div>
            <Switch 
              checked={banner.active} 
              onCheckedChange={(val) => {
                const updated = { ...banner, active: val };
                setBanner(updated);
                saveSetting("ANNOUNCEMENT_BANNER", updated);
              }} 
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-botanical-forest/60 mb-1.5 block">Banner Text</label>
              <Input 
                value={banner.text}
                onChange={(e) => setBanner({ ...banner, text: e.target.value })}
                placeholder="e.g., Use code SWAPNA20 for 20% off all orders!"
                className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest"
              />
            </div>
            <Button 
              onClick={() => saveSetting("ANNOUNCEMENT_BANNER", banner)}
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Banner
            </Button>
          </div>
        </motion.div>

        {/* Flash Sale Manager */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-botanical-terracotta/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-50 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-botanical-terracotta/10 rounded-xl">
                <Zap className="w-6 h-6 text-botanical-terracotta" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-botanical-forest">Flash Sale Manager</h2>
                <p className="text-xs text-botanical-forest/60">Automated global discounts</p>
              </div>
            </div>
            <Switch 
              checked={flashSale.active} 
              onCheckedChange={(val) => {
                const updated = { ...flashSale, active: val };
                setFlashSale(updated);
                saveSetting("FLASH_SALE", updated);
              }} 
            />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-botanical-forest/60 mb-1.5 block">Target Category</label>
                <Select value={flashSale.bookType} onValueChange={(val) => setFlashSale({ ...flashSale, bookType: val })}>
                  <SelectTrigger className="bg-botanical-alabaster border-botanical-sage/30">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Products</SelectItem>
                    <SelectItem value="PHYSICAL">Bengali Physical Books</SelectItem>
                    <SelectItem value="EBOOK">E-Books</SelectItem>
                    <SelectItem value="ENGLISH_BOOK">English Books</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-botanical-forest/60 mb-1.5 block">Discount %</label>
                <Input 
                  type="number"
                  min="1"
                  max="99"
                  value={flashSale.discountPercentage}
                  onChange={(e) => setFlashSale({ ...flashSale, discountPercentage: e.target.value })}
                  className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-botanical-forest/60 mb-1.5 block">Ends At</label>
              <Input 
                type="datetime-local"
                value={flashSale.endTime}
                onChange={(e) => setFlashSale({ ...flashSale, endTime: e.target.value })}
                className="bg-botanical-alabaster border-botanical-sage/30 text-botanical-forest"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={() => {
                  const payload = buildFlashSalePayload();
                  saveSetting("FLASH_SALE", payload);
                }}
                disabled={isSaving}
                className="w-full bg-botanical-terracotta hover:bg-[#c04b36] text-white"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Flash Sale
              </Button>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
