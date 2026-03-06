import { getEnvConfig } from '@repo/utils';

const env = getEnvConfig();

export const appConfig = {
  name: 'Client Admin | Real Estate',
  description: 'Client administration portal for Real Estate.',
  ...env,
  port: 3002,
} as const;
