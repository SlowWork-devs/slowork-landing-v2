import { z } from 'zod';

export const welcomeEmailBodySchema = z.object({
  email: z.string().trim().email('Email inválido'),
  name: z.string().trim().min(1, 'Nombre requerido'),
  lang: z.unknown().transform((v): 'es' | 'en' => (v === 'es' ? 'es' : 'en')),
});

export type WelcomeEmailInput = z.infer<typeof welcomeEmailBodySchema>;
