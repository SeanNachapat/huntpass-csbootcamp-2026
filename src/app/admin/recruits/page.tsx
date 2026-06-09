import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { addRecruit, removeRecruit } from '@/app/actions';
import { Users, Trash2, PlusCircle } from 'lucide-react';
import { houses } from '@/lib/houses';

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
        <h1 className="text-3xl font-extrabold text-zpd-navy flex items-center gap-3 mb-2">
          <Users className="text-pink-500" size={32} />
          Recruits Management
        </h1>
        <p className="text-slate-500 font-medium">Add, configure, or remove Zootopia bootcamp recruits.</p>
      </div>

      {hunts.map(hunt => (
        <div key={hunt.id} className="bg-white rounded-3xl shadow-sm p-6 border-t-4 border-pink-500">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zpd-navy">{hunt.name}</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Add Recruit Form */}
            <div className="xl:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
              <h4 className="font-bold text-zpd-navy mb-5 flex items-center gap-2 text-lg">
                <PlusCircle size={20} className="text-pink-500" /> New Recruit
              </h4>
              <form action={addRecruit} className="space-y-4">
                <input type="hidden" name="huntId" value={hunt.id} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Name (ชื่อ)</label>
                    <input type="text" name="name" className="w-full border border-slate-300 focus:ring-2 focus:ring-pink-500 rounded-lg px-3 py-2.5 text-sm outline-none" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Surname (นามสกุล)</label>
                    <input type="text" name="surname" className="w-full border border-slate-300 focus:ring-2 focus:ring-pink-500 rounded-lg px-3 py-2.5 text-sm outline-none" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nickname (ชื่อเล่น)</label>
                  <input type="text" name="nickname" className="w-full border border-slate-300 focus:ring-2 focus:ring-pink-500 rounded-lg px-3 py-2.5 text-sm outline-none" required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">House (บ้าน)</label>
                  <select name="house" className="w-full border border-slate-300 focus:ring-2 focus:ring-pink-500 rounded-lg px-3 py-2.5 text-sm bg-white outline-none" required>
                    {Object.keys(houses).map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Username</label>
                  <input type="text" name="username" className="w-full border border-slate-300 focus:ring-2 focus:ring-pink-500 rounded-lg px-3 py-2.5 text-sm mb-4 outline-none" required />
                  
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Password</label>
                  <input type="password" name="password" className="w-full border border-slate-300 focus:ring-2 focus:ring-pink-500 rounded-lg px-3 py-2.5 text-sm outline-none" required />
                </div>

                <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-3 rounded-lg transition mt-6 text-sm flex justify-center items-center gap-2 shadow-sm">
                  <PlusCircle size={18} /> Register Recruit
                </button>
              </form>
            </div>

            {/* Recruits List */}
            <div className="xl:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hunt.participants.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center group shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                        <img src={houses[p.house]?.image || '/assets/IMG_0488.PNG'} alt={p.house} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-zpd-navy leading-tight text-lg">{p.name} {p.surname}</p>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">@{p.username} • {p.house}</p>
                      </div>
                    </div>
                    <form action={removeRecruit}>
                      <input type="hidden" name="recruitId" value={p.id} />
                      <button type="submit" title="Remove Recruit" className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                ))}
                
                {hunt.participants.length === 0 && (
                  <div className="col-span-1 md:col-span-2 bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center text-slate-400">
                    <Users size={48} className="mb-4 opacity-30 text-pink-500" />
                    <p className="font-bold text-lg">No recruits enrolled yet.</p>
                    <p className="text-sm mt-1">Use the form on the left to add your first recruit.</p>
                  </div>
                )}
              </div>
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
