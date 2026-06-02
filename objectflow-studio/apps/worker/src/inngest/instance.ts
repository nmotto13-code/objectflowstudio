import { Inngest } from 'inngest';
import { env } from '@objectflow/config';
import { events } from '@objectflow/events';

/**
 * The Inngest client. Lives in its own file (not client.ts) so that function
 * modules can import the client without creating a circular dependency with
 * client.ts (which aggregates the functions).
 */
export const inngest = new Inngest({
  id: 'objectflow-worker',
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: events,
});
