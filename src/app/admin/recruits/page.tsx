import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Users, ShieldCheck } from 'lucide-react';
import RecruitManager from '@/components/RecruitManager';
import RecruitRow from '@/components/RecruitRow';

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

          <div className="bg-white/60 border border-paper-border rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-passport-navy/5 text-xs font-sans font-bold text-muted-sepia uppercase tracking-widest border-b border-paper-border">
              <div className="col-span-2">Username</div>
              <div className="col-span-2">Password</div>
              <div className="col-span-3">Full Name</div>
              <div className="col-span-2">Nickname</div>
              <div className="col-span-2">House</div>
              <div className="col-span-1 text-right pr-2">Actions</div>
            </div>

            <div className="divide-y divide-paper-border/50 flex flex-col">
              {hunt.participants.map(p => (
                <RecruitRow key={p.id} recruit={p} />
              ))}
              
              {hunt.participants.length === 0 && (
                <div className="p-12 flex flex-col items-center justify-center text-muted-sepia bg-white/40">
                  <Users size={48} className="mb-4 opacity-30 text-seal-gold" />
                  <p className="font-playfair font-bold text-lg text-passport-navy">No recruits enrolled yet.</p>
                  <p className="text-sm font-sarabun mt-1">Use the buttons above to add or import recruits.</p>
                </div>
              )}
            </div>
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
