"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  BookOpen,
  RotateCcw,
  Mail,
  Megaphone,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Returns", href: "/admin/returns", icon: RotateCcw },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full border-r border-botanical-sage/20 bg-white shrink-0 overflow-hidden"
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-botanical-forest text-white shrink-0">
          <BookOpen size={20} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-headline font-bold text-botanical-forest leading-tight whitespace-nowrap">
                Swapno Uran
              </p>
              <p className="text-[11px] text-botanical-forest/50 font-body whitespace-nowrap">
                Admin Panel
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-6 -right-3 z-10 h-6 w-6 rounded-full border border-botanical-sage/30 bg-white shadow-sm flex items-center justify-center hover:bg-botanical-alabaster transition-colors"
        aria-label="Toggle sidebar"
      >
        <ChevronLeft
          size={14}
          className={`text-botanical-forest/60 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
        />
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-botanical-forest text-white shadow-sm"
                    : "text-botanical-forest/70 hover:bg-botanical-alabaster hover:text-botanical-forest"
                }`}
              >
                <Icon
                  size={20}
                  className={`shrink-0 ${active ? "text-white" : "text-botanical-forest/50 group-hover:text-botanical-forest"}`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer: User info + Logout */}
      <div className="border-t border-botanical-sage/15 px-3 py-4 mt-auto">
        {user && !collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-3 py-2 mb-2"
          >
            <div className="h-8 w-8 rounded-full bg-botanical-clay text-botanical-forest flex items-center justify-center text-xs font-semibold shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-botanical-forest truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-botanical-forest/50 truncate">
                {user.role}
              </p>
            </div>
          </motion.div>
        )}
        <Link href="/">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-botanical-forest/60 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
            <LogOut size={20} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Back to Site
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </Link>
      </div>
    </motion.aside>
  );
}
