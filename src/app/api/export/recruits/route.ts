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
  });

  if (!activeHunt) {
    return NextResponse.json({ error: 'No active hunt' }, { status: 404 });
  }

  const recruits = await prisma.participant.findMany({
    where: { huntId: activeHunt.id },
    include: {
      stamps: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Create CSV String
  const headers = ['ID', 'Name', 'Surname', 'Nickname', 'House', 'Username', 'Total Stamps'];
  const rows = recruits.map(r => [
    r.id,
    r.name,
    r.surname,
    r.nickname,
    r.house,
    r.username,
    r.stamps.length.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="recruits-export-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
