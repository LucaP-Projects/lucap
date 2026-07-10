import { PurchaseForm } from '@/components/dashboard/purchases/form';

export default function NewPurchasePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">New Purchase</h2>
        <p className="text-sm text-gray-600">Record an expense purchase</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <PurchaseForm />
      </div>
    </div>
  );
}