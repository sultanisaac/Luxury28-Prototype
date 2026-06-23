'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, MapPin, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AddressBookClient({ initialAddresses, userId }: { initialAddresses: any[], userId: string }) {
  const supabase = createClient()
  const [addresses, setAddresses] = useState(initialAddresses)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    label: '', recipient_name: '', street_address: '', city: '', province: '', postal_code: '', phone: '', is_default: false
  })

  // Real-time sync
  useEffect(() => {
    const channel = supabase.channel(`rt-customer-addresses-${Math.random().toString(36).substring(7)}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'shipping_addresses', filter: `user_id=eq.${userId}` },
        async () => {
          const { data } = await supabase
            .from('shipping_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
          if (data) setAddresses(data)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId])

  const resetForm = () => {
    setForm({ label: '', recipient_name: '', street_address: '', city: '', province: '', postal_code: '', phone: '', is_default: false })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (address: any) => {
    setForm({
      label: address.label || '',
      recipient_name: address.recipient_name || '',
      street_address: address.street_address || '',
      city: address.city || '',
      province: address.province || '',
      postal_code: address.postal_code || '',
      phone: address.phone || '',
      is_default: address.is_default || false
    })
    setEditingId(address.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('shipping_addresses')
          .update({ ...form })
          .eq('id', editingId)
        if (error) throw error
        toast.success('Address updated')
      } else {
        const { error } = await supabase
          .from('shipping_addresses')
          .insert({ ...form, user_id: userId })
        if (error) throw error
        toast.success('Address added')
      }
      resetForm()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this address?')) return
    const { error } = await supabase.from('shipping_addresses').delete().eq('id', id)
    if (error) toast.error('Could not delete address')
    else toast.success('Address removed')
  }

  const inputClass = "w-full bg-background border border-border p-2.5 text-sm focus:outline-none focus:border-primary transition-colors"

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Address</h1>
        <Button onClick={() => setShowForm(true)} className="bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs flex items-center gap-2">
          <Plus size={16} /> Add New
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-8 border border-primary/30 p-6 bg-background/50 relative">
          <button onClick={resetForm} className="absolute top-4 right-4 text-muted-foreground hover:text-white">
            <X size={18} />
          </button>
          <h2 className="font-serif text-xl mb-6">{editingId ? 'Edit Address' : 'New Address'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Label (e.g. Home, Office)</label>
              <input required value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Recipient Name</label>
              <input required value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Street Address</label>
              <input required value={form.street_address} onChange={e => setForm({ ...form, street_address: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">City</label>
              <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Province / State</label>
              <input value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Postal Code</label>
              <input required value={form.postal_code} onChange={e => setForm({ ...form, postal_code: e.target.value })} className={inputClass} />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="is_default" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} className="accent-primary" />
              <label htmlFor="is_default" className="text-xs uppercase tracking-widest text-muted-foreground">Set as default</label>
            </div>
            <div className="sm:col-span-2 flex gap-4 pt-2">
              <Button disabled={saving} type="submit" className="bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs px-8">
                {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null} {editingId ? 'Update Address' : 'Save Address'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="rounded-none text-xs">Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border bg-background/30">
          <MapPin size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-serif text-xl mb-2">No addresses saved</h3>
          <p className="text-muted-foreground text-sm">Add a shipping address to speed up checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="border border-border p-6 relative bg-background/50 hover:border-primary/50 transition-colors">
              {address.is_default && (
                <span className="absolute top-0 right-0 bg-primary text-background text-[10px] uppercase tracking-widest px-2 py-1">Default</span>
              )}
              <h3 className="font-medium mb-1 text-primary">{address.label || 'Address'}</h3>
              <p className="text-sm text-white mb-4">{address.recipient_name}</p>
              <div className="text-sm text-zinc-400 space-y-1 font-light">
                <p>{address.street_address}</p>
                <p>{address.city}, {address.province} {address.postal_code}</p>
                <p>{address.phone}</p>
              </div>
              <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                <button onClick={() => handleEdit(address)} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(address.id)} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors ml-auto">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
