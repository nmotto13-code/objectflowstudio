import { Inngest } from 'inngest';
import { env } from '@objectflow/config';
import { events } from '@objectflow/events';
import { smokeTestAgentFn } from './functions/smoke-test-agent.js';

export const inngest = new Inngest({
  id: 'objectflow-worker',
  eventKey: env.INNGEST_EVENT_KEY,
  schemas: events,
});

export const inngestFunctions = [smokeTestAgentFn];
