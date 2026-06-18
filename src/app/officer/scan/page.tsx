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
      checkpoints: { 
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

  if (!officer || officer.checkpoints.length === 0) {
    redirect('/officer');
  }

  const checkpointIds = officer.checkpoints.map(cp => cp.id);

  const recentStamps = await prisma.stamp.findMany({
    where: { checkpointId: { in: checkpointIds } },
    orderBy: { stampedAt: 'desc' },
    take: 10,
    include: {
      participant: true
    }
  });

  const initialRecentScans = recentStamps.map(s => ({
    id: s.id,
    checkpointId: s.checkpointId,
    participantName: `${s.participant.name} ${s.participant.surname}`,
    nickname: s.participant.nickname,
    house: s.participant.house,
    stampedAt: s.stampedAt.toISOString()
  }));

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
          <ScannerUI 
            checkpoints={JSON.parse(JSON.stringify(officer.checkpoints))}
            initialRecentScans={initialRecentScans}
          />
        </div>
      </main>
    </div>
  );
}
