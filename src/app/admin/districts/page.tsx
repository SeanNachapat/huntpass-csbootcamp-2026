import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { MapPin, ShieldCheck } from 'lucide-react';
import DistrictCard from '@/components/DistrictCard';
import AddDistrictCard from '@/components/AddDistrictCard';

export default async function DistrictsPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/login');
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
          Districts & Officers
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">Manage checkpoints and assign ZPD officers to scan recruits.</p>
      </div>

      {hunts.map(hunt => (
        <div key={hunt.id} className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border">
          <div className="mb-8 border-b border-seal-gold/30 pb-4">
            <h2 className="text-2xl font-playfair font-bold text-passport-navy">{hunt.name}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {hunt.checkpoints.map((cp, index) => (
              <DistrictCard key={cp.id} cp={cp} index={index} />
            ))}
            
            {/* Add New District Card */}
            <AddDistrictCard huntId={hunt.id} />
          </div>
        </div>
      ))}
      
      {hunts.length === 0 && (
        <div className="text-center p-12 bg-passport-ivory paper-texture rounded-3xl border-dashed border-2 border-seal-gold/50">
          <p className="font-sarabun text-muted-sepia font-medium italic">No cases created yet.</p>
        </div>
      )}
    </div>
  );
}
