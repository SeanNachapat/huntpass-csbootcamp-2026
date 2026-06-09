import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, MapPin, Target, Activity } from 'lucide-react';
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
        include: { stamps: true }
      },
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zpd-navy flex items-center gap-3 mb-2">
          <LayoutDashboard className="text-zoo-blue-500" size={32} />
          Dashboard Overview
        </h1>
        <p className="text-slate-500 font-medium">Welcome back, Chief Bogo. Here is the current status of the precinct.</p>
      </div>

      {hunts.map(hunt => {
        const totalDistricts = hunt.checkpoints.length;
        const totalRecruits = hunt.participants.length;
        const totalOfficers = hunt.checkpoints.reduce((acc, cp) => acc + cp.officers.length, 0);
        const totalStamps = hunt.participants.reduce((acc, p) => acc + p.stamps.length, 0);

        return (
          <div key={hunt.id} className="bg-white rounded-3xl shadow-sm p-6 lg:p-8 border-t-4 border-zoo-blue-600">
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
            
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-zpd-navy mb-2 flex items-center gap-2">
                <Activity size={20} className="text-slate-400" />
                System Logs
              </h3>
              <p className="text-sm text-slate-500">
                The hunt is currently {hunt.status}. There are {totalStamps} stamps collected across {totalRecruits} recruits.
              </p>
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
