export type AppEnv = 'development' | 'staging' | 'production';

export interface EnvConfig {
  appEnv: AppEnv;
  apiUrl: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  tenantId?: string;
}

export function getEnvConfig(): EnvConfig {
  const appEnv = (process.env.NEXT_PUBLIC_APP_ENV || 'development') as AppEnv;

  return {
    appEnv,
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    isProduction: appEnv === 'production',
    isDevelopment: appEnv === 'development',
    isStaging: appEnv === 'staging',
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID || undefined,
  };
}
