/**
 * Environment variable validation utility
 * Validates that all required environment variables are present
 */

const requiredEnvVars = {
  // Server-side only variables
  server: ['GOOGLE_API_KEY'],
  
  // Client-side accessible variables (NEXT_PUBLIC_*)
  client: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  
  // Optional variables (won't throw errors if missing)
  optional: [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL',
  ],
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variables are missing
 */
export function validateEnv() {
  const missing: string[] = [];

  // Check server-side variables
  requiredEnvVars.server.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check client-side variables
  requiredEnvVars.client.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(key => `  - ${key}`).join('\n')}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `See .env.example for reference.`
    );
  }

  // Warn about missing optional variables
  const missingOptional: string[] = [];
  requiredEnvVars.optional.forEach((key) => {
    if (!process.env[key]) {
      missingOptional.push(key);
    }
  });

  if (missingOptional.length > 0 && typeof window === 'undefined') {
    console.warn(
      `Optional environment variables not set:\n${missingOptional.map(key => `  - ${key}`).join('\n')}`
    );
  }
}

/**
 * Gets an environment variable value with type safety
 * @param key - The environment variable key
 * @param defaultValue - Optional default value if the variable is not set
 * @returns The environment variable value or default value
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set and no default value provided`);
  }
  return value || defaultValue || '';
}

/**
 * Type-safe environment variable getters
 */
export const env = {
  // Google AI
  googleApiKey: () => getEnv('GOOGLE_API_KEY'),
  
  // Supabase
  supabaseUrl: () => getEnv('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: () => getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  
  // Site configuration
  siteUrl: () => getEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
  devRedirectUrl: () => getEnv('NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL', 'http://localhost:3000/auth/callback'),
} as const;
