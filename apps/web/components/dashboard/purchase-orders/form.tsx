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
import { createPurchaseOrder } from './actions';
import { getPurchaseOrderFormData } from './actions-form';

interface VendorOption { id: string; displayName: string; }
interface AccountOption { id: string; title: string; number: string; }
interface ClassDeptTermOption { id: string; name: string; }

export function PurchaseOrderForm() {
  const router = useRouter();
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [saving, setSaving] = useState(false);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [classes, setClasses] = useState<ClassDeptTermOption[]>([]);
  const [departments, setDepartments] = useState<ClassDeptTermOption[]>([]);
  const [terms, setTerms] = useState<ClassDeptTermOption[]>([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [apAccountRefId, setApAccountRefId] = useState('');
  const [txnDate, setTxnDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');
  const [poEmail, setPoEmail] = useState('');
  const [classId, setClassId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [termId, setTermId] = useState('');
  const [lineItems, setLineItems] = useState([{ description: '', amount: 0, accountId: '' }]);

  useEffect(() => {
    getPurchaseOrderFormData().then((data) => {
      setVendors(data.vendors);
      setAccounts(data.accounts);
      setClasses(data.classes);
      setDepartments(data.departments);
      setTerms(data.terms);
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
      const result = await createPurchaseOrder({
        vendorId: selectedVendor,
        amount: totalAmount,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        txnDate: new Date(txnDate || Date.now()),
        memo,
        poEmail: poEmail || undefined,
        apAccountRefId: apAccountRefId || undefined,
        classId: classId || undefined,
        departmentId: departmentId || undefined,
        termId: termId || undefined,
        lineItems: lineItems.map(item => ({
          description: item.description,
          amount: Number(item.amount),
          accountId: item.accountId,
        })),
      });
      if (result.success) {
        router.push(`/${companySlug}/purchase-orders`);
      }
    } catch (error) {
      console.error('Failed to create purchase order:', error);
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
          <Label htmlFor="txnDate">Order Date</Label>
          <Input id="txnDate" type="date" value={txnDate} onChange={(e) => setTxnDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>AP Account</Label>
          <Select value={apAccountRefId} onValueChange={setApAccountRefId}>
            <SelectTrigger><SelectValue placeholder="Select AP account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.number} - {a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        <div className="space-y-2">
          <Label>Terms</Label>
          <Select value={termId} onValueChange={setTermId}>
            <SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger>
            <SelectContent>
              {terms.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="poEmail">PO Email</Label>
          <Input id="poEmail" type="email" value={poEmail} onChange={(e) => setPoEmail(e.target.value)} placeholder="vendor@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="memo">Memo</Label>
          <Textarea id="memo" rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={saving || !selectedVendor || totalAmount <= 0}>
          {saving ? 'Saving...' : 'Create Purchase Order'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}