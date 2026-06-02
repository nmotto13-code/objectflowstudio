import { inngest } from './instance.js';
import { smokeTestAgentFn } from './functions/smoke-test-agent.js';

export { inngest };
export const inngestFunctions = [smokeTestAgentFn];
