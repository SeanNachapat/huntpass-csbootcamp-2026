import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ScannerUI from './ScannerUI';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default async function OfficerScanPage() {
  const session = await getSession();

  if (!session || session.role !== 'officer') {
    redirect('/officer');
  }

  const officer = await prisma.staff.findUnique({
    where: { sessionToken: session.token },
    include: { checkpoint: { include: { hunt: true } } }
  });

  if (!officer || !officer.checkpoint) {
    redirect('/officer');
  }

  return (
    <div className="flex flex-col min-h-screen bg-zpd-navy text-white">
      <header className="bg-zoo-blue-900 p-4 shadow-md flex justify-between items-center sticky top-0 z-10 border-b-2 border-zoo-gold-500">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-zoo-gold-500" />
          <span className="font-bold text-lg hidden sm:inline">Scanner: {officer.checkpoint.name}</span>
          <span className="font-bold text-lg sm:hidden">{officer.checkpoint.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zoo-blue-200 hidden sm:inline">
            Officer {officer.displayName}
          </span>
          <Link href="/" className="text-sm bg-zoo-blue-800 px-3 py-1 rounded-full hover:bg-zoo-blue-700 transition">
            Exit
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl text-slate-800">
          <ScannerUI />
        </div>
      </main>
    </div>
  );
}
