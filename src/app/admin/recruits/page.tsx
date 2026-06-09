import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { removeRecruit } from '@/app/actions';
import { Users } from 'lucide-react';
import { houses } from '@/lib/houses';
import RecruitManager from '@/components/RecruitManager';
import RecruitRow from '@/components/RecruitRow';

export default async function RecruitsPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/login');
  }

  const hunts = await prisma.hunt.findMany({
    include: {
      participants: {
        orderBy: { registeredAt: 'desc' }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2 drop-shadow-md">
          <Users className="text-pink-400" size={32} />
          Recruits Management
        </h1>
        <p className="text-slate-200 font-medium drop-shadow">Add, configure, or remove Zootopia bootcamp recruits.</p>
      </div>

      {hunts.map(hunt => (
        <div key={hunt.id} className="bg-white rounded-[2rem] shadow-2xl p-6 lg:p-8 border border-slate-200 backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zpd-navy">{hunt.name}</h2>
          </div>

          <RecruitManager huntId={hunt.id} />

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-4">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <div className="col-span-2">Username</div>
              <div className="col-span-2">Password</div>
              <div className="col-span-3">Full Name</div>
              <div className="col-span-2">Nickname</div>
              <div className="col-span-2">House</div>
              <div className="col-span-1 text-right pr-2">Actions</div>
            </div>

            <div className="divide-y divide-slate-100 flex flex-col">
              {hunt.participants.map(p => (
                <RecruitRow key={p.id} recruit={p} />
              ))}
              
              {hunt.participants.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-slate-400 bg-white">
                  <Users size={48} className="mb-4 opacity-30 text-pink-500" />
                  <p className="font-bold text-lg">No recruits enrolled yet.</p>
                  <p className="text-sm mt-1">Use the buttons above to add or import recruits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {hunts.length === 0 && (
        <div className="text-center p-12 bg-white rounded-3xl border-dashed border-2 border-slate-300">
          <p className="text-slate-500 font-medium">No cases created yet.</p>
        </div>
      )}
    </div>
  );
}
