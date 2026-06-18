import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ShieldCheck, MapPin } from 'lucide-react';
import BadgeCard from '@/components/BadgeCard';
import AddDistrictCard from '@/components/AddDistrictCard';

export default async function BadgesPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
  }

  const hunts = await prisma.hunt.findMany({
    include: {
      checkpoints: {
        orderBy: { order: 'asc' }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-passport-navy flex items-center gap-3 mb-2 drop-shadow-sm">
          <ShieldCheck className="text-seal-gold" size={32} />
          Badges & Checkpoints
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">
          Create and manage scavenger hunt badges (with Markdown clues) and daily attendance checkpoints (no hints).
        </p>
      </div>

      {hunts.map(hunt => {
        const badges = hunt.checkpoints.filter(cp => cp.type === 'badge' || !cp.type);
        const attendance = hunt.checkpoints.filter(cp => cp.type === 'daily_attendance');

        return (
          <div key={hunt.id} className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border space-y-8">
            <div className="pb-4 flex justify-between items-end border-b border-paper-border/40">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-seal-gold/15 border border-seal-gold/30 rounded text-seal-gold text-[10px] font-mono font-bold uppercase tracking-wider mb-2 select-none">
                  Active Case File
                </div>
                <h2 className="text-3xl font-playfair font-bold text-passport-navy leading-none">{hunt.name}</h2>
              </div>
              <AddDistrictCard huntId={hunt.id} />
            </div>

            <div>
              <h3 className="text-base font-playfair font-bold text-passport-navy mb-5 flex items-center gap-2 pl-3 border-l-4 border-seal-gold leading-none select-none">
                <span>🛡️</span> Scavenger Hunt Badges (เหรียญตราเคสสืบสวน)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {badges.map((cp, index) => (
                  <BadgeCard key={cp.id} cp={cp} index={index} />
                ))}
                {badges.length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-paper-border rounded-xl italic font-sarabun text-sm text-muted-sepia bg-white/30">
                    No badges created yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-playfair font-bold text-passport-navy mb-5 flex items-center gap-2 pl-3 border-l-4 border-seal-gold leading-none select-none">
                <span>📅</span> Daily Attendance Checkpoints (จุดเช็คอินรายวัน)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {attendance.map((cp, index) => (
                  <BadgeCard key={cp.id} cp={cp} index={index + badges.length} />
                ))}
                {attendance.length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-paper-border rounded-xl italic font-sarabun text-sm text-muted-sepia bg-white/30">
                    No attendance checkpoints created yet.
                  </div>
                )}
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
