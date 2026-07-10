import { VendorCreditForm } from '@/components/dashboard/vendor-credits/form';

export default function NewVendorCreditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">New Vendor Credit</h2>
        <p className="text-sm text-gray-600">Record a credit from a vendor</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <VendorCreditForm />
      </div>
    </div>
  );
}
