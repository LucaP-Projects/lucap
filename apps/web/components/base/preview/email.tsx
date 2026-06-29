import { memo } from 'react';
import { Mail } from 'lucide-react';
import { useFormCacheStore } from '@/stores/useInvoice';
import { useSidebarStore } from '@/stores/useSidePaper';
import { colorPalette } from '../sideBar/color/colors';
import { Company, PaperType } from './types';

interface EmailPreviewProps {
  company?: Company | null;
  paperType: PaperType;
}

export const EmailPreview = memo(
  ({ company, paperType }: EmailPreviewProps) => {
    const selectedColor = useSidebarStore((state) => state.selectedColor);
    const formData = useFormCacheStore((state) => state.cachedFormData);

    return (
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-lg border bg-white shadow dark:border-gray-700 dark:bg-gray-900">
          {/* Email Header with Recipients */}
          <div className="border-b p-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  To: {formData?.emailCustomer}
                </p>
                {formData?.ccEmail && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    CC: {formData?.ccEmail || 'No cc is selected'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Email Content */}
          <div className="space-y-6 p-6">
            {/* Pink Header Section */}
            <div
              className="rounded-lg p-6 text-center"
              style={{ backgroundColor: colorPalette[selectedColor].light }}
            >
              <h2 className="mb-2 text-xl font-semibold text-gray-800">
                Your {paperType} is ready!
              </h2>
              <p className="text-sm text-gray-600">
                Total ${formData?.amount.toFixed(2) || 0}
              </p>

              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">BALANCE DUE</p>
                <p className="text-3xl font-bold text-gray-800">
                  ${formData?.amount.toFixed(2) || 0}
                </p>
              </div>
            </div>

            {/* Message Section */}
            <div className="text-center text-gray-600 dark:text-gray-400">
              The email message you write will go here
            </div>

            {/* View Details Button */}
            <div className="text-center">
              <button
                className="rounded-full px-6 py-2 text-sm text-white"
                style={{ backgroundColor: colorPalette[selectedColor].main }}
              >
                View details
              </button>
            </div>

            {/* Company Information */}
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">
                {company?.name || 'LucaP'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {company?.address?.line1 || '123 Business Street'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {company?.address?.city || 'City'},{' '}
                {company?.address?.state || 'State'}{' '}
                {company?.address?.postalCode || 'Zip'}
              </p>
              <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                noreply@lucapacioli.com.tn
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <p className="mb-2">
              If you receive an email that seems fraudulent, please check with
              the business owner before paying, or you can forward the email to
              security@lucapacioli.com.tn so we can look into it. Read more at
              security.lucapacioli.com.tn
            </p>
            <p>Powered by LucaP</p>
            <p>
              © {new Date().getFullYear()} LucaP, Inc. All rights reserved.
            </p>
            <p>
              <span className="mx-1">Privacy</span>|
              <span className="mx-1">Security</span>|
              <span className="mx-1">Terms of Service</span>
            </p>
          </div>
        </div>
      </div>
    );
  }
);
EmailPreview.displayName = 'MemoizedEmailPreview';
