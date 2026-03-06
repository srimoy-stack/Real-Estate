import { getEnvConfig } from '@repo/utils';

const env = getEnvConfig();

export const appConfig = {
  name: 'Super Admin | Real Estate',
  description: 'Platform administration dashboard for Real Estate.',
  ...env,
  port: 3001,
} as const;
