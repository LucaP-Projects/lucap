import { PurchaseOrderForm } from '@/components/dashboard/purchase-orders/form';

export default function NewPurchaseOrderPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">New Purchase Order</h2>
        <p className="text-sm text-gray-600">Create a purchase order for a vendor</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <PurchaseOrderForm />
      </div>
    </div>
  );
}