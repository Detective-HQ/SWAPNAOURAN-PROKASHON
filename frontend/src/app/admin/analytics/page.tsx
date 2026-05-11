"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  IndianRupee,
  BookOpen,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

export default function AdminAnalyticsPage() {
  const api = useApi();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    void fetchAnalytics();
  }, [api]);

  const fetchAnalytics = async () => {
    try {
      const data = await api.get("/admin/analytics");
      setAnalytics(data?.data || null);
    } catch (error: any) {
      toast({
        title: "Error fetching analytics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-botanical-forest/60">Loading analytics...</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-botanical-sage/20 p-3 rounded-lg shadow-xl">
          <p className="text-botanical-forest/70 text-xs mb-1 font-medium">{label}</p>
          {payload.map((entry: any, i: number) => (
            <p key={i} className="text-botanical-forest font-bold text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === "revenue" ? "₹" : ""}{entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const salesData = analytics?.salesOverTime || [];
  const popularBooks = analytics?.popularBooks || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
          Analytics
        </h1>
        <p className="text-botanical-forest/70 font-body mt-1">
          Deep dive into sales trends, popular titles, and platform metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-botanical-forest mb-6 flex items-center">
            <TrendingUp className="mr-2 text-botanical-terracotta" size={20} />
            Sales Over Time
          </h2>
          <div className="h-72 w-full">
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C27B66" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C27B66" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="date" stroke="#2D3A31" opacity={0.6} tick={{ fontSize: 12 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#2D3A31" opacity={0.6} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#C27B66" strokeWidth={3} fillOpacity={1} fill="url(#analyticsSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No sales data available</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-botanical-forest mb-6 flex items-center">
            <BookOpen className="mr-2 text-botanical-terracotta" size={20} />
            Popular Books
          </h2>
          <div className="h-72 w-full">
            {popularBooks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularBooks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="title" stroke="#2D3A31" opacity={0.6} tick={{ fontSize: 11 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#2D3A31" opacity={0.6} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="orders" fill="#C27B66" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No book sales data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold text-botanical-forest mb-6 flex items-center">
          <BarChart3 className="mr-2 text-botanical-terracotta" size={20} />
          Summary Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Total Orders", value: analytics?.totalOrders || 0, icon: ShoppingCart, color: "text-purple-500" },
            { label: "Total Revenue", value: `₹${analytics?.totalRevenue || 0}`, icon: IndianRupee, color: "text-yellow-500" },
            { label: "Active Users", value: analytics?.activeUsers || 0, icon: Users, color: "text-blue-500" },
            { label: "Avg Order Value", value: `₹${analytics?.avgOrderValue || 0}`, icon: TrendingUp, color: "text-green-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-4 rounded-xl bg-botanical-alabaster border border-botanical-sage/10">
                <Icon size={20} className={`mb-3 ${stat.color}`} />
                <p className="text-2xl font-bold text-botanical-forest">{stat.value}</p>
                <p className="text-xs text-botanical-forest/60 mt-1 font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
