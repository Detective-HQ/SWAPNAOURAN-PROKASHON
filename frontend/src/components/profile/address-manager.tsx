'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/use-api';
import { BauhausCard } from '@/components/bauhaus/bauhaus-card';
import { BauhausButton } from '@/components/bauhaus/bauhaus-primitives';
import { MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

export function AddressManager() {
  const api = useApi();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [api]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/addresses');
      setAddresses(res.data || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address: any) => {
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setEditingId(address.id);
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.del(`/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/addresses/${id}`, { isDefault: true });
      fetchAddresses();
    } catch (err: any) {
      alert(err.message || 'Failed to set default address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, formData);
      } else {
        await api.post('/addresses', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false
      });
      fetchAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading addresses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black uppercase flex items-center gap-2">
          <MapPin className="text-[#D02020]" />
          Saved Addresses
        </h3>
        {!showForm && (
          <BauhausButton variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2 inline" /> Add New
          </BauhausButton>
        )}
      </div>

      {showForm && (
        <BauhausCard decorationColor="yellow" className="bg-[#121212] text-white">
          <h4 className="text-lg font-black mb-4 uppercase tracking-widest">{editingId ? 'Edit Address' : 'Add New Address'}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/10 border border-white/20 p-2 text-sm focus:outline-none focus:border-white" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">Phone Number</label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/10 border border-white/20 p-2 text-sm focus:outline-none focus:border-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">Address Line</label>
              <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white/10 border border-white/20 p-2 text-sm focus:outline-none focus:border-white" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-white/10 border border-white/20 p-2 text-sm focus:outline-none focus:border-white" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">State</label>
                <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-white/10 border border-white/20 p-2 text-sm focus:outline-none focus:border-white" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-widest">PIN Code</label>
                <input required type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-white/10 border border-white/20 p-2 text-sm focus:outline-none focus:border-white" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-4 h-4" />
              <label htmlFor="isDefault" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Set as Default Address</label>
            </div>
            {error && <p className="text-[#D02020] text-xs font-bold">{error}</p>}
            <div className="flex gap-4 pt-4 border-t border-white/20">
              <BauhausButton type="submit" variant="primary" size="sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save Address'}
              </BauhausButton>
              <BauhausButton type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </BauhausButton>
            </div>
          </form>
        </BauhausCard>
      )}

      {!showForm && addresses.length === 0 && (
        <div className="p-8 text-center border-2 border-dashed border-black/20 text-black/50 font-bold uppercase tracking-widest text-sm">
          No addresses saved yet.
        </div>
      )}

      {!showForm && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map(address => (
            <BauhausCard key={address.id} decorationColor={address.isDefault ? "blue" : "black"} className="relative">
              {address.isDefault && (
                <div className="absolute top-4 right-4 text-[#1040C0] flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> Default
                </div>
              )}
              <h4 className="font-black text-lg mb-2">{address.name}</h4>
              <p className="text-sm font-medium mb-1">{address.address}</p>
              <p className="text-sm font-medium mb-1">{address.city}, {address.state} - {address.pincode}</p>
              <p className="text-sm font-medium mb-4">Phone: {address.phone}</p>
              
              <div className="flex gap-4 border-t border-black/10 pt-4 mt-auto">
                <button onClick={() => handleEdit(address)} className="text-xs font-black uppercase tracking-widest text-[#1040C0] flex items-center gap-1 hover:underline">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-xs font-black uppercase tracking-widest text-[#D02020] flex items-center gap-1 hover:underline">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
                {!address.isDefault && (
                  <button onClick={() => handleSetDefault(address.id)} className="text-xs font-black uppercase tracking-widest text-black/60 flex items-center gap-1 hover:underline ml-auto">
                    Set Default
                  </button>
                )}
              </div>
            </BauhausCard>
          ))}
        </div>
      )}
    </div>
  );
}
