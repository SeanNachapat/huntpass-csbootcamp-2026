import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ScannerUI from './ScannerUI';
import { MapPin, LogOut } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/actions';

export default async function OfficerScanPage() {
  const session = await getSession();

  if (!session || session.role !== 'officer') {
    redirect('/officer');
  }

  const officer = await prisma.staff.findUnique({
    where: { sessionToken: session.token },
    include: { 
      checkpoint: { 
        include: { 
          hunt: {
            include: {
              checkpoints: { orderBy: { order: 'asc' } }
            }
          } 
        } 
      } 
    }
  });

  if (!officer || !officer.checkpoint) {
    redirect('/officer');
  }

  return (
    <div className="flex flex-col min-h-screen bg-deep-night/60 backdrop-blur-sm text-white relative">
      <header className="bg-passport-navy p-4 shadow-md flex justify-between items-center sticky top-0 z-10 w-full">
        <div className="flex items-center gap-2">
          <img src="/assets/Logo.png" alt="HuntPass Logo" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-sarabun text-seal-gold/80 hidden sm:inline">
            Officer {officer.displayName}
          </span>
          <form action={logout}>
            <button type="submit" className="font-mono text-xs text-seal-gold/80 hover:text-seal-gold flex items-center gap-1 transition cursor-pointer">
              <LogOut size={16} /> Exit
            </button>
          </form>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-[430px] mx-auto flex flex-col h-full">
          {(() => {
            const checkpoints = officer.checkpoint.hunt.checkpoints;
            const cpIndex = checkpoints.findIndex((cp: any) => cp.id === officer.checkpointId);
            const districtColors = ['#4A90D9', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#16A085', '#C9A84C', '#C0392B'];
            const checkpointColor = districtColors[Math.max(0, cpIndex) % districtColors.length];
            
            return (
              <ScannerUI 
                checkpointName={officer.checkpoint.name} 
                checkpointIcon={officer.checkpoint.zootopiaIcon ?? undefined}
                checkpointColor={checkpointColor}
              />
            );
          })()}
        </div>
      </main>
    </div>
  );
}
