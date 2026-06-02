// Fires the L0 smoke-test event into the local Inngest dev server.
import './load-env.js';

import { Inngest } from 'inngest';

const ing = new Inngest({
  id: 'send-smoke',
  eventKey: process.env.INNGEST_EVENT_KEY ?? 'dev',
  isDev: true,
});

const result = await ing.send({
  name: 'system/smoke.test.requested',
  data: { prompt: 'Say "ObjectFlow L0 ready" and nothing else.' },
});
console.log('Sent event(s):', result);
