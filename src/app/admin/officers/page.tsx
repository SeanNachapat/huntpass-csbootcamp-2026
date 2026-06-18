import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Users, ShieldCheck } from 'lucide-react';
import OfficersListUI from './OfficersListUI';

export default async function OfficersPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
  }

  // Fetch all staff members that are officers, with their assigned checkpoints
  const officers = await prisma.staff.findMany({
    where: { role: 'officer' },
    include: {
      checkpoints: {
        orderBy: [
          { createdAt: 'asc' },
          { order: 'asc' }
        ],
        include: {
          hunt: true
        }
      }
    },
    orderBy: { displayName: 'asc' }
  });

  // Fetch all checkpoints to assign to officers
  const allCheckpoints = await prisma.checkpoint.findMany({
    include: {
      hunt: true
    },
    orderBy: [
      { createdAt: 'asc' },
      { order: 'asc' }
    ]
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-playfair font-bold text-passport-navy flex items-center gap-3 mb-2 drop-shadow-sm">
          <Users className="text-seal-gold" size={32} />
          ZPD Officers & Scanner Access
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">
          Manage ZPD staff credentials and control their access to scanning badges or daily attendance check-ins.
        </p>
      </div>

      <div className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border">
        <OfficersListUI 
          initialOfficers={JSON.parse(JSON.stringify(officers))} 
          allCheckpoints={JSON.parse(JSON.stringify(allCheckpoints))} 
        />
      </div>
    </div>
  );
}
