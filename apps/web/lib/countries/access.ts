'use server';

import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCountry, countrySupportLevel } from './data';

/**
 * Checks if the user's active company country has full accounting/tax support.
 */
export async function getCompanyCountrySupport() {
  const session = await getSessionWithCompany();
  if (!session?.user?.activeCompanyId) return { supportLevel: 'unknown' as const, countryCode: null };

  const company = await prisma.company.findUnique({
    where: { id: session.user.activeCompanyId },
    select: { countryCode: true },
  });

  const code = company?.countryCode || 'TN';
  const level = countrySupportLevel(code);
  const country = getCountry(code);

  return {
    supportLevel: level,
    countryCode: code,
    countryName: country?.nameEn || null,
    isFullySupported: level === 'full',
    requiresSetup: level === 'coming',
  };
}
