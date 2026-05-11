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
import { Search } from "lucide-react";

export default function AdminUsersPage() {
  const api = useApi();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    void fetchUsers();
  }, [api]);

  const fetchUsers = async () => {
    try {
      const data = await api.get("/admin/users");
      setUsers(data?.data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-botanical-forest/60">Loading users...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight text-botanical-forest pb-2">
            Users Management
          </h1>
          <p className="text-botanical-forest/70 font-body mt-1">Manage platform members, roles, and access.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-botanical-forest/50" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
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
              <TableHead className="text-botanical-forest/70 font-semibold py-4">Name</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Email</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Role</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">College</TableHead>
              <TableHead className="text-botanical-forest/70 font-semibold">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users
              .filter((u) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
              })
              .map((user, i) => (
              <TableRow key={user.id} className="border-b border-botanical-sage/10 hover:bg-botanical-alabaster/40 transition-colors group">
                <TableCell className="font-medium text-botanical-forest py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-botanical-clay text-botanical-forest flex items-center justify-center text-xs font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </TableCell>
                <TableCell className="text-botanical-forest/80">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className={
                    user.role === 'ADMIN' 
                      ? "bg-botanical-forest text-white hover:bg-botanical-forest/90" 
                      : "bg-botanical-alabaster text-botanical-forest border border-botanical-sage/20 hover:bg-botanical-alabaster"
                  }>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-botanical-forest/70">
                  <span className="bg-botanical-alabaster px-2 py-1 rounded text-xs border border-botanical-sage/20">{user.college || 'General'}</span>
                </TableCell>
                <TableCell className="text-botanical-forest/50 text-sm">{new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</TableCell>
              </TableRow>
            ))}
            {users.filter((u) => !searchQuery.trim() || u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-botanical-forest/50">
                  {searchQuery ? 'No users match your search.' : 'No users found in the system.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </motion.div>
  );
}
