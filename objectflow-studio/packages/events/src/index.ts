import { EventSchemas } from 'inngest';
import { z } from 'zod';

/**
 * Single source of truth for Inngest event payloads. New events get added here
 * and become typed across the worker + web apps automatically.
 *
 * Each entry takes the shape `{ data: ZodSchema, user?: ZodSchema }` — Inngest
 * wraps it into the full `{ name, data, user, ts }` event envelope.
 */
const SmokeTestRequestedData = z.object({
  prompt: z.string().optional(),
});

export const events = new EventSchemas().fromZod({
  'system/smoke.test.requested': { data: SmokeTestRequestedData },
});

export type SmokeTestRequestedData = z.infer<typeof SmokeTestRequestedData>;
