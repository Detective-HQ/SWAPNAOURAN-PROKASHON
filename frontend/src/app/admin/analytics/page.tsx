"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { motion } from "framer-motion";
import { BarChart2, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AdminAnalyticsPage() {
  const api = useApi();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    void fetchAnalytics();
  }, [api]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setData(res?.data || null);
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
    return <div className="text-botanical-forest">Loading analytics...</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-botanical-sage/20 p-3 rounded-lg shadow-xl">
          <p className="text-botanical-forest/70 mb-1 font-medium">{label}</p>
          <p className="text-botanical-forest font-bold">
            {payload[0].name === "revenue" ? "₹" : ""}
            {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
            Analytics & Reports
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">Deep dive into platform performance, sales, and user metrics.</p>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm w-full relative group overflow-hidden"
      >
        <h2 className="text-xl font-semibold text-botanical-forest mb-8 flex items-center">
          <TrendingUp className="mr-2 text-botanical-terracotta" size={20} />
          Sales Revenue (Last 30 Days)
        </h2>
        <div className="h-[350px] w-full mt-4">
          {data?.salesOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C27B66" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#C27B66" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="date" stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 12, opacity: 0.6 }} tickMargin={15} axisLine={false} tickLine={false} />
                <YAxis stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 12, opacity: 0.6 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(45,58,49,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="revenue" stroke="#C27B66" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
              <p className="text-botanical-forest/50 text-sm">No sales data available for the selected period</p>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Popular Products */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm relative overflow-hidden"
        >
          <h2 className="text-xl font-semibold text-botanical-forest mb-8 flex items-center">
            <BarChart2 className="mr-2 text-botanical-terracotta" size={20} />
            Top Selling Products
          </h2>
          <div className="h-[300px] w-full">
            {data?.mostPopularProducts?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data.mostPopularProducts} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#2D3A31" opacity={0.6} hide />
                  <YAxis dataKey="name" type="category" stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 12, opacity: 0.8 }} width={120} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45,58,49,0.05)' }} />
                  <Bar dataKey="sales" fill="#C27B66" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.mostPopularProducts.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No product data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm relative overflow-hidden"
        >
          <h2 className="text-xl font-semibold text-botanical-forest mb-8 flex items-center">
            <PieChartIcon className="mr-2 text-botanical-terracotta" size={20} />
            Listings by Category
          </h2>
          <div className="h-[300px] w-full">
            {data?.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.categoryDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#2D3A31', opacity: 0.8 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No category data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
