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
import { createBill } from './actions';
import { getBillFormData } from './actions-form';

interface VendorOption { id: string; displayName: string; }
interface AccountOption { id: string; title: string; number: string; }

export function BillForm() {
  const router = useRouter();
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [memo, setMemo] = useState('');
  const [lineItems, setLineItems] = useState([{ description: '', amount: 0, accountId: '' }]);

  useEffect(() => {
    getBillFormData().then((data) => {
      setVendors(data.vendors);
      setAccounts(data.accounts);
    }).catch(console.error);
  }, []);

  const addLineItem = () => {
    setLineItems(prev => [...prev, { description: '', amount: 0, accountId: '' }]);
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setLineItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeLineItem = (index: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !dueDate || lineItems.length === 0) return;
    setSaving(true);
    try {
      const result = await createBill({
        vendorId: selectedVendor,
        amount: totalAmount,
        billDate: new Date(billDate || Date.now()),
        dueDate: new Date(dueDate || Date.now()),
        notes,
        memo,
        lineItems: lineItems.map(item => ({
          description: item.description,
          amount: Number(item.amount),
          accountId: item.accountId,
        })),
      });
      if (result.success) {
        router.push(`/${companySlug}/bills`);
      }
    } catch (error) {
      console.error('Failed to create bill:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Vendor *</Label>
          <Select value={selectedVendor} onValueChange={setSelectedVendor}>
            <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
            <SelectContent>
              {vendors.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="billDate">Bill Date</Label>
          <Input id="billDate" type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input id="dueDate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium">Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>+ Add Item</Button>
        </div>
        {lineItems.map((item, index) => (
          <div key={index} className="flex gap-3 items-end border rounded-lg p-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Description</Label>
              <Input value={item.description} onChange={(e) => updateLineItem(index, 'description', e.target.value)} />
            </div>
            <div className="w-36 space-y-1">
              <Label className="text-xs">Account</Label>
              <Select value={item.accountId} onValueChange={(v) => updateLineItem(index, 'accountId', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.number} - {a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28 space-y-1">
              <Label className="text-xs">Amount</Label>
              <Input type="number" step="0.01" value={item.amount} onChange={(e) => updateLineItem(index, 'amount', parseFloat(e.target.value) || 0)} />
            </div>
            {lineItems.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)} className="text-red-500">✕</Button>
            )}
          </div>
        ))}
        <div className="text-right text-lg font-bold">Total: ${totalAmount.toFixed(2)}</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="memo">Memo</Label>
          <Textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving || !selectedVendor || !dueDate || totalAmount <= 0}>
          {saving ? 'Saving...' : 'Create Bill'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
