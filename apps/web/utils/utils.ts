import emailValidator from 'deep-email-validator';

export function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z\s'-]/g, '')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export const VALID_DOMAINS = () => {
  // In development, allow any email domain for testing
  if (process.env.NODE_ENV === 'development') {
    return []; // Empty array means no domain restrictions
  }

  // In production, restrict to specific domains
  const domains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com'
  ];

  return domains;
};


export async function verifyUserEmail(email: string) {
  if (process.env.NODE_ENV === 'development') return { valid: true, reason: 'Development mode allows any email' };

  return emailValidator({
    email: email,
    validateRegex: true,
    validateTypo: true,
    validateDisposable: true, // Blocks 10-minute mail domains
    validateMx: true,         // Pings DNS to ensure the company domain exists
    validateSMTP: false       // Keep false to avoid rate limits/timeouts
  });

}