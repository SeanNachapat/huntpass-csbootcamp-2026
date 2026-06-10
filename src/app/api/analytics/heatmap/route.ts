import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'chief') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const activeHunt = await prisma.hunt.findFirst({
    where: { status: 'active' },
    include: {
      checkpoints: true
    }
  });

  if (!activeHunt) {
    return NextResponse.json({ heatmap: [] });
  }

  // Get all stamps for this hunt
  const stamps = await prisma.stamp.findMany({
    where: {
      checkpoint: { huntId: activeHunt.id }
    }
  });

  // Count stamps per checkpoint
  const trafficData = activeHunt.checkpoints.map(cp => {
    const count = stamps.filter(s => s.checkpointId === cp.id).length;
    return {
      name: cp.name,
      scans: count,
      icon: cp.zootopiaIcon
    };
  });

  return NextResponse.json({ heatmap: trafficData });
}
