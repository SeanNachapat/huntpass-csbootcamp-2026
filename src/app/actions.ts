'use server';

import { prisma } from '@/lib/prisma';
import { setSession, getSession, clearSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { read, utils } from 'xlsx';

// Join flow is disabled since Admin seeds users directly.

export async function unifiedLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) return { error: 'Username and Password required' };

  const ADMIN_USER = process.env.ADMIN_USER || ']l=KC';
  const ADMIN_PASS = process.env.ADMIN_PASS || '%A&RlGzOQ~8Db\\1{ckJZ%qQBg^onBg';

  // 1. Check Admin
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const sessionToken = crypto.randomBytes(16).toString('hex');
    await setSession(sessionToken, 'chief');
    redirect('/admin');
  }

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // 2. Check Officer
  const officer = await prisma.staff.findFirst({
    where: { 
      username, 
      OR: [{ password: hashedPassword }, { password }]
    }
  });

  if (officer) {
    await setSession(officer.sessionToken, 'officer');
    redirect('/officer/scan');
  }

  // 3. Check Recruit
  const recruit = await prisma.participant.findFirst({
    where: { 
      username, 
      OR: [{ password: hashedPassword }, { password }]
    }
  });

  if (recruit) {
    await setSession(recruit.qrToken, 'participant');
    redirect('/dashboard');
  }

  return { error: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง' };
}

export async function assignOfficer(formData: FormData) {
  const displayName = formData.get('displayName') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const checkpointId = formData.get('checkpointId') as string;

  if (!displayName || !username || !password || !checkpointId) {
    throw new Error('All fields are required');
  }

  const sessionToken = crypto.randomBytes(16).toString('hex');

  await prisma.staff.create({
    data: {
      displayName,
      username,
      password,
      checkpointId,
      sessionToken,
      role: 'officer'
    }
  });

  revalidatePath('/admin');
}

export async function addCheckpoint(formData: FormData) {
  const huntId = formData.get('huntId') as string;
  const name = formData.get('name') as string;
  const zootopiaIcon = (formData.get('icon') as string) || '📍';
  const hint = formData.get('hint') as string || null;

  if (!huntId || !name) throw new Error('Hunt ID and Name are required');

  await prisma.checkpoint.create({
    data: {
      huntId,
      name,
      zootopiaIcon,
      hint
    }
  });

  revalidatePath('/admin');
}

export async function updateCheckpoint(formData: FormData) {
  const checkpointId = formData.get('checkpointId') as string;
  const name = formData.get('name') as string;
  const zootopiaIcon = (formData.get('icon') as string) || '📍';
  const hint = formData.get('hint') as string || null;

  if (!checkpointId || !name) throw new Error('Checkpoint ID and Name are required');

  await prisma.checkpoint.update({
    where: { id: checkpointId },
    data: {
      name,
      zootopiaIcon,
      hint
    }
  });

  revalidatePath('/admin');
}

export async function removeCheckpoint(formData: FormData) {
  const checkpointId = formData.get('checkpointId') as string;

  if (!checkpointId) throw new Error('Checkpoint ID is required');

  await prisma.checkpoint.delete({
    where: { id: checkpointId }
  });

  revalidatePath('/admin');
}

export async function addRecruit(formData: FormData) {
  const huntId = formData.get('huntId') as string;
  const name = formData.get('name') as string;
  const surname = formData.get('surname') as string;
  const nickname = formData.get('nickname') as string;
  const house = formData.get('house') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!huntId || !name || !surname || !nickname || !house || !username || !password) {
    throw new Error('All fields are required');
  }

  const qrToken = crypto.randomBytes(16).toString('hex');

  await prisma.participant.create({
    data: {
      huntId,
      name,
      surname,
      nickname,
      house,
      username,
      password,
      qrToken
    }
  });

  revalidatePath('/admin');
}

export async function updateRecruit(formData: FormData) {
  const recruitId = formData.get('recruitId') as string;
  const name = formData.get('name') as string;
  const surname = formData.get('surname') as string;
  const nickname = formData.get('nickname') as string;
  const house = formData.get('house') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!recruitId || !name || !surname || !nickname || !house || !username) {
    throw new Error('All fields except password are required');
  }

  const dataToUpdate: any = {
    name,
    surname,
    nickname,
    house,
    username,
  };

  if (password) {
    dataToUpdate.password = password;
  }

  await prisma.participant.update({
    where: { id: recruitId },
    data: dataToUpdate,
  });

  revalidatePath('/admin/recruits');
}

export async function removeRecruit(formData: FormData) {
  const recruitId = formData.get('recruitId') as string;

  if (!recruitId) throw new Error('Recruit ID is required');

  await prisma.participant.delete({ where: { id: recruitId } });
  revalidatePath('/admin/recruits');
}

export async function bulkImportRecruits(formData: FormData) {
  const huntId = formData.get('huntId') as string;
  const file = formData.get('file') as File;
  
  if (!huntId || !file) throw new Error('Missing required fields');

  const buffer = Buffer.from(await file.arrayBuffer());
  
  let rawData: any[] = [];
  
  if (file.name.endsWith('.json')) {
    const text = buffer.toString('utf-8');
    rawData = JSON.parse(text);
  } else {
    const workbook = read(buffer, { type: 'buffer', codepage: 65001 });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    rawData = utils.sheet_to_json(worksheet);
  }

  const recruitsToCreate = rawData.map((rawRow: any) => {
    // Sanitize row by trimming all keys and values to ignore hidden blank spaces
    const row: any = {};
    for (const key of Object.keys(rawRow)) {
      if (rawRow[key] !== null && rawRow[key] !== undefined) {
        row[key.trim()] = String(rawRow[key]).trim();
      }
    }

    if (!row.name || !row.surname || !row.nickname || !row.house || !row.username || !row.password) {
      throw new Error(`Missing required fields in row: ${JSON.stringify(rawRow)}`);
    }

    const qrToken = crypto.randomBytes(32).toString('hex');

    return {
      huntId,
      name: row.name,
      surname: row.surname,
      nickname: row.nickname,
      house: row.house,
      username: row.username,
      password: row.password,
      qrToken,
    };
  });

  await prisma.participant.createMany({
    data: recruitsToCreate,
  });

  revalidatePath('/admin/recruits');
}

export async function updateOfficer(formData: FormData) {
  const officerId = formData.get('officerId') as string;
  const displayName = formData.get('displayName') as string;
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!officerId || !displayName || !username) {
    throw new Error('Required fields missing');
  }

  const data: any = { displayName, username };
  
  if (password) {
    data.password = password;
  }

  await prisma.staff.update({
    where: { id: officerId },
    data
  });

  revalidatePath('/admin');
}

export async function removeOfficer(formData: FormData) {
  const officerId = formData.get('officerId') as string;

  if (!officerId) throw new Error('Officer ID is required');

  await prisma.staff.delete({
    where: { id: officerId }
  });

  revalidatePath('/admin');
}

export async function broadcastAnnouncement(formData: FormData) {
  const message = formData.get('message') as string;
  if (!message || !message.trim()) {
    throw new Error('Message cannot be empty');
  }

  // Deactivate old ones
  await prisma.announcement.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  });

  // Create new active one
  await prisma.announcement.create({
    data: {
      message: message.trim(),
      isActive: true,
    }
  });

  revalidatePath('/admin');
  revalidatePath('/dashboard');
}

export async function changeRecruitPassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    throw new Error('Current and new password are required');
  }

  const session = await getSession();
  if (!session || session.role !== 'participant') {
    throw new Error('Unauthorized');
  }

  const participant = await prisma.participant.findUnique({
    where: { qrToken: session.token }
  });

  if (!participant) {
    throw new Error('Participant not found');
  }

  const hashedCurrent = crypto.createHash('sha256').update(currentPassword).digest('hex');
  if (participant.password !== hashedCurrent && participant.password !== currentPassword) {
    throw new Error('Current password is incorrect');
  }

  const hashedNew = crypto.createHash('sha256').update(newPassword).digest('hex');
  await prisma.participant.update({
    where: { id: participant.id },
    data: { password: hashedNew }
  });

  return { success: true };
}

export async function logout() {
  await clearSession();
  redirect('/');
}

export async function bulkRemoveRecruits(recruitIds: string[]) {
  if (!recruitIds || recruitIds.length === 0) return;
  await prisma.participant.deleteMany({
    where: {
      id: { in: recruitIds }
    }
  });
  revalidatePath('/admin/recruits');
}

export async function updateRecruitNickname(formData: FormData) {
  const nickname = formData.get('nickname') as string;

  if (!nickname || !nickname.trim()) {
    throw new Error('Nickname is required');
  }

  const session = await getSession();
  if (!session || session.role !== 'participant') {
    throw new Error('Unauthorized');
  }

  const participant = await prisma.participant.findUnique({
    where: { qrToken: session.token }
  });

  if (!participant) {
    throw new Error('Participant not found');
  }

  await prisma.participant.update({
    where: { id: participant.id },
    data: { nickname: nickname.trim() }
  });

  revalidatePath('/dashboard');
  revalidatePath('/leaderboard');
  return { success: true };
}
