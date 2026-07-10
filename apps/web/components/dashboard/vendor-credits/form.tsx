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
import { Plus, Trash2 } from 'lucide-react';
import { createVendorCredit } from './actions';
import { getVendorCreditFormData } from './actions-form';

interface VendorOption { id: string; displayName: string; }
interface AccountOption { id: string; title: string; number: string; }

export function VendorCreditForm() {
  const router = useRouter();
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [creditDate, setCreditDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState([{ description: '', amount: 0, accountId: '' }]);

  useEffect(() => {
    getVendorCreditFormData().then((data) => {
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
    if (!selectedVendor || lineItems.length === 0) return;
    setSaving(true);
    try {
      const result = await createVendorCredit({
        vendorId: selectedVendor,
        amount: totalAmount,
        creditDate: new Date(creditDate || Date.now()),
        reason,
        notes,
        lineItems: lineItems.map(item => ({
          description: item.description,
          amount: Number(item.amount),
          accountId: item.accountId,
        })),
      });
      if (result.success) {
        router.push(`/${companySlug}/vendor-credits`);
      }
    } catch (error) {
      console.error('Failed to create vendor credit:', error);
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
          <Label htmlFor="creditDate">Credit Date</Label>
          <Input id="creditDate" type="date" value={creditDate} onChange={(e) => setCreditDate(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Reason</Label>
        <Input placeholder="e.g. Returned merchandise, overpayment" value={reason} onChange={(e) => setReason(e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Line Items *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </div>
        {lineItems.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateLineItem(i, 'description', e.target.value)}
              />
            </div>
            <div className="w-40 space-y-2">
              <Input
                type="number" step="0.01" min="0"
                placeholder="Amount"
                value={item.amount || ''}
                onChange={(e) => updateLineItem(i, 'amount', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="w-48 space-y-2">
              <Select value={item.accountId} onValueChange={(v) => updateLineItem(i, 'accountId', v)}>
                <SelectTrigger><SelectValue placeholder="Account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.number} - {a.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {lineItems.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => removeLineItem(i)} className="mt-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <div className="text-right text-sm font-medium">
          Total: ${totalAmount.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving || !selectedVendor || lineItems.length === 0}>
          {saving ? 'Saving...' : 'Create Vendor Credit'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}