import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'chief') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get active hunt (assuming only 1 active at a time for the bootcamp)
  const activeHunt = await prisma.hunt.findFirst({
    where: { status: 'active' },
  });

  if (!activeHunt) {
    return NextResponse.json({ leaderboard: [] });
  }

  const participants = await prisma.participant.findMany({
    where: { huntId: activeHunt.id },
    include: {
      stamps: true,
    },
  });

  // Sort by stamp count descending, then take top 5
  const leaderboard = participants
    .sort((a, b) => b.stamps.length - a.stamps.length)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      surname: p.surname,
      username: p.username,
      stampCount: p.stamps.length,
    }));

  return NextResponse.json({ leaderboard });
}
