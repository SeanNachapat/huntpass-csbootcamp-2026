'use server';

import { prisma } from '@/lib/prisma';
import { setSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';

// Join flow is disabled since Admin seeds users directly.

export async function unifiedLogin(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) throw new Error('Username and Password required');

  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'password123';

  // 1. Check Admin
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const sessionToken = crypto.randomBytes(16).toString('hex');
    await setSession(sessionToken, 'chief');
    redirect('/admin');
  }

  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  // 2. Check Officer
  const officer = await prisma.staff.findFirst({
    where: { username, password: hashedPassword }
  });

  if (officer) {
    await setSession(officer.sessionToken, 'officer');
    redirect('/officer/scan');
  }

  // 3. Check Recruit
  const recruit = await prisma.participant.findFirst({
    where: { username, password: hashedPassword }
  });

  if (recruit) {
    await setSession(recruit.qrToken, 'participant');
    redirect('/dashboard');
  }

  throw new Error('Invalid credentials');
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
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  await prisma.staff.create({
    data: {
      displayName,
      username,
      password: hashedPassword,
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

  if (!huntId || !name) throw new Error('Hunt ID and Name are required');

  await prisma.checkpoint.create({
    data: {
      huntId,
      name,
      zootopiaIcon
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
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

  await prisma.participant.create({
    data: {
      huntId,
      name,
      surname,
      nickname,
      house,
      username,
      password: hashedPassword,
      qrToken
    }
  });

  revalidatePath('/admin');
}

export async function removeRecruit(formData: FormData) {
  const recruitId = formData.get('recruitId') as string;

  if (!recruitId) throw new Error('Recruit ID is required');

  await prisma.participant.delete({
    where: { id: recruitId }
  });

  revalidatePath('/admin');
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
    data.password = crypto.createHash('sha256').update(password).digest('hex');
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
