import React from 'react';
import Link from 'next/link';
import { FileX, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CreditMemoNotFound = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white">
    <div className="max-w-lg space-y-6 px-4 text-center">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      <h1 className="text-4xl font-semibold text-gray-900">404</h1>
      <h2 className="text-xl font-medium text-gray-900">
        Credit Memo Not Found
      </h2>

      <p className="text-base text-gray-600">
        We couldn&apos;t locate the credit memo you&apos;re looking for. It may
        have been deleted, archived, or the link might be incorrect.
      </p>

      <div className="flex justify-center gap-4 pt-4">
        <Link href="/creditmemos">
          <Button variant="outline" size="lg" className="h-11">
            Back to Credit Memos
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" className="h-11 bg-gray-900">
            Go to Dashboard
          </Button>
        </Link>
      </div>

      <p className="pt-4 text-sm text-gray-500">
        Need help? Contact our support team
      </p>
    </div>
  </div>
);

export default CreditMemoNotFound;
