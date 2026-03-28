import { z } from 'zod';

const trimmedNullable = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  });

export const waitlistCreateBodySchema = z.object({
  email: z.string().trim().min(1, 'Email requerido'),
  firstName: trimmedNullable,
  phone: trimmedNullable,
  instagram: trimmedNullable,
  linkedin: trimmedNullable,
  preferredContact: trimmedNullable,
  communityInterest: trimmedNullable,
});

export type WaitlistCreateInput = z.infer<typeof waitlistCreateBodySchema>;
