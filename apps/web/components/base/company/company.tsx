// components/company-info.tsx
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/useSidePaper';
import { colorPalette } from '../sideBar/color/colors';

interface CompanyInfoProps {
  doc: string;
  company: {
    name: string;
    legalName?: string | null;
    taxId?: string | null;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: any;
    logo?: string | null;
  };
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export function CompanyInfo({
  company,
  variant = 'desktop',
  className,
  doc
}: CompanyInfoProps) {
  const address = company.address;
  const selectedColor = useSidebarStore((state) => state.selectedColor);
  return (
    <div
      className={cn(
        'bg-white p-4 dark:bg-gray-800',
        variant === 'mobile' ? 'block lg:hidden' : 'hidden lg:block',
        className
      )}
    >
      {/* Document Type Banner */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
        <h1
          className="text-xl font-bold text-blue-600 dark:text-gray-200"
          style={{ color: colorPalette[selectedColor].main }}
        >
          {doc}
        </h1>
      </div>

      {/* Company Content */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left Section - Logo & Basic Info */}
        <div className="flex flex-1 items-start gap-4">
          {company.logo && (
            <img
              src={company.logo}
              alt="Company Logo"
              className="h-12 w-12 shrink-0 object-contain"
              loading="lazy"
            />
          )}
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {company.legalName || company.name}
            </h2>
            {address && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {[
                  address.street,
                  address.city,
                  address.state,
                  address.postalCode
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            )}
            {address?.country && (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {address.country}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Contact Info */}
        <div className="flex flex-col items-start gap-1.5 md:items-end">
          {company.website && (
            <a
              href={company.website}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {company.email && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {company.email}
            </div>
          )}
          {company.phone && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {company.phone}
            </div>
          )}
          {company.taxId && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Tax ID: {company.taxId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
