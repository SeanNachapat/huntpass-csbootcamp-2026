import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { addCheckpoint } from '@/app/actions';
import { MapPin } from 'lucide-react';
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
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-2 drop-shadow-md">
          <MapPin className="text-zoo-amber-400" size={32} />
          Districts & Officers
        </h1>
        <p className="text-slate-200 font-medium drop-shadow">Manage checkpoints and assign ZPD officers to scan recruits.</p>
      </div>

      {hunts.map(hunt => (
        <div key={hunt.id} className="bg-white rounded-3xl shadow-sm p-6 border-t-4 border-zoo-amber-500">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zpd-navy">{hunt.name}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {hunt.checkpoints.map(cp => (
              <DistrictCard key={cp.id} cp={cp} />
            ))}
            
            {/* Add New District Card */}
            <AddDistrictCard huntId={hunt.id} />
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
