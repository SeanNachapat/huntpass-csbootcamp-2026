import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'officer') {
      return NextResponse.json({ error: 'Unauthorized officer' }, { status: 401 });
    }

    const { participantId, huntId, checkpointId } = await request.json();

    if (!participantId || !huntId || !checkpointId) {
      return NextResponse.json({ error: 'Invalid QR code data' }, { status: 400 });
    }

    // Fetch officer to get checkpoints
    const officer = await prisma.staff.findUnique({
      where: { sessionToken: session.token },
      include: { checkpoints: true }
    });

    if (!officer || officer.checkpoints.length === 0) {
      return NextResponse.json({ error: 'Invalid officer or missing assignment' }, { status: 401 });
    }

    const checkpoint = officer.checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      return NextResponse.json({ error: 'Officer is not assigned to this scanner' }, { status: 403 });
    }

    // Verify participant
    const participant = await prisma.participant.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    if (participant.huntId !== checkpoint.huntId) {
      return NextResponse.json({ error: 'Participant is registered for a different hunt' }, { status: 400 });
    }

    // Check if already stamped
    const existingStamp = await prisma.stamp.findUnique({
      where: {
        participantId_checkpointId: {
          participantId: participant.id,
          checkpointId: checkpointId,
        }
      }
    });

    if (existingStamp) {
      return NextResponse.json({ 
        error: 'Already stamped', 
        participantName: participant.name,
        stampedAt: existingStamp.stampedAt 
      }, { status: 400 });
    }

    // Create stamp
    const stamp = await prisma.stamp.create({
      data: {
        participantId: participant.id,
        checkpointId: checkpointId,
        officerId: officer.id,
      }
    });

    return NextResponse.json({ 
      success: true, 
      participantName: participant.name,
      speciesAvatar: participant.house
    });

  } catch (error) {
    console.error('Stamp API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
