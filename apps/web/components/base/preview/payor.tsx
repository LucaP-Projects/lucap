import { memo } from 'react';
import { format } from 'date-fns';
import { ArrowRight, Download, Printer, User } from 'lucide-react';
import { useFormCacheStore } from '@/stores/useInvoice';
import { useSidebarStore } from '@/stores/useSidePaper';
import { colorPalette } from '../sideBar/color/colors';
import { Company, PaperType } from './types';

interface PayorPreviewProps {
  company?: Company | null;
  paperType: PaperType;
}

export const PayorPreview = memo(
  ({ company, paperType }: PayorPreviewProps) => {
    const selectedColor = useSidebarStore((state) => state.selectedColor);
    const formData = useFormCacheStore((state) => state.cachedFormData);
    return (
      <div className="mx-auto max-w-4xl bg-white p-6 dark:bg-gray-900">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-10 w-32 rounded bg-gray-200 text-center text-sm leading-10 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              Logo
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
              <User className="h-5 w-5" />
              Sign In
            </button>
          </div>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            Balance due
          </h2>
          <p className="my-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            ${formData?.amount.toFixed(2) || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Contact {company?.name || ''} if you&apos;re not sure how to pay
            this
            {paperType}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Customer details
            </h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {company?.name || ''}
              </p>
              {/* <p className="text-sm text-gray-600 dark:text-gray-400">
              {formData?.invoiceNumber && `Invoice #${formData.invoiceNumber}`}
            </p> */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formData?.dueDate &&
                  `Due date: ${format(formData.dueDate, 'MMMM d, yyyy')}`}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {paperType} amount: ${formData?.amount.toFixed(2) || 0}
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Merchant details
            </h3>
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {company?.name || ''}
              </p>
              {company?.email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email: {company.email}
                </p>
              )}
              {company?.address && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>{company.address.line1}</p>
                  {company.address.line2 && <p>{company.address.line2}</p>}
                  <p>
                    {company.address.city}, {company.address.state}{' '}
                    {company.address.postalCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            className="flex items-center gap-2 rounded-full px-6 py-2 text-white"
            style={{ backgroundColor: colorPalette[selectedColor].main }}
          >
            View {paperType} <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 rounded-full border px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Download className="h-4 w-4" /> Download
            </button>
            <button className="flex items-center gap-2 rounded-full border px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </div>

        <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()} SilkNexus. All rights reserved.{' '}
            <span className="mx-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Privacy
            </span>
            |
            <span className="mx-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Security
            </span>
            |
            <span className="mx-1 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Terms of Service
            </span>
          </p>
        </div>
      </div>
    );
  }
);
PayorPreview.displayName = 'MemoizedPayorPreview';
