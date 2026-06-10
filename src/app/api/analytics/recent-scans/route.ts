import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'chief') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const recentScans = await prisma.stamp.findMany({
    take: 15,
    orderBy: {
      stampedAt: 'desc',
    },
    include: {
      participant: {
        select: {
          name: true,
          nickname: true,
        }
      },
      checkpoint: {
        select: {
          name: true,
        }
      },
      officer: {
        select: {
          displayName: true,
        }
      }
    }
  });

  const formattedScans = recentScans.map(scan => ({
    id: scan.id,
    participantName: `${scan.participant.name} (${scan.participant.nickname})`,
    checkpointName: scan.checkpoint.name,
    officerName: scan.officer.displayName,
    timestamp: scan.stampedAt,
  }));

  return NextResponse.json({ recentScans: formattedScans });
}
