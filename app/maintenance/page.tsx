import Image from 'next/image';
import { ShieldCheck, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-sans relative overflow-hidden flex items-center justify-center">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-watch.png" 
          alt="Luxury Watch Background" 
          fill
          className="object-cover opacity-30 grayscale"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      </div>
      
      {/* CONTENT */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center">
        {/* LOGO STAND-IN */}
        <div className="mb-12">
          <h2 className="text-2xl font-serif text-white tracking-[0.3em] uppercase">Luxury28</h2>
          <div className="w-8 h-[1px] bg-primary mx-auto mt-4" />
        </div>

        <div className="bg-card/30 backdrop-blur-md border border-white/10 p-10 md:p-16 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background p-4 rounded-full border border-white/10">
            <Clock className="w-6 h-6 text-primary" />
          </div>

          <h1 className="text-3xl md:text-5xl font-serif text-white mb-6 tracking-wide leading-tight mt-4">
            Private Maintenance
          </h1>
          
          <p className="text-base sm:text-lg text-gray-300 mb-8 font-light max-w-lg mx-auto">
            We are currently refining our boutique and upgrading our systems to provide you with an even more exceptional luxury experience.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400 uppercase tracking-widest border-t border-white/10 pt-8 mt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> 
              System Optimization
            </div>
          </div>
        </div>

        <p className="mt-16 text-xs text-muted-foreground uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Luxury28. The boutique will reopen shortly.
        </p>
      </div>
    </main>
  );
}
