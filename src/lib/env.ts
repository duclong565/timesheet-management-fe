// Environment configuration helper
export const env = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001',

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || '',

  // App Configuration
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'TimesheetPro',
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || 'NCC Plus',

  // Derived values
  get API_BASE_URL() {
    return `${this.API_URL}/time-management`;
  },

  get GOOGLE_AUTH_URL() {
    return `${this.API_BASE_URL}/auth/google`;
  },

  // Validation
  get isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  get isDevelopment() {
    return process.env.NODE_ENV === 'development';
  },

  // Check if required env vars are set
  validateRequired() {
    const required = ['NEXT_PUBLIC_API_URL'];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
    }

    return missing.length === 0;
  },
};

// Validate environment on load (development only)
if (env.isDevelopment) {
  env.validateRequired();
}
