import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import RecruitManager from '@/components/RecruitManager';
import RecruitTable from '@/components/RecruitTable';

export default async function RecruitsPage() {
  const session = await getSession();
  
  if (!session || session.role !== 'chief') {
    redirect('/');
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
        <h1 className="text-3xl font-playfair font-bold text-passport-navy flex items-center gap-3 mb-2 drop-shadow-sm">
          <ShieldCheck className="text-seal-gold" size={32} />
          Recruits Records
        </h1>
        <p className="text-muted-sepia font-sarabun text-sm tracking-wide">Add, configure, or remove Zootopia bootcamp recruits.</p>
      </div>

      {hunts.map(hunt => (
        <div key={hunt.id} className="bg-passport-ivory paper-texture rounded-2xl shadow-xl p-6 lg:p-8 border border-paper-border">
          <div className="mb-8 border-b border-seal-gold/30 pb-4">
            <h2 className="text-2xl font-playfair font-bold text-passport-navy">{hunt.name}</h2>
          </div>

          <RecruitManager huntId={hunt.id} />

          <RecruitTable recruits={hunt.participants} />
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
