import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react'

export default async function AddressBookPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch addresses
  const { data: addresses } = await supabase
    .from('shipping_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
        <h1 className="font-serif text-3xl">Address Book</h1>
        <Button className="bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest text-xs flex items-center gap-2">
          <Plus size={16} /> Add New
        </Button>
      </div>
      
      {(!addresses || addresses.length === 0) ? (
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
                <span className="absolute top-0 right-0 bg-primary text-background text-[10px] uppercase tracking-widest px-2 py-1">
                  Default
                </span>
              )}
              <h3 className="font-medium mb-1 text-primary">{address.label || 'Address'}</h3>
              <p className="text-sm text-white mb-4">{address.recipient_name}</p>
              <div className="text-sm text-zinc-400 space-y-1 font-light">
                <p>{address.street_address}</p>
                <p>{address.city}, {address.province} {address.postal_code}</p>
                <p>{address.phone}</p>
              </div>
              <div className="flex gap-4 mt-6 pt-4 border-t border-border">
                <button className="text-xs uppercase tracking-widest text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button className="text-xs uppercase tracking-widest text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors">
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
