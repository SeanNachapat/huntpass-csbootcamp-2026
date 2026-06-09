import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Users, MapPin, LayoutDashboard, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
  }

  return (
    <div className="flex h-screen bg-transparent text-slate-800 overflow-hidden">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-zpd-navy text-white flex flex-col shadow-xl z-20 hidden md:flex shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <img src="/assets/Logo.png" alt="HuntPass Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl leading-tight">Chief Bogo<br/>Portal</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-400 mb-2 mt-4 px-2 uppercase tracking-wider">Dashboard</div>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-medium">
            <LayoutDashboard size={20} className="text-zoo-blue-400" /> Overview
          </Link>
          
          <div className="text-xs font-bold text-slate-400 mb-2 mt-6 px-2 uppercase tracking-wider">Management</div>
          <Link href="/admin/districts" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-medium">
            <MapPin size={20} className="text-zoo-amber-400" /> Districts
          </Link>
          <Link href="/admin/recruits" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition font-medium">
            <Users size={20} className="text-pink-400" /> Recruits
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-100 transition font-medium">
            <LogOut size={20} /> Exit Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        {/* Mobile Header & Nav */}
        <header className="md:hidden bg-zpd-navy text-white p-4 shadow-md flex flex-col gap-3 z-20 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src="/assets/Logo.png" alt="HuntPass Logo" className="w-6 h-6 object-contain" />
              <span className="font-bold">Bogo Portal</span>
            </div>
            <Link href="/" className="text-xs text-red-300">Exit</Link>
          </div>
          <div className="flex gap-4 text-sm overflow-x-auto pb-1">
            <Link href="/admin" className="whitespace-nowrap hover:text-zoo-blue-300">Overview</Link>
            <Link href="/admin/districts" className="whitespace-nowrap hover:text-zoo-blue-300">Districts</Link>
            <Link href="/admin/recruits" className="whitespace-nowrap hover:text-zoo-blue-300">Recruits</Link>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
