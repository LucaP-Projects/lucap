'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createBillPayment } from './actions';
import { getBillPaymentFormData } from './actions-form';
import { PaymentMethod } from '@/lib/generated/prisma/enums';

interface VendorOption { id: string; displayName: string; }
interface BillOption { id: string; number: string; amount: number; status: string; }

export function BillPaymentForm() {
  const router = useRouter();
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [availableBills, setAvailableBills] = useState<BillOption[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [allocations, setAllocations] = useState<Array<{ billId: string; amount: number }>>([]);

  useEffect(() => {
    getBillPaymentFormData().then((data) => setVendors(data.vendors)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedVendor) {
      setAvailableBills([]);
      setAllocations([]);
      return;
    }
    getBillPaymentFormData(selectedVendor).then((data) => {
      setAvailableBills(data.bills);
      setAllocations(data.bills.map(b => ({ billId: b.id, amount: 0 })));
    }).catch(console.error);
  }, [selectedVendor]);

  const updateAllocation = (billId: string, amount: number) => {
    setAllocations(prev => prev.map(a => a.billId === billId ? { ...a, amount } : a));
  };

  const totalAmount = allocations.reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || totalAmount <= 0) return;
    const validAllocations = allocations.filter(a => a.amount > 0);
    if (validAllocations.length === 0) return;
    setSaving(true);
    try {
      const result = await createBillPayment({
        vendorId: selectedVendor,
        amount: totalAmount,
        paymentDate: new Date(paymentDate || Date.now()),
        paymentMethod,
        reference: reference || undefined,
        notes: notes || undefined,
        allocations: validAllocations,
      });
      if (result.success) {
        router.push(`/${companySlug}/bill-payments`);
      }
    } catch (error) {
      console.error('Failed to create payment:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Vendor *</Label>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
            <SelectContent>
              {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.displayName}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Payment Method</Label>
          <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.values(PaymentMethod).map(m => (
                <SelectItem key={m} value={m}>{m.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reference">Reference</Label>
          <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} />
        </div>
      </div>

      {selectedVendor && availableBills.length > 0 && (
        <div className="space-y-4">
          <Label className="text-lg font-medium">Apply Payment To</Label>
          {availableBills.map((bill) => (
            <div key={bill.id} className="flex items-center gap-3 border rounded-lg p-3">
              <div className="flex-1">
                <p className="font-medium">Bill #{bill.number}</p>
                <p className="text-sm text-gray-500">
                  Total: ${bill.amount.toFixed(2)} | Status: {bill.status.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="w-32">
                <Input type="number" step="0.01" placeholder="Amount"
                  value={allocations.find(a => a.billId === bill.id)?.amount || 0}
                  onChange={(e) => updateAllocation(bill.id, parseFloat(e.target.value) || 0)}
                  max={bill.amount} />
              </div>
            </div>
          ))}
          <div className="text-right text-lg font-bold">Total Payment: ${totalAmount.toFixed(2)}</div>
        </div>
      )}

      {selectedVendor && availableBills.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-700">
          No open bills found for this vendor.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving || !selectedVendor || totalAmount <= 0}>
          {saving ? 'Saving...' : 'Record Payment'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
