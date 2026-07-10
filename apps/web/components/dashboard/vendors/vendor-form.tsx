'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createVendor } from './actions';

interface VendorFormProps {
  initialData?: any;
  mode?: 'create' | 'edit';
}

export function VendorForm({ initialData, mode = 'create' }: VendorFormProps) {
  const router = useRouter();
  const { 'company-slug': companySlug } = useParams<{ 'company-slug': string }>();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    displayName: initialData?.displayName || '',
    companyName: initialData?.companyName || '',
    primaryEmail: initialData?.primaryEmail || '',
    primaryPhone: initialData?.primaryPhone || '',
    website: initialData?.website || '',
    taxId: initialData?.taxId || '',
    accountNumber: initialData?.accountNumber || '',
    notes: initialData?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await createVendor(form);
      if (result.success) {
        router.push(`/${companySlug}/vendors`);
      }
    } catch (error) {
      console.error('Failed to save vendor:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Vendor Name *</Label>
          <Input id="displayName" required
            value={form.displayName}
            onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input id="companyName"
            value={form.companyName}
            onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryEmail">Email</Label>
          <Input id="primaryEmail" type="email"
            value={form.primaryEmail}
            onChange={(e) => setForm(f => ({ ...f, primaryEmail: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryPhone">Phone</Label>
          <Input id="primaryPhone"
            value={form.primaryPhone}
            onChange={(e) => setForm(f => ({ ...f, primaryPhone: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input id="website"
            value={form.website}
            onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID</Label>
          <Input id="taxId"
            value={form.taxId}
            onChange={(e) => setForm(f => ({ ...f, taxId: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input id="accountNumber"
            value={form.accountNumber}
            onChange={(e) => setForm(f => ({ ...f, accountNumber: e.target.value }))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3}
          value={form.notes}
          onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : mode === 'create' ? 'Create Vendor' : 'Update Vendor'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
