import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, Target, Activity, CheckCircle, ShieldCheck, Trophy } from 'lucide-react';
import Link from 'next/link';
import QuickActionsPanel from '@/components/admin/QuickActionsPanel';
import TrafficHeatmap from '@/components/admin/TrafficHeatmap';
import { TopPerformersLive, RecentScansLive } from '@/components/admin/LiveAnalytics';

export default async function AdminDashboardOverview() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
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
        const totalBadges = hunt.checkpoints.filter(cp => cp.type === 'badge' || !cp.type).length;
        const totalAttendance = hunt.checkpoints.filter(cp => cp.type === 'daily_attendance').length;
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
                  <p className="text-xs text-sepia-ink font-sans font-bold uppercase tracking-widest">Badges / Attendance</p>
                </div>
                <p className="text-2xl font-playfair font-bold text-passport-navy">
                  {totalBadges} <span className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-wider">Badges</span> &middot; {totalAttendance} <span className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-wider">Days</span>
                </p>
                <Link href="/admin/badges" className="text-xs font-sans font-bold text-district-ice hover:underline mt-3 inline-block uppercase tracking-wider">Manage Badges →</Link>
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
                <Link href="/admin/officers" className="text-xs font-sans font-bold text-district-amber hover:underline mt-3 inline-block uppercase tracking-wider">Manage Officers →</Link>
              </div>

              <div className="bg-white/60 p-5 rounded-xl border-l-4 border-l-verified-green shadow-sm border border-paper-border hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-verified-green" size={20} />
                  <p className="text-xs text-sepia-ink font-sans font-bold uppercase tracking-widest">Total Stamps</p>
                </div>
                <p className="text-4xl font-playfair font-bold text-passport-navy">{totalStamps}</p>
                <Link href="/admin/scoreboard" className="text-xs font-sans font-bold text-verified-green hover:underline mt-3 inline-block uppercase tracking-wider">View Scoreboard →</Link>
              </div>
            </div>

            {/* Quick Wins Phase 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Top Performers (Leaderboard) */}
              <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm col-span-1 lg:col-span-1">
                <div className="flex items-center justify-between mb-6 border-b border-paper-border pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-seal-gold" size={20} />
                    <h3 className="text-lg font-playfair font-bold text-passport-navy">Top Performers</h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <TopPerformersLive />
                </div>
              </div>

              {/* Recent Scans Feed */}
              <div className="bg-white/40 rounded-2xl p-6 border border-paper-border shadow-sm col-span-1 lg:col-span-2">
                <div className="flex items-center justify-between mb-6 border-b border-paper-border pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="text-district-amber" size={20} />
                    <h3 className="text-lg font-playfair font-bold text-passport-navy">Recent Scans</h3>
                  </div>
                  
                  {/* Completion Rate Indicator */}
                  {(() => {
                    const recruitsWithMaxStamps = hunt.participants.filter(p => {
                      const badgeStamps = p.stamps.filter(s => s.checkpoint.type === 'badge' || !s.checkpoint.type).length;
                      return totalBadges > 0 && badgeStamps === totalBadges;
                    }).length;
                    const completionRate = totalRecruits > 0 ? Math.round((recruitsWithMaxStamps / totalRecruits) * 100) : 0;
                    
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest">Completion Rate</span>
                        <div className="w-32 bg-paper-border/30 rounded-full h-2 overflow-hidden flex">
                          <div className="bg-verified-green h-full rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
                        </div>
                        <span className="text-xs font-mono font-bold text-verified-green">{completionRate}%</span>
                      </div>
                    );
                  })()}
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <RecentScansLive />
                </div>
              </div>
              
            </div>

            {/* Administrative Controls Phase 2 & 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
              <div className="col-span-1 lg:col-span-1">
                <QuickActionsPanel />
              </div>
              <div className="col-span-1 lg:col-span-2">
                <TrafficHeatmap />
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
