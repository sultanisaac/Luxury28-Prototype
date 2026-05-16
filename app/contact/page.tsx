'use client'

import { useState } from 'react'
import { submitContactInquiry } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)
    
    const result = await submitContactInquiry(formData)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
    
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/">
            <Logo size={24} />
          </Link>
          <Button variant="ghost" className="uppercase tracking-widest text-sm" asChild>
            <Link href="/">Return to Store</Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left Column: Contact Info */}
        <div className="space-y-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 leading-tight">Get in Touch</h1>
            <p className="text-zinc-400 text-lg font-light leading-relaxed">
              Whether you have questions about a specific timepiece, need assistance with your order, or require support with a payment issue, our concierge team is at your disposal.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Phone className="text-amber-500" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Direct Line</h3>
                <p className="text-zinc-400 font-light">+1 234 567 89</p>
                <p className="text-zinc-500 text-sm mt-1">Available Mon-Fri, 9am - 6pm EST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <Mail className="text-amber-500" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Email Us</h3>
                <p className="text-zinc-400 font-light">luxury28@luxury28.com</p>
                <p className="text-zinc-500 text-sm mt-1">We aim to respond within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                <MapPin className="text-amber-500" size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Boutique Address</h3>
                <p className="text-zinc-400 font-light">128 Luxury Avenue, Suite 2800<br />New York, NY 10022</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="bg-zinc-950 border border-zinc-800 p-8 md:p-10 rounded-sm shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-amber-400" />
          
          <h2 className="text-2xl font-serif text-white mb-8">Send an Inquiry</h2>

          {success ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="text-green-500" size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-white mb-2">Message Received</h3>
                <p className="text-zinc-400 font-light">
                  Thank you for reaching out. Our staff has been notified and will review your inquiry shortly. We will reply to your email address as soon as possible.
                </p>
              </div>
              <Button className="bg-white text-black hover:bg-zinc-200 uppercase tracking-widest mt-4" asChild>
                <Link href="/">Return to Store</Link>
              </Button>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-950/50 border border-red-900 text-red-200 text-sm rounded">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm text-zinc-400 uppercase tracking-wider">Full Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-amber-500 h-12" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-zinc-400 uppercase tracking-wider">Email Address</label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-amber-500 h-12" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm text-zinc-400 uppercase tracking-wider">Subject</label>
                <Input 
                  id="subject" 
                  name="subject" 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-amber-500 h-12" 
                  placeholder="Order Issue, Payment Question, etc." 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm text-zinc-400 uppercase tracking-wider">Message</label>
                <Textarea 
                  id="message" 
                  name="message" 
                  required 
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-amber-500 min-h-[150px] resize-none" 
                  placeholder="How can we assist you today?" 
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-white text-black hover:bg-zinc-200 h-14 uppercase tracking-widest transition-all"
              >
                {isSubmitting ? 'Sending Message...' : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit Inquiry
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
