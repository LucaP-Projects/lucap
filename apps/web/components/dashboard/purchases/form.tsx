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
import { createPurchase } from './actions';
import { getPurchaseFormData } from './actions-form';
import { PurchasePaymentType } from '@/lib/generated/prisma/enums';

interface VendorOption { id: string; displayName: string; }
interface AccountOption { id: string; title: string; number: string; }
interface ClassDeptOption { id: string; name: string; }

const PAYMENT_TYPES = [
  { value: PurchasePaymentType.CASH, label: 'Cash' },
  { value: PurchasePaymentType.CHECK, label: 'Check' },
  { value: PurchasePaymentType.CREDIT_CARD, label: 'Credit Card' },
  { value: PurchasePaymentType.DEBIT_CARD, label: 'Debit Card' },
];

export function PurchaseForm() {
  const router = useRouter();
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [classes, setClasses] = useState<ClassDeptOption[]>([]);
  const [departments, setDepartments] = useState<ClassDeptOption[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [accountRefId, setAccountRefId] = useState('');
  const [paymentType, setPaymentType] = useState<PurchasePaymentType>(PurchasePaymentType.CHECK);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [privateNote, setPrivateNote] = useState('');
  const [notes, setNotes] = useState('');
  const [classId, setClassId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [credit, setCredit] = useState(false);
  const [lineItems, setLineItems] = useState([{ description: '', amount: 0, accountId: '' }]);

  useEffect(() => {
    getPurchaseFormData().then((data) => {
      setVendors(data.vendors);
      setAccounts(data.accounts);
      setClasses(data.classes);
      setDepartments(data.departments);
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
    if (!selectedVendor || !accountRefId || lineItems.length === 0) return;
    setSaving(true);
    try {
      const result = await createPurchase({
        vendorId: selectedVendor,
        amount: totalAmount,
        accountRefId,
        paymentType,
        paymentMethod: paymentMethod || undefined,
        txnDate: new Date(txnDate || Date.now()),
        privateNote,
        notes,
        credit,
        classId: classId || undefined,
        departmentId: departmentId || undefined,
        lineItems: lineItems.map(item => ({
          description: item.description,
          amount: Number(item.amount),
          accountId: item.accountId,
        })),
      });
      if (result.success) {
        router.push(`/${companySlug}/purchases`);
      }
    } catch (error) {
      console.error('Failed to create purchase:', error);
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
          <Label>Payment Type *</Label>
          <Select value={paymentType} onValueChange={(v) => setPaymentType(v as PurchasePaymentType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {PAYMENT_TYPES.map(pt => (
                <SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Account *</Label>
          <Select value={accountRefId} onValueChange={setAccountRefId}>
            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.number} - {a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="txnDate">Date</Label>
          <Input id="txnDate" type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
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

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Class</Label>
          <Select value={classId} onValueChange={setClassId}>
            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 flex items-end">
          <Label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} />
            Credit (Refund)
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="privateNote">Memo (Private Note)</Label>
          <Textarea id="privateNote" rows={2} value={privateNote} onChange={(e) => setPrivateNote(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving || !selectedVendor || !accountRefId || totalAmount <= 0}>
          {saving ? 'Saving...' : 'Create Purchase'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}