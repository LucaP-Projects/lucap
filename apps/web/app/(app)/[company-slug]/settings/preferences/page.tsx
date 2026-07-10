'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { getPreferences, savePreferences } from '@/components/preferences/actions';

export default function PreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [baseCurrency, setBaseCurrency] = React.useState('TND');

  React.useEffect(() => {
    getPreferences().then(d => { setBaseCurrency(d.baseCurrency || 'TND'); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await savePreferences({ baseCurrency });
      if (r.success) { toast('Preferences saved'); router.refresh(); } else toast('Failed to save');
    } catch { toast('Error'); } finally { setSaving(false); }
  };

  if (loading) return <div className="container mx-auto py-6"><p>Loading...</p></div>;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground">Company-wide accounting preferences.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Accounting Preferences</CardTitle><CardDescription>Configure default settings for your company.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Field><FieldLabel>Base Currency</FieldLabel>
            <Input value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)} maxLength={3} placeholder="e.g. TND, USD" />
            <FieldDescription>Default currency for all transactions</FieldDescription>
          </Field>
          <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Preferences'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
