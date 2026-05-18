"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  ShoppingCart, 
  BookOpen, 
  Users, 
  ArrowLeft,
  Calendar,
  Activity,
  FileBarChart
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";

export default function AdminAnalyticsPage() {
  const api = useApi();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void fetchAnalytics();
  }, [api]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get("/admin/analytics");
      setAnalytics(res?.data || null);
    } catch (error: any) {
      toast({
        title: "Error fetching analytics",
        description: error.message || "Failed to load detailed analytics.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-botanical-forest/50 font-body">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-botanical-terracotta border-t-transparent rounded-full animate-spin" />
          <span>Generating Analytics Reports...</span>
        </div>
      </div>
    );
  }

  // Fallback data if none exists
  const salesOverTime = analytics?.salesOverTime || [];
  const topBooks = analytics?.topBooks || [];
  const salesByBookType = analytics?.salesByBookType || {
    ebook: { units: 0, revenue: 0 },
    physical: { units: 0, revenue: 0 }
  };

  const bookTypeData = [
    { name: "E-Books", value: salesByBookType.ebook.revenue, units: salesByBookType.ebook.units, color: "#C27B66" },
    { name: "Physical Books", value: salesByBookType.physical.revenue, units: salesByBookType.physical.units, color: "#2D3A31" }
  ];

  const statCards = [
    {
      title: "Total Platform Sales",
      value: `₹${(analytics?.totalSales || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      desc: "Gross revenue generated from paid orders"
    },
    {
      title: "Paid Orders",
      value: analytics?.paidOrders || 0,
      icon: ShoppingCart,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      desc: "Total number of successful transactions"
    },
    {
      title: "Total Customer Base",
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      desc: "Registered users on the platform"
    },
    {
      title: "Digital vs Physical Ratio",
      value: `${salesByBookType.ebook.units}:${salesByBookType.physical.units}`,
      icon: BookOpen,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      desc: "Units ratio of E-Books to Physical purchases"
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-botanical-sage/20 p-3 rounded-xl shadow-xl font-body">
          <p className="text-botanical-forest/60 text-xs mb-1 font-semibold">{label}</p>
          <p className="text-botanical-forest font-bold text-sm">
            {payload[0].name === "revenue" || payload[0].name === "Revenue" ? "₹" : ""}
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-16 font-body min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-1 text-xs font-semibold text-botanical-forest/60 hover:text-botanical-forest mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest flex items-center gap-2">
            <FileBarChart className="text-botanical-terracotta" size={28} />
            Advanced Analytics
          </h1>
          <p className="text-botanical-forest/70 mt-1">
            Real-time sales tracking, product performance metrics, and system-wide analysis.
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-botanical-alabaster rounded-xl border border-botanical-sage/20 text-xs text-botanical-forest/70 font-semibold">
          <Calendar size={14} className="text-botanical-terracotta" />
          Last 30 Days
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              key={index}
              className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm font-semibold text-botanical-forest/60">{card.title}</span>
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-botanical-forest tracking-tight">{card.value}</p>
                <p className="text-[11px] text-botanical-forest/40 mt-1">{card.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Over Time (Line Area) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-botanical-forest flex items-center gap-2 font-headline">
              <Activity className="text-botanical-terracotta" size={18} />
              Sales & Revenue Trend
            </h2>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              Live updates
            </span>
          </div>
          
          <div className="h-80 w-full mt-4">
            {salesOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C27B66" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#C27B66" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="date" stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 11, opacity: 0.6 }} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(45,58,49,0.1)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C27B66" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No transaction records found for this period</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sales by Type (Pie Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <h2 className="text-lg font-bold text-botanical-forest font-headline mb-6">
            Revenue Share by Format
          </h2>
          
          <div className="h-60 w-full relative flex items-center justify-center flex-grow">
            {salesByBookType.ebook.revenue === 0 && salesByBookType.physical.revenue === 0 ? (
              <div className="text-center p-6 text-botanical-forest/40 text-xs italic">
                No purchases yet to distribute format ratios
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {bookTypeData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: any) => [`₹${val.toLocaleString()}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="space-y-3 mt-4 pt-4 border-t border-botanical-sage/10">
            {bookTypeData.map((type, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-botanical-forest">{type.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-botanical-forest">₹{type.value.toLocaleString()}</p>
                  <p className="text-[10px] text-botanical-forest/50 font-normal">{type.units} units sold</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top 5 Products Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3 bg-white border border-botanical-sage/20 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-bold text-botanical-forest font-headline mb-6">
            Top Performing Books (by Volume)
          </h2>
          
          <div className="h-80 w-full mt-4">
            {topBooks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topBooks} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" strokeOpacity={0.5} horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#2D3A31" opacity={0.6} tick={{ fill: '#2D3A31', fontSize: 11, opacity: 0.6 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="title" stroke="#2D3A31" opacity={0.8} tick={{ fill: '#2D3A31', fontSize: 10, fontWeight: 'bold' }} width={120} axisLine={false} tickLine={false} />
                  <RechartsTooltip formatter={(val: any, name: any) => [val, name === 'units' ? 'Units Sold' : 'Revenue (₹)']} />
                  <Bar dataKey="units" name="Units" fill="#C27B66" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center border border-dashed border-botanical-sage/30 rounded-xl bg-botanical-alabaster">
                <p className="text-botanical-forest/50 text-sm">No book metrics available yet</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
