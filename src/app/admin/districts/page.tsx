import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { MapPin, ShieldCheck } from 'lucide-react';
import DistrictCard from '@/components/DistrictCard';
import AddDistrictCard from '@/components/AddDistrictCard';

export default async function DistrictsPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
  }

  const hunts = await prisma.hunt.findMany({
    include: {
      checkpoints: {
        include: { officers: true },
        orderBy: { order: 'asc' }
      }
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-passport-navy flex items-center gap-3 mb-2 drop-shadow-sm">
          <ShieldCheck className="text-seal-gold" size={32} />
          Badges & Officers
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">Manage badges & daily attendance checkpoints and assign ZPD officers to scan recruits.</p>
      </div>

      {hunts.map(hunt => {
        const badges = hunt.checkpoints.filter(cp => cp.type === 'badge' || !cp.type);
        const attendance = hunt.checkpoints.filter(cp => cp.type === 'daily_attendance');

        return (
          <div key={hunt.id} className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border space-y-10">
            <div className="border-b border-seal-gold/30 pb-4">
              <h2 className="text-2xl font-playfair font-bold text-passport-navy">{hunt.name}</h2>
            </div>

            <div>
              <h3 className="text-lg font-playfair font-bold text-passport-navy mb-4 flex items-center gap-2 border-b border-paper-border/60 pb-2">
                <span>🛡️</span> Scavenger Hunt Badges (เหรียญตราเคสสืบสวน)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {badges.map((cp, index) => (
                  <DistrictCard key={cp.id} cp={cp} index={index} />
                ))}
                {badges.length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-paper-border rounded-xl italic font-sarabun text-sm text-muted-sepia bg-white/30">
                    No badges created yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-playfair font-bold text-passport-navy mb-4 flex items-center gap-2 border-b border-paper-border/60 pb-2">
                <span>📅</span> Daily Attendance Checkpoints (จุดเช็คอินรายวัน)
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {attendance.map((cp, index) => (
                  <DistrictCard key={cp.id} cp={cp} index={index + badges.length} />
                ))}
                {attendance.length === 0 && (
                  <div className="col-span-full py-8 text-center border-2 border-dashed border-paper-border rounded-xl italic font-sarabun text-sm text-muted-sepia bg-white/30">
                    No attendance checkpoints created yet.
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-paper-border/60 pt-8">
              <h4 className="text-xs font-sans font-bold uppercase text-muted-sepia tracking-widest mb-4">Add Checkpoint / Badge</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AddDistrictCard huntId={hunt.id} />
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
