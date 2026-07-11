import { BillPaymentForm } from '@/components/dashboard/bill-payments/bill-payment-form';

export default function NewBillPaymentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-blue-900">New Bill Payment</h2>
        <p className="text-sm text-gray-600">Record a payment to a vendor</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <BillPaymentForm />
      </div>
    </div>
  );
}
