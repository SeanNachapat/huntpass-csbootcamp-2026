import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import SystemHealth from '@/components/admin/SystemHealth';
import { ShieldCheck, Users, MapPin, LayoutDashboard, LogOut, Activity } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-transparent text-sepia-ink overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-passport-navy text-white flex flex-col shadow-2xl z-20 hidden md:flex shrink-0 border-r-2 border-seal-gold/50">
        <div className="p-6 flex items-center justify-center border-b border-seal-gold/30 shrink-0">
          <img src="/assets/Logo.png" alt="HuntPass Logo" className="h-10 w-auto" />
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-sans font-bold text-seal-gold/50 mb-2 mt-4 px-2 uppercase tracking-widest">Dashboard</div>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-sarabun text-passport-ivory">
            <LayoutDashboard size={20} className="text-seal-gold" /> Overview
          </Link>
          <Link href="/admin/scoreboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-sarabun text-passport-ivory">
            <Activity size={20} className="text-seal-gold" /> Scoreboard
          </Link>
          
          <div className="text-xs font-sans font-bold text-seal-gold/50 mb-2 mt-6 px-2 uppercase tracking-widest">Management</div>
          <Link href="/admin/districts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-sarabun text-passport-ivory">
            <MapPin size={20} className="text-seal-gold" /> Districts & Officers
          </Link>
          <Link href="/admin/recruits" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-sarabun text-passport-ivory">
            <Users size={20} className="text-seal-gold" /> Recruits Records
          </Link>
        </nav>

        <div className="p-4 border-t border-seal-gold/30">
          <Link href="/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ink-red/20 text-ink-red hover:text-red-100 transition font-sarabun font-bold">
            <LogOut size={20} /> Exit Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {/* Mobile Header & Nav */}
        <header className="md:hidden bg-passport-navy text-white p-4 shadow-md flex flex-col gap-3 z-20 shrink-0 border-b-2 border-seal-gold/50">
          <div className="flex justify-between items-center relative">
            <div className="w-12"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img src="/assets/Logo.png" alt="HuntPass Logo" className="h-8 w-auto" />
            </div>
            <Link href="/logout" className="text-xs font-mono tracking-widest text-ink-red w-12 text-right relative z-10">EXIT</Link>
          </div>
          <div className="flex gap-4 text-xs font-mono uppercase tracking-wider overflow-x-auto pb-1 text-seal-gold/70">
            <Link href="/admin" className="whitespace-nowrap hover:text-seal-gold">Overview</Link>
            <Link href="/admin/scoreboard" className="whitespace-nowrap hover:text-seal-gold">Scoreboard</Link>
            <Link href="/admin/districts" className="whitespace-nowrap hover:text-seal-gold">Districts</Link>
            <Link href="/admin/recruits" className="whitespace-nowrap hover:text-seal-gold">Recruits</Link>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          <div className="max-w-6xl mx-auto w-full relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Fixed System Health Indicator */}
      <div className="fixed bottom-4 right-4 z-50 bg-passport-navy/80 backdrop-blur-md px-4 py-2.5 rounded-full border border-seal-gold/30 shadow-lg">
        <SystemHealth />
      </div>
    </div>
  );
}
