'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Shield, Ban, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { issueSerialNumber, revokeSerialNumber } from './actions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AuthenticityManagerProps {
  initialRecords: any[]
  products: any[]
}

export default function AuthenticityManager({ initialRecords, products }: AuthenticityManagerProps) {
  const [records, setRecords] = useState(initialRecords)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Issue Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [serialNumber, setSerialNumber] = useState('')
  const [isIssuing, setIsIssuing] = useState(false)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)

  const handleIssue = async () => {
    if (!selectedProductId || !serialNumber.trim()) {
      toast.error('Please select a product and enter a serial number')
      return
    }

    setIsIssuing(true)
    const res = await issueSerialNumber(selectedProductId, serialNumber)
    if (res.success) {
      toast.success('Serial number issued successfully')
      setIsIssueModalOpen(false)
      setSerialNumber('')
      setSelectedProductId('')
      // In a real app we'd rely on Supabase Realtime here, but we can do a hard refresh or optimistic update
      window.location.reload()
    } else {
      toast.error('Failed to issue: ' + res.error)
    }
    setIsIssuing(false)
  }

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this serial number? This indicates the item is no longer authentic or has been flagged.')) return
    
    setIsRevoking(id)
    const res = await revokeSerialNumber(id)
    if (res.success) {
      toast.success('Record revoked')
      setRecords(records.map(r => r.id === id ? { ...r, status: 'revoked' } : r))
    } else {
      toast.error('Failed to revoke: ' + res.error)
    }
    setIsRevoking(null)
  }

  const filteredRecords = records.filter(record => 
    record.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.products?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search Serial Number or Product..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all shadow-lg"
          />
        </div>
        
        <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg w-full md:w-auto font-bold tracking-wide">
              <Shield size={16} className="mr-2" />
              Issue New Authenticity
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl tracking-wide">Issue Serial Number</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Product</label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 focus:ring-emerald-500/50">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white max-h-60">
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id} className="hover:bg-zinc-800 focus:bg-zinc-800">
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Serial Number</label>
                <Input 
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. LUX-28-001X9"
                  className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500/50 uppercase font-mono"
                />
              </div>

              <Button 
                onClick={handleIssue} 
                disabled={isIssuing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-widest mt-2"
              >
                {isIssuing ? 'Issuing...' : 'Register Authenticity'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-zinc-950/30">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Serial Number</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Product</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Status</TableHead>
              <TableHead className="px-6 py-4 text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Issued On</TableHead>
              <TableHead className="px-6 py-4 text-right text-zinc-500 font-bold uppercase tracking-tighter text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id} className="border-zinc-800 hover:bg-zinc-800/20 transition-colors">
                <TableCell className="px-6 py-4 font-mono font-bold text-sm text-white">
                  {record.serial_number}
                </TableCell>
                <TableCell className="px-6 py-4 text-sm text-zinc-300">
                  {record.products?.name}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {record.status === 'active' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={10} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                      <Ban size={10} /> Revoked
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4 text-xs text-zinc-500">
                  {new Date(record.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-6 py-4 text-right">
                  {record.status === 'active' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRevoke(record.id)}
                      disabled={isRevoking === record.id}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 text-[10px] uppercase font-bold tracking-widest"
                    >
                      {isRevoking === record.id ? 'Revoking...' : 'Revoke'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredRecords.length === 0 && (
          <div className="p-20 text-center">
            <Shield size={40} className="mx-auto mb-4 text-zinc-800" />
            <p className="text-zinc-500 font-serif">No authenticity records found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
