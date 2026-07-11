import { VendorForm } from '@/components/dashboard/vendors/vendor-form';

export default function NewVendorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">New Vendor</h2>
        <p className="text-sm text-gray-600">Add a new supplier or contractor</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <VendorForm mode="create" />
      </div>
    </div>
  );
}
