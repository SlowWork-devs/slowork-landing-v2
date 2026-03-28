import { prisma } from '../lib/prisma';
import type { WaitlistCreateInput } from '../models/waitlist';

const selectSafe = {
  id: true,
  email: true,
  creationDate: true,
} as const;

export function getClientIp(request: Request): string | null {
  const xfwd = request.headers.get('x-forwarded-for');
  if (!xfwd) return null;
  return xfwd.split(',')[0]?.trim() ?? null;
}

export type WaitlistRegisterResult =
  | { outcome: 'created'; item: { id: number; email: string; creationDate: Date } }
  | { outcome: 'duplicate' };

export async function registerWaitlistEntry(
  input: WaitlistCreateInput,
  request: Request,
): Promise<WaitlistRegisterResult> {
  const { email, firstName, phone, instagram, linkedin, preferredContact, communityInterest } = input;

  const existing = await prisma.waitlist.findFirst({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    return { outcome: 'duplicate' };
  }

  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get('user-agent');

  const item = await prisma.waitlist.create({
    data: {
      email,
      firstName,
      phone,
      instagram,
      linkedin,
      preferredContact,
      communityInterest,
      ipAddress,
      userAgent,
    },
    select: selectSafe,
  });

  return { outcome: 'created', item };
}
