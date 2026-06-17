import { prisma } from '@/lib/prisma';
import { Trophy, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { houses } from '@/lib/houses';

export default async function LeaderboardPage() {
  const activeHunt = await prisma.hunt.findFirst({
    where: { status: 'active' },
    include: {
      checkpoints: true,
      participants: {
        include: {
          stamps: {
            include: { checkpoint: true }
          },
        }
      }
    }
  });

  if (!activeHunt) {
    return (
      <div className="min-h-screen bg-zoo-blue-50 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border-t-8 border-zoo-gold-500 max-w-md w-full">
          <h1 className="text-2xl font-bold text-zpd-navy mb-4">No Active Hunt</h1>
          <Link href="/" className="text-zoo-blue-600 hover:underline font-medium">Return Home</Link>
        </div>
      </div>
    );
  }

  const totalClues = activeHunt.checkpoints.filter(cp => cp.type === 'badge' || !cp.type).length;

  // Compute stats and sort
  const rankedParticipants = activeHunt.participants.map(p => {
    const badgeStamps = p.stamps.filter(s => s.checkpoint.type === 'badge' || !s.checkpoint.type);
    const solved = badgeStamps.length;
    const lastStampTime = solved > 0 
      ? Math.max(...badgeStamps.map(s => s.stampedAt.getTime()))
      : 0;
    return { ...p, solved, lastStampTime };
  }).sort((a, b) => {
    if (b.solved !== a.solved) return b.solved - a.solved; // Most solved first
    return a.lastStampTime - b.lastStampTime; // Earlier completion time first
  });

  return (
    <div className="flex flex-col min-h-screen bg-zoo-blue-50 text-slate-800 pb-10">
      <header className="bg-zpd-navy text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
          <ShieldCheck className="text-zoo-gold-500" />
          <span className="font-bold text-lg">ZPD Dashboard</span>
        </Link>
        <span className="text-sm font-medium text-zoo-gold-400 flex items-center gap-1">
          <Trophy size={16} /> Precinct Rankings
        </span>
      </header>

      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 w-full max-w-2xl mx-auto">
        <div className="w-full text-center mb-8 mt-4">
          <div className="inline-block bg-white p-4 rounded-full shadow-md text-zoo-gold-500 mb-4">
            <Trophy size={48} />
          </div>
          <h1 className="text-3xl font-extrabold text-zpd-navy">Precinct Rankings</h1>
          <p className="text-slate-500 font-medium">{activeHunt.name}</p>
        </div>

        <div className="w-full bg-white rounded-3xl shadow-lg overflow-hidden border-t border-slate-100">
          <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-12 gap-2 text-sm font-bold text-slate-500">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-6">Recruit</div>
            <div className="col-span-4 text-right">Solved</div>
          </div>
          
          <div className="divide-y divide-slate-100">
            {rankedParticipants.map((p, index) => (
              <div 
                key={p.id} 
                className={`grid grid-cols-12 gap-2 p-4 items-center transition hover:bg-slate-50 ${index < 3 ? 'bg-zoo-amber-50/30' : ''}`}
              >
                <div className="col-span-2 flex justify-center">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    index === 0 ? 'bg-zoo-gold-500 text-white shadow-md' :
                    index === 1 ? 'bg-slate-300 text-slate-700 shadow-sm' :
                    index === 2 ? 'bg-amber-600 text-white shadow-sm' :
                    'text-slate-500'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200">
                    <img src={houses[p.house]?.image || '/assets/IMG_0488.PNG'} alt={p.house} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-bold text-zpd-navy leading-tight">{p.name} ({p.nickname})</p>
                    {p.solved === totalClues && totalClues > 0 && (
                      <span className="text-xs text-zoo-gold-600 font-bold">Badge Earned!</span>
                    )}
                  </div>
                </div>
                <div className="col-span-4 text-right font-bold text-lg text-zoo-blue-600">
                  {p.solved} <span className="text-sm text-slate-400 font-medium">/ {totalClues}</span>
                </div>
              </div>
            ))}
            
            {rankedParticipants.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No recruits have registered yet.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
