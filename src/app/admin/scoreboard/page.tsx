import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Trophy, Medal, Award, Activity } from 'lucide-react';

export default async function ScoreboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/login');
  }

  const hunts = await prisma.hunt.findMany({
    include: {
      checkpoints: true,
      participants: {
        include: { 
          stamps: true 
        }
      },
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-passport-navy flex items-center gap-3 mb-2 drop-shadow-sm">
          <Trophy className="text-seal-gold" size={32} />
          Official Ranking Scoreboard
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">Precinct wide recruit standings and total stamps collected.</p>
      </div>

      {hunts.map(hunt => {
        const totalDistricts = hunt.checkpoints.length;
        
        // Sort participants by stamp count descending
        const rankedParticipants = [...hunt.participants].sort((a, b) => b.stamps.length - a.stamps.length);

        return (
          <div key={hunt.id} className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border mb-8">
            <h2 className="text-2xl font-playfair font-bold text-passport-navy mb-8 border-b border-seal-gold/30 pb-4 flex items-center gap-2">
              {hunt.name} - Top Recruits
            </h2>

            <div className="space-y-4">
              {rankedParticipants.map((p, index) => {
                const rank = index + 1;
                const isFirst = rank === 1;
                const isSecond = rank === 2;
                const isThird = rank === 3;
                
                let rankIcon = null;
                let borderClass = 'border-paper-border hover:border-seal-gold/50';
                let rankTextClass = 'text-passport-navy';
                
                if (isFirst) {
                  rankIcon = <Trophy className="text-yellow-500 w-6 h-6" />;
                  borderClass = 'border-yellow-500/50 shadow-yellow-500/10 bg-yellow-50/50';
                  rankTextClass = 'text-yellow-600';
                } else if (isSecond) {
                  rankIcon = <Medal className="text-slate-400 w-6 h-6" />;
                  borderClass = 'border-slate-400/50 shadow-slate-400/10 bg-slate-50/50';
                  rankTextClass = 'text-slate-500';
                } else if (isThird) {
                  rankIcon = <Award className="text-amber-700 w-6 h-6" />;
                  borderClass = 'border-amber-700/50 shadow-amber-700/10 bg-orange-50/50';
                  rankTextClass = 'text-amber-800';
                }

                return (
                  <div 
                    key={p.id} 
                    className={`flex items-center gap-4 bg-white p-4 rounded-xl border shadow-sm transition-colors animate-passport-slide ${borderClass}`}
                    style={{ animationDelay: `${(index % 10) * 50}ms` }}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center font-playfair font-bold text-xl shrink-0 ${rankTextClass}`}>
                      {rankIcon ? rankIcon : `#${rank}`}
                    </div>
                    
                    <div className="w-10 h-10 rounded-full border border-paper-border flex items-center justify-center text-sm font-playfair font-bold text-passport-navy shrink-0 bg-passport-ivory shadow-inner">
                      {p.name.charAt(0)}
                    </div>
                    
                    <div className="flex-grow min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                       <div className="truncate pr-2">
                         <span className="font-sarabun font-bold text-lg text-sepia-ink truncate block sm:inline">{p.name} {p.surname}</span>
                         <span className="font-sans text-xs font-bold text-muted-sepia ml-0 sm:ml-2 mt-1 sm:mt-0 block sm:inline">@{p.username} &middot; {p.house}</span>
                       </div>
                       
                       <div className="flex items-center gap-3 shrink-0">
                         <div className="text-right">
                           <div className="font-mono text-xl font-bold text-passport-navy">
                             {p.stamps.length} <span className="text-sm text-muted-sepia font-sans font-normal uppercase tracking-widest">Stamps</span>
                           </div>
                         </div>
                       </div>
                    </div>
                  </div>
                );
              })}
              {hunt.participants.length === 0 && (
                <p className="font-sarabun text-muted-sepia text-center py-8 italic">No recruits in this precinct yet.</p>
              )}
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
