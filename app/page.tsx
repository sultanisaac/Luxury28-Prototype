'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Truck, Clock, Shield, Star, X } from 'lucide-react';
import { watches } from '@/lib/watches';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [showExitIntent, setShowExitIntent] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShowExitIntent(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  const featuredWatches = watches.slice(0, 4);

  return (
    <main className="min-h-screen bg-background text-foreground font-sans">
      
      {/* NAVIGATION */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-serif text-2xl font-bold tracking-widest text-primary">LUXURY28</div>
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-muted-foreground">
            <Link href="#collection" className="hover:text-primary transition-colors">Belanja</Link>
            <Link href="#trust" className="hover:text-primary transition-colors">Tentang</Link>
            <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
          </div>
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-background rounded-none px-6">
            Portal Klien
          </Button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-watch.png" 
            alt="Luxury Watch" 
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-serif text-white mb-6 tracking-wide"
          >
            Waktu Adalah Status.<br />Kenakanlah.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light"
          >
            Jam tangan mewah pilihan. Keaslian bersertifikat. Ketersediaan terbatas.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="bg-primary text-background hover:bg-primary/90 rounded-none px-12 py-6 text-lg w-full sm:w-auto uppercase tracking-widest">
              Beli Koleksi
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-background rounded-none px-12 py-6 text-lg w-full sm:w-auto uppercase tracking-widest">
              Lihat Unggulan
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 text-sm text-gray-400 uppercase tracking-widest"
          >
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-primary" /> Keaslian Bersertifikat</div>
            <div className="flex items-center gap-2"><Shield size={16} className="text-primary" /> Garansi 2 Tahun</div>
            <div className="flex items-center gap-2"><Truck size={16} className="text-primary" /> Pengiriman Global</div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED COLLECTION */}
      <section className="py-32 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Pilihan Kurator</h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredWatches.map((watch) => (
              <Link href={`/product/${watch.id}`} key={watch.id} className="group cursor-pointer">
                <div className="bg-card p-6 border border-border transition-all duration-500 hover:border-primary/50 relative overflow-hidden h-[400px] flex flex-col justify-end">
                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <Image src={watch.image} alt={watch.name} width={250} height={250} className="object-contain group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="relative z-10 bg-background/90 backdrop-blur p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-serif text-lg mb-1 truncate">{watch.name}</h3>
                    <p className="text-primary font-medium tracking-wider">${watch.price.toLocaleString()}</p>
                    <div className="mt-4 flex items-center text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      <span>Lihat Detail</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY LUXURY28 (TRUST SECTION) */}
      <section id="trust" className="py-24 bg-[#0a0a0a] border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-4">
              <ShieldCheck size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Keaslian Terjamin</h3>
              <p className="text-muted-foreground text-sm">Setiap jam tangan diperiksa secara ketat dan disertifikasi oleh ahli pembuat jam.</p>
            </div>
            <div className="space-y-4">
              <Star size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Hanya Pilihan Kurasi</h3>
              <p className="text-muted-foreground text-sm">Kami tidak menjual semuanya. Kami hanya menawarkan jam tangan yang bermakna.</p>
            </div>
            <div className="space-y-4">
              <Truck size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Diasuransikan di Seluruh Dunia</h3>
              <p className="text-muted-foreground text-sm">Pengiriman prioritas yang aman dan berasuransi penuh ke pintu Anda.</p>
            </div>
            <div className="space-y-4">
              <Clock size={40} className="mx-auto text-primary" strokeWidth={1} />
              <h3 className="font-serif text-xl">Pengalaman Klien Pribadi</h3>
              <p className="text-muted-foreground text-sm">Layanan pramutamu khusus dari akuisisi hingga kepemilikan.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section id="collection" className="py-32 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Inventaris Lengkap</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-muted-foreground tracking-widest uppercase text-sm">Jam Tangan Tersedia</p>
          </div>

          {['Ultra Mewah', 'Mewah Kelas Atas', 'Mewah Menengah', 'Mewah Terjangkau'].map((tier) => (
            <div key={tier} className="mb-20">
              <h3 className="text-2xl font-serif mb-8 border-b border-border pb-4">{tier}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {watches.filter(w => w.tier === tier).map((watch) => (
                  <Link href={`/product/${watch.id}`} key={watch.id} className="group">
                    <div className="bg-card p-4 border border-border transition-colors hover:border-primary/50 text-center">
                      <div className="aspect-square relative mb-4 overflow-hidden bg-[#111]">
                        <Image 
                          src={watch.image} 
                          alt={watch.name} 
                          fill
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <h4 className="font-serif text-sm mb-2 truncate">{watch.name}</h4>
                      <p className="text-primary text-sm tracking-wider mb-4">${watch.price.toLocaleString()}</p>
                      <Button variant="outline" className="w-full rounded-none border-border group-hover:border-primary group-hover:bg-primary group-hover:text-background transition-all text-xs uppercase tracking-widest">
                        Lihat Detail
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-32 bg-[#0a0a0a] border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Dipercaya oleh Kolektor di Seluruh Dunia</h2>
            <div className="w-16 h-1 bg-primary mx-auto mb-12"></div>
            
            <div className="flex flex-wrap justify-center gap-12 md:gap-24">
              <div>
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2">5,000+</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Jam Tangan Terjual</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2">98%</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Tingkat Kepuasan</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif text-primary mb-2">42</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Negara Pengiriman</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { text: "Jam tangan melebihi ekspektasi. Kemasan, keaslian, semuanya tanpa cacat.", author: "Daniel K., Zurich" },
              { text: "Luxury28 terasa seperti dealer pribadi, bukan toko. Pelayanan luar biasa.", author: "Marcus L., Dubai" },
              { text: "Pengiriman cepat, barang bersertifikat, tanpa keraguan. Akan beli lagi.", author: "Kenji S., Tokyo" }
            ].map((testimonial, i) => (
              <div key={i} className="bg-card p-8 border border-border relative">
                <div className="text-primary text-4xl font-serif absolute top-4 left-6 opacity-20">"</div>
                <p className="text-gray-300 mb-6 relative z-10 font-light italic">"{testimonial.text}"</p>
                <div className="text-sm uppercase tracking-widest text-primary">— {testimonial.author}</div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div className="relative h-64 w-full opacity-60 hover:opacity-100 transition-opacity"><Image src="/wrist-shot.png" alt="Wrist Shot" fill className="object-cover" /></div>
             <div className="relative h-64 w-full opacity-60 hover:opacity-100 transition-opacity"><Image src="/hero-watch.png" alt="Details" fill className="object-cover" /></div>
             <div className="relative h-64 w-full opacity-60 hover:opacity-100 transition-opacity"><Image src="/wrist-shot.png" alt="Lifestyle" fill className="object-cover" /></div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Sebelum Anda Berinvestasi</h2>
            <div className="w-16 h-1 bg-primary mx-auto"></div>
          </div>

          <div className="space-y-6">
            {[
              { q: "Apakah jam tangan ini asli?", a: "100% bersertifikat asli. Setiap jam tangan melewati pemeriksaan ketat oleh ahli pembuat jam kami sebelum didaftarkan." },
              { q: "Apakah Anda menawarkan garansi?", a: "Ya, kami memberikan garansi internasional komprehensif selama 2 tahun untuk semua jam tangan kami." },
              { q: "Bagaimana sistem pengirimannya?", a: "Semua pengiriman diasuransikan penuh dan dapat dilacak. Kami menggunakan layanan prioritas kilat untuk domestik dan dipercepat untuk internasional." },
              { q: "Apa kebijakan pengembalian Anda?", a: "Kami menawarkan waktu pengembalian 7 hari tanpa syarat sejak hari pengiriman, asalkan jam tangan dalam kondisi yang sama." },
              { q: "Metode pembayaran apa saja yang diterima?", a: "Kami menerima semua kartu kredit utama, transfer bank, dan mata uang kripto pilihan." }
            ].map((faq, i) => (
              <div key={i} className="border border-border p-6 hover:border-primary/30 transition-colors">
                <h4 className="font-serif text-lg mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm font-light">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050505] pt-24 pb-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="font-serif text-3xl font-bold tracking-widest text-primary mb-6">LUXURY28</div>
              <p className="text-muted-foreground max-w-sm font-light">
                Jam tangan mewah kurasi untuk kolektor modern. Kami hanya berurusan dengan keunggulan.
              </p>
            </div>
            <div>
              <h5 className="uppercase tracking-widest text-sm mb-6 text-white">Navigasi</h5>
              <ul className="space-y-4 text-muted-foreground text-sm font-light">
                <li><Link href="#collection" className="hover:text-primary transition-colors">Beli Koleksi</Link></li>
                <li><Link href="#trust" className="hover:text-primary transition-colors">Standar Kami</Link></li>
                <li><Link href="#faq" className="hover:text-primary transition-colors">Sebelum Berinvestasi</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="uppercase tracking-widest text-sm mb-6 text-white">Nawala</h5>
              <p className="text-muted-foreground text-sm mb-4 font-light">Dapatkan akses prioritas ke jam tangan langka dan terbatas.</p>
              <div className="flex">
                <input type="email" placeholder="Alamat email Anda" className="bg-transparent border border-border px-4 py-2 w-full text-sm focus:outline-none focus:border-primary" />
                <Button className="rounded-none bg-primary text-background hover:bg-primary/90 px-6">GABUNG</Button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-xs text-muted-foreground uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Luxury28. Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Syarat</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privasi</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* STICKY MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur border-t border-border p-4 z-40">
        <Button className="w-full bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest py-6">
          Beli Koleksi
        </Button>
      </div>

      {/* EXIT INTENT POPUP */}
      <AnimatePresence>
        {showExitIntent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border p-8 max-w-md w-full relative text-center"
            >
              <button 
                onClick={() => setShowExitIntent(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <div className="w-12 h-12 border border-primary flex items-center justify-center mx-auto mb-6 text-primary">
                <Star size={24} />
              </div>
              <h3 className="text-2xl font-serif mb-4">Tunggu. Sebelum Anda pergi.</h3>
              <p className="text-muted-foreground mb-8 font-light text-sm">
                Bergabunglah dengan daftar kolektor pribadi kami. Dapatkan akses prioritas ke jam tangan terbatas dan alokasi di luar pasar sebelum didaftarkan secara publik.
              </p>
              <input type="email" placeholder="Alamat email Anda" className="bg-background border border-border px-4 py-3 w-full text-sm focus:outline-none focus:border-primary mb-4" />
              <Button className="w-full bg-primary text-background hover:bg-primary/90 rounded-none uppercase tracking-widest py-6">
                Minta Akses
              </Button>
              <p className="mt-4 text-xs text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-white" onClick={() => setShowExitIntent(false)}>
                Tidak, terima kasih
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
