"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { Users, Package, ShoppingCart, IndianRupee, TrendingUp, Activity, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export default function AdminOverviewPage() {
  const api = useApi();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    void fetchDashboardData();
  }, [api]);

  const fetchDashboardData = async () => {
    try {
      const [statsData, analyticsData] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/analytics")
      ]);
      setStats(statsData?.data || null);
      setAnalytics(analyticsData?.data || null);
    } catch (error: any) {
      toast({
        title: "Error fetching dashboard data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-botanical-forest/50">Loading dashboard...</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-botanical-sage/20 p-3 rounded-lg shadow-xl">
          <p className="text-botanical-forest/70 text-xs mb-1 font-medium">{label}</p>
          <p className="text-botanical-forest font-bold text-sm">
            {payload[0].name === "revenue" ? "₹" : ""}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const statCards = [
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Products Listed", value: stats?.totalProducts || 0, icon: Package, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Total Revenue", value: `₹${stats?.totalRevenue || 0}`, icon: IndianRupee, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
          Dashboard Overview
        </h1>
        <p className="text-botanical-forest/70 font-body mt-2">Welcome back. Here's what's happening on CampusKart today.</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              key={index} 
              className="relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-botanical-sage/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative flex flex-col p-6 bg-white border border-botanical-sage/20 rounded-2xl shadow-sm hover:shadow-md transition-all h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <TrendingUp size={14} className="mr-1" />
                    <span>Live</span>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <p className="text-sm text-botanical-forest/60 font-medium mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-botanical-forest">{card.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="col-span-1 lg:col-span-2 bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm relative overflow-hidden group"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-botanical-forest flex items-center">
              <Activity className="mr-2 text-botanical-terracotta" size={20} />
              Platform Sales (Last 30 Days)
            </h2>
            <Link href="/admin/analytics" className="text-sm text-botanical-forest/60 hover:text-botanical-forest flex items-center transition-colors">
              View Analytics <ArrowUpRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="h-64 w-full mt-4">
            {analytics?.salesOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C27B66" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C27B66" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="date" stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 12, opacity: 0.6 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 12, opacity: 0.6 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(45,58,49,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#C27B66" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No sales data available for the selected period</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="col-span-1 bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm relative overflow-hidden"
        >
          <h2 className="text-xl font-semibold text-botanical-forest mb-6">System Status</h2>
          
          <div className="space-y-4">
            {['Database', 'Cloudinary API', 'Payment Gateway'].map((sys, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-botanical-sage/20 bg-botanical-alabaster hover:bg-botanical-sage/10 transition-colors cursor-default">
                <span className="text-sm font-medium text-botanical-forest/80">{sys}</span>
                <div className="flex items-center">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs text-emerald-600 font-medium">Operational</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
