import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, Target, Activity, CheckCircle } from 'lucide-react';
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
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2 drop-shadow-md">
          <LayoutDashboard className="text-zoo-blue-400" size={32} />
          Dashboard Overview
        </h1>
        <p className="text-slate-200 font-medium drop-shadow">Welcome back, Chief Bogo. Here is the current status of the precinct.</p>
      </div>

      {hunts.map(hunt => {
        const totalDistricts = hunt.checkpoints.length;
        const totalRecruits = hunt.participants.length;
        const totalOfficers = hunt.checkpoints.reduce((acc, cp) => acc + cp.officers.length, 0);
        const totalStamps = hunt.participants.reduce((acc, p) => acc + p.stamps.length, 0);

        return (
          <div key={hunt.id} className="bg-white rounded-[2rem] shadow-2xl p-6 lg:p-8 border border-slate-200 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-zpd-navy flex items-center gap-2">
                  {hunt.name}
                  <span className={`px-3 py-1 ml-2 rounded-full text-xs font-bold uppercase tracking-wider ${hunt.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {hunt.status}
                  </span>
                </h2>
                <p className="text-slate-500 mt-1">{hunt.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-zoo-blue-50 p-5 rounded-2xl border border-zoo-blue-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="text-zoo-blue-500" size={24} />
                  <p className="text-sm text-zoo-blue-800 font-bold uppercase tracking-wider">Districts</p>
                </div>
                <p className="text-4xl font-black text-zpd-navy">{totalDistricts}</p>
                <Link href="/admin/districts" className="text-xs font-bold text-zoo-blue-600 hover:underline mt-2 inline-block">Manage Districts →</Link>
              </div>
              
              <div className="bg-pink-50 p-5 rounded-2xl border border-pink-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-pink-500" size={24} />
                  <p className="text-sm text-pink-800 font-bold uppercase tracking-wider">Recruits</p>
                </div>
                <p className="text-4xl font-black text-zpd-navy">{totalRecruits}</p>
                <Link href="/admin/recruits" className="text-xs font-bold text-pink-600 hover:underline mt-2 inline-block">Manage Recruits →</Link>
              </div>

              <div className="bg-zoo-amber-50 p-5 rounded-2xl border border-zoo-amber-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="text-zoo-amber-500" size={24} />
                  <p className="text-sm text-zoo-amber-800 font-bold uppercase tracking-wider">Officers</p>
                </div>
                <p className="text-4xl font-black text-zpd-navy">{totalOfficers}</p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-emerald-500" size={24} />
                  <p className="text-sm text-emerald-800 font-bold uppercase tracking-wider">Total Stamps</p>
                </div>
                <p className="text-4xl font-black text-zpd-navy">{totalStamps}</p>
              </div>
            </div>
            
            {/* Extended Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Participant Progress */}
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="text-pink-500" size={20} />
                  <h3 className="text-xl font-bold text-zpd-navy">Recruit Progress</h3>
                </div>
                
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {hunt.participants
                    .sort((a, b) => b.stamps.length - a.stamps.length)
                    .map(p => {
                    const progress = totalDistricts > 0 ? Math.round((p.stamps.length / totalDistricts) * 100) : 0;
                    return (
                      <div key={p.id} className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-grow min-w-0">
                           <div className="flex justify-between items-end mb-1">
                             <div className="truncate pr-2">
                               <span className="font-bold text-sm text-slate-800 truncate">{p.name} {p.surname}</span>
                               <span className="text-[10px] text-slate-400 ml-2 hidden sm:inline-block">@{p.username}</span>
                             </div>
                             <span className="text-xs font-black text-zpd-navy shrink-0">{p.stamps.length}/{totalDistricts}</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-1.5">
                             <div className="bg-zoo-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                           </div>
                        </div>
                      </div>
                    );
                  })}
                  {hunt.participants.length === 0 && (
                    <p className="text-slate-500 text-center py-4">No recruits yet.</p>
                  )}
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="text-zoo-amber-500" size={20} />
                  <h3 className="text-xl font-bold text-zpd-navy">Recent Activity</h3>
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
                  .map(stamp => (
                    <div key={stamp.id} className="flex gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm items-center">
                      <div className="bg-emerald-100 text-emerald-700 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{stamp.participantName}</p>
                        <p className="text-xs text-slate-500 truncate">
                          Stamped at <span className="font-bold text-zpd-navy">{stamp.checkpoint.name}</span> by {stamp.officer.displayName}
                        </p>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 shrink-0 text-right">
                        {new Date(stamp.stampedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                  
                  {totalStamps === 0 && (
                    <p className="text-slate-500 text-center py-4">No stamps recorded yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })}

      {hunts.length === 0 && (
        <div className="text-center p-12 bg-white rounded-3xl border-dashed border-2 border-slate-300">
          <p className="text-slate-500 font-medium">No cases created yet.</p>
        </div>
      )}
    </div>
  );
}
