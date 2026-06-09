import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, Target, Activity, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardOverview() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/login');
  }

  const hunts = await prisma.hunt.findMany({
    include: {
      checkpoints: {
        include: { officers: true }
      },
      participants: {
        include: { 
          stamps: {
            include: { checkpoint: true, officer: true }
          } 
        }
      },
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-passport-navy flex items-center gap-3 mb-2 drop-shadow-sm">
          <ShieldCheck className="text-seal-gold" size={32} />
          Dashboard Overview
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">Welcome back, Chief Bogo. Here is the current status of the precinct.</p>
      </div>

      {hunts.map(hunt => {
        const totalDistricts = hunt.checkpoints.length;
        const totalRecruits = hunt.participants.length;
        const totalOfficers = hunt.checkpoints.reduce((acc, cp) => acc + cp.officers.length, 0);
        const totalStamps = hunt.participants.reduce((acc, p) => acc + p.stamps.length, 0);

        return (
          <div key={hunt.id} className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-seal-gold/30 pb-4">
              <div>
                <h2 className="text-2xl font-playfair font-bold text-passport-navy flex items-center gap-2">
                  {hunt.name}
                  <span className={`px-3 py-0.5 ml-2 rounded-full font-sans text-xs font-bold uppercase tracking-[0.2em] ${hunt.status === 'active' ? 'bg-verified-green/20 text-verified-green border border-verified-green/30' : 'bg-muted-sepia/20 text-muted-sepia'}`}>
                    {hunt.status}
                  </span>
                </h2>
                <p className="text-sepia-ink font-sarabun mt-1 text-sm">{hunt.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/60 p-5 rounded-xl border-l-4 border-l-district-ice shadow-sm border border-paper-border hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="text-district-ice" size={20} />
                  <p className="text-xs text-sepia-ink font-sans font-bold uppercase tracking-widest">Districts</p>
                </div>
                <p className="text-4xl font-playfair font-bold text-passport-navy">{totalDistricts}</p>
                <Link href="/admin/districts" className="text-xs font-sans font-bold text-district-ice hover:underline mt-3 inline-block uppercase tracking-wider">Manage Districts →</Link>
              </div>
              
              <div className="bg-white/60 p-5 rounded-xl border-l-4 border-l-district-lavender shadow-sm border border-paper-border hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-district-lavender" size={20} />
                  <p className="text-xs text-sepia-ink font-sans font-bold uppercase tracking-widest">Recruits</p>
                </div>
                <p className="text-4xl font-playfair font-bold text-passport-navy">{totalRecruits}</p>
                <Link href="/admin/recruits" className="text-xs font-sans font-bold text-district-lavender hover:underline mt-3 inline-block uppercase tracking-wider">Manage Recruits →</Link>
              </div>

              <div className="bg-white/60 p-5 rounded-xl border-l-4 border-l-district-amber shadow-sm border border-paper-border hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-district-amber" size={20} />
                  <p className="text-xs text-sepia-ink font-sans font-bold uppercase tracking-widest">Officers</p>
                </div>
                <p className="text-4xl font-playfair font-bold text-passport-navy">{totalOfficers}</p>
              </div>

              <div className="bg-white/60 p-5 rounded-xl border-l-4 border-l-verified-green shadow-sm border border-paper-border hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-verified-green" size={20} />
                  <p className="text-xs text-sepia-ink font-sans font-bold uppercase tracking-widest">Total Stamps</p>
                </div>
                <p className="text-4xl font-playfair font-bold text-passport-navy">{totalStamps}</p>
              </div>
            </div>
            
            {/* Extended Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Participant Progress */}
              <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-paper-border pb-3">
                  <Activity className="text-district-lavender" size={20} />
                  <h3 className="text-lg font-playfair font-bold text-passport-navy">Recruit Progress</h3>
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {hunt.participants
                    .sort((a, b) => b.stamps.length - a.stamps.length)
                    .map((p, i) => {
                    const progress = totalDistricts > 0 ? Math.round((p.stamps.length / totalDistricts) * 100) : 0;
                    return (
                      <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-paper-border shadow-sm hover:border-seal-gold/50 transition-colors animate-passport-slide" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="w-8 h-8 rounded-full border border-paper-border flex items-center justify-center text-xs font-playfair font-bold text-passport-navy shrink-0 bg-passport-ivory">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-grow min-w-0">
                           <div className="flex justify-between items-end mb-1">
                             <div className="truncate pr-2">
                               <span className="font-sarabun font-bold text-sm text-sepia-ink truncate">{p.name} {p.surname}</span>
                               <span className="font-sans text-xs font-bold text-muted-sepia ml-2 hidden sm:inline-block">@{p.username}</span>
                             </div>
                             <span className="text-xs font-mono font-bold text-passport-navy shrink-0">{p.stamps.length}/{totalDistricts}</span>
                           </div>
                           <div className="w-full bg-paper-border/30 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-seal-gold h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                  {hunt.participants.length === 0 && (
                    <p className="font-sarabun text-muted-sepia text-center py-4 italic">No recruits yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-paper-border pb-3">
                  <Target className="text-district-amber" size={20} />
                  <h3 className="text-lg font-playfair font-bold text-passport-navy">Recent Activity</h3>
                </div>
                
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {hunt.participants.flatMap(p => 
                    p.stamps.map(s => ({
                      ...s,
                      participantName: `${p.name} (${p.nickname})`,
                    }))
                  )
                  .sort((a, b) => new Date(b.stampedAt).getTime() - new Date(a.stampedAt).getTime())
                  .slice(0, 50) // show up to 50 recent logs
                  .map((stamp, i) => (
                    <div key={stamp.id} className="flex gap-4 p-3 bg-white rounded-xl border border-paper-border shadow-sm items-center animate-passport-slide" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="border border-verified-green text-verified-green w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-verified-green/10">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-sarabun font-bold text-sepia-ink truncate">{stamp.participantName}</p>
                        <p className="text-[11px] font-sarabun text-muted-sepia truncate mt-0.5">
                          Stamped at <span className="font-bold text-passport-navy">{stamp.checkpoint.name}</span> by {stamp.officer.displayName}
                        </p>
                      </div>
                      <div className="font-mono text-[9px] font-bold text-muted-sepia shrink-0 text-right uppercase">
                        {new Date(stamp.stampedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  
                  {totalStamps === 0 && (
                    <p className="font-sarabun text-muted-sepia text-center py-4 italic">No stamps recorded yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })}

      {hunts.length === 0 && (
        <div className="text-center p-12 bg-passport-ivory paper-texture rounded-3xl border-dashed border-2 border-seal-gold/50">
          <p className="font-sarabun text-muted-sepia font-medium italic">No cases created yet.</p>
        </div>
      )}
    </div>
  );
}
