import { BillForm } from '@/components/dashboard/bills/bill-form';

export default function NewBillPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">New Bill</h2>
        <p className="text-sm text-gray-600">Record a bill from a vendor</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <BillForm />
      </div>
    </div>
  );
}
