'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Building2, User, Building, Users, Check, ChevronRight, Loader2,
  ArrowLeft, Plus, Trash2, Landmark, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ENTITY_INFO, STEPS, type Step, type WizardData, type CompanyInfoData, type CapitalData,
} from './types';
import { createCompany } from '../create/actions';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  SARL: <Building2 className="h-5 w-5" />,
  SUARL: <User className="h-5 w-5" />,
  SA: <Building className="h-5 w-5" />,
  SCA: <Users className="h-5 w-5" />,
};

function StepIndicator({ current, onStep }: { current: Step; onStep: (s: Step) => void }) {
  const stepIndex = STEPS.findIndex(s => s.key === current);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => { if (i < stepIndex) onStep(s.key); }}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                i === stepIndex ? 'text-primary' : i < stepIndex ? 'text-primary/70 cursor-pointer hover:text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                i === stepIndex ? 'border-primary bg-primary text-primary-foreground' :
                i < stepIndex ? 'border-primary/50 bg-primary/10 text-primary' :
                'border-muted-foreground/30'
              }`}>
                {i < stepIndex ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 flex-1 h-px ${
                i < stepIndex ? 'bg-primary/50' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeStep({
  value, onChange,
}: {
  value: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Choose your company type</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select the legal structure that best fits your business. This determines your tax obligations, liability, and governance requirements.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Object.entries(ENTITY_INFO).map(([key, info]) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`relative rounded-xl border p-5 text-left transition-all ${
                selected
                  ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              {selected && (
                <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {TYPE_ICONS[key]}
                </span>
                <div>
                  <div className="font-semibold">{info.label}</div>
                  <div className="text-xs text-muted-foreground">{info.description}</div>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Min. capital</span>
                  <span className="font-medium">{info.minCapital}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shareholders</span>
                  <span className="font-medium">{info.minShareholders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Liability</span>
                  <span className="font-medium">{info.liability}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {info.idealFor}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoStep({
  data, onChange,
}: {
  data: CompanyInfoData;
  onChange: (d: CompanyInfoData) => void;
}) {
  const update = (patch: Partial<CompanyInfoData>) => onChange({ ...data, ...patch });
  const updateAddress = (patch: Partial<CompanyInfoData['address']>) =>
    onChange({ ...data, address: { ...data.address, ...patch } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Company details & tax regime</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about your company and choose your tax preferences.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="wiz-name">Company name *</FieldLabel>
          <Input
            id="wiz-name"
            value={data.name}
            onChange={e => update({ name: e.target.value })}
            placeholder="My Company SARL"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="wiz-taxId">Tax ID (Matricule Fiscal)</FieldLabel>
          <Input
            id="wiz-taxId"
            value={data.taxId}
            onChange={e => update({ taxId: e.target.value })}
            placeholder="1234567X/A/M/000"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="wiz-email">Email</FieldLabel>
          <Input
            id="wiz-email"
            type="email"
            value={data.email}
            onChange={e => update({ email: e.target.value })}
            placeholder="contact@company.tn"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="wiz-phone">Phone</FieldLabel>
          <Input
            id="wiz-phone"
            value={data.phone}
            onChange={e => update({ phone: e.target.value })}
            placeholder="+216 XX XXX XXX"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="wiz-website">Website</FieldLabel>
          <Input
            id="wiz-website"
            value={data.website}
            onChange={e => update({ website: e.target.value })}
            placeholder="https://company.tn"
          />
        </Field>
      </div>

      <Separator />

      <div className="grid gap-4 sm:grid-cols-2">
        <h3 className="text-sm font-medium sm:col-span-2 text-muted-foreground uppercase tracking-wider">Address</h3>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="wiz-addr1">Street</FieldLabel>
          <Input
            id="wiz-addr1"
            value={data.address.line1}
            onChange={e => updateAddress({ line1: e.target.value })}
            placeholder="Avenue de la Liberté"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wiz-city">City</FieldLabel>
          <Input
            id="wiz-city"
            value={data.address.city}
            onChange={e => updateAddress({ city: e.target.value })}
            placeholder="Tunis"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wiz-state">Governorate</FieldLabel>
          <Input
            id="wiz-state"
            value={data.address.state}
            onChange={e => updateAddress({ state: e.target.value })}
            placeholder="Tunis"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wiz-zip">Postal code</FieldLabel>
          <Input
            id="wiz-zip"
            value={data.address.postalCode}
            onChange={e => updateAddress({ postalCode: e.target.value })}
            placeholder="1000"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="wiz-country">Country</FieldLabel>
          <Input
            id="wiz-country"
            value={data.address.country}
            onChange={e => updateAddress({ country: e.target.value })}
            placeholder="Tunisia"
          />
        </Field>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Tax Regime</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Tax regime</FieldLabel>
            <Select value={data.taxRegime} onValueChange={v => update({ taxRegime: v as 'REEL' | 'FORFAIT' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REEL">
                  <div className="flex flex-col">
                    <span>Réel (Normal Regime)</span>
                    <span className="text-xs text-muted-foreground">Standard CIT with full deduction rights</span>
                  </div>
                </SelectItem>
                <SelectItem value="FORFAIT">
                  <div className="flex flex-col">
                    <span>Forfait (Simplified)</span>
                    <span className="text-xs text-muted-foreground">Flat-rate regime for small businesses</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>VAT regime</FieldLabel>
            <Select value={data.vatRegime} onValueChange={v => update({ vatRegime: v as 'MENSUEL' | 'TRIMESTRIEL' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MENSUEL">Monthly declaration</SelectItem>
                <SelectItem value="TRIMESTRIEL">Quarterly declaration</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    </div>
  );
}

function CapitalStep({
  data, onChange,
}: {
  data: CapitalData;
  onChange: (d: CapitalData) => void;
}) {
  const update = (patch: Partial<CapitalData>) => onChange({ ...data, ...patch });

  const addShareholder = () => {
    onChange({
      ...data,
      shareholders: [...data.shareholders, { name: '', shares: 1, role: '' }],
    });
  };

  const updateShareholder = (i: number, patch: Partial<CapitalData['shareholders'][0]>) => {
    const updated = [...data.shareholders];
    updated[i] = { name: '', shares: 0, role: '', ...updated[i], ...patch };
    onChange({ ...data, shareholders: updated });
  };

  const removeShareholder = (i: number) => {
    onChange({ ...data, shareholders: data.shareholders.filter((_, idx) => idx !== i) });
  };

  const totalShares = data.shareholders.reduce((sum, s) => sum + (s.shares || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Capital structure</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Define your share capital and initial shareholders.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="wiz-capital">Share capital (TND)</FieldLabel>
          <Input
            id="wiz-capital"
            type="number"
            min={1000}
            value={data.capitalAmount || ''}
            onChange={e => update({ capitalAmount: Number(e.target.value) || 0 })}
            placeholder="10000"
          />
          <FieldDescription>Minimum 1,000 TND for SARL/SUARL</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="wiz-shares">Number of shares</FieldLabel>
          <Input
            id="wiz-shares"
            type="number"
            min={1}
            value={data.numberOfShares || ''}
            onChange={e => update({ numberOfShares: Number(e.target.value) || 0 })}
            placeholder="100"
          />
          <FieldDescription>
            Share value: {data.numberOfShares > 0 && data.capitalAmount > 0
              ? `${(data.capitalAmount / data.numberOfShares).toFixed(3)} TND/share`
              : '—'}
          </FieldDescription>
        </Field>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Shareholders ({totalShares} / {data.numberOfShares} shares)
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addShareholder}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>

        {data.shareholders.length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No shareholders yet. Add at least one shareholder to continue.
          </p>
        )}

        {data.shareholders.map((sh, i) => (
          <div key={i} className="flex items-end gap-3 p-3 rounded-lg border">
            <Field className="flex-1">
              <FieldLabel className="text-xs">Name</FieldLabel>
              <Input
                value={sh.name}
                onChange={e => updateShareholder(i, { name: e.target.value })}
                placeholder="Shareholder name"
              />
            </Field>
            <Field className="w-24">
              <FieldLabel className="text-xs">Shares</FieldLabel>
              <Input
                type="number"
                min={1}
                value={sh.shares || ''}
                onChange={e => updateShareholder(i, { shares: Number(e.target.value) || 0 })}
                placeholder="1"
              />
            </Field>
            <Field className="flex-1">
              <FieldLabel className="text-xs">Role</FieldLabel>
              <Input
                value={sh.role || ''}
                onChange={e => updateShareholder(i, { role: e.target.value })}
                placeholder="e.g. Gérant"
              />
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mb-1 shrink-0 text-destructive"
              onClick={() => removeShareholder(i)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {totalShares !== data.numberOfShares && data.shareholders.length > 0 && (
          <p className="text-xs text-amber-600">
            Total allocated shares ({totalShares}) {'!='} total shares ({data.numberOfShares}). Adjust amounts.
          </p>
        )}
      </div>
    </div>
  );
}

function ReviewStep({
  data,
}: {
  data: WizardData;
}) {
  const entity = ENTITY_INFO[data.companyType];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Review your company</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Verify all information before creating your company.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {TYPE_ICONS[data.companyType]}
            {data.info.name || 'Unnamed Company'}
            {entity && <Badge variant="outline">{entity.label}</Badge>}
          </CardTitle>
          <CardDescription>
            {entity?.description} — {entity?.idealFor}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-muted-foreground">Tax ID</span>
              <p className="font-medium">{data.info.taxId || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium">{data.info.email || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone</span>
              <p className="font-medium">{data.info.phone || '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tax regime</span>
              <p className="font-medium">{data.info.taxRegime === 'REEL' ? 'Réel' : 'Forfait'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">VAT</span>
              <p className="font-medium">{data.info.vatRegime === 'MENSUEL' ? 'Monthly' : 'Quarterly'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Capital</span>
              <p className="font-medium">{data.capital.capitalAmount.toLocaleString()} TND</p>
            </div>
          </div>

          <Separator />

          <div>
            <span className="text-muted-foreground">Address</span>
            <p className="font-medium mt-0.5">
              {[data.info.address.line1, data.info.address.city, data.info.address.state, data.info.address.country]
                .filter(Boolean).join(', ') || '—'}
            </p>
          </div>

          <Separator />

          <div>
            <span className="text-muted-foreground">
              Shareholders ({data.capital.shareholders.length})
            </span>
            <div className="mt-1 space-y-1">
              {data.capital.shareholders.map((sh, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="font-medium">{sh.name}{sh.role ? ` (${sh.role})` : ''}</span>
                  <span>{sh.shares} shares ({((sh.shares / data.capital.numberOfShares) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CompanyFormationWizard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>('type');

  const [companyType, setCompanyType] = useState<string | null>(null);
  const [info, setInfo] = useState<CompanyInfoData>({
    name: '',
    email: '',
    taxId: '',
    phone: '',
    website: '',
    address: { line1: '', line2: '', city: '', state: '', postalCode: '', country: '' },
    taxRegime: 'REEL',
    vatRegime: 'MENSUEL',
  });
  const [capital, setCapital] = useState<CapitalData>({
    capitalAmount: 10000,
    numberOfShares: 100,
    shareholders: [{ name: '', shares: 100, role: 'Gérant' }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canProceed = (): boolean => {
    setErrors({});
    if (step === 'type' && !companyType) {
      setErrors({ type: 'Select a company type to continue' });
      return false;
    }
    if (step === 'info') {
      if (!info.name || info.name.length < 2) {
        setErrors({ name: 'Company name must be at least 2 characters' });
        return false;
      }
    }
    if (step === 'capital') {
      if (capital.capitalAmount < 1000) {
        setErrors({ capital: 'Minimum capital is 1,000 TND' });
        return false;
      }
      const totalShares = capital.shareholders.reduce((s, sh) => s + (sh.shares || 0), 0);
      if (totalShares !== capital.numberOfShares) {
        setErrors({ shares: `Share allocation (${totalShares}) must equal total shares (${capital.numberOfShares})` });
        return false;
      }
      if (capital.shareholders.some(sh => !sh.name)) {
        setErrors({ shareholders: 'All shareholders must have a name' });
        return false;
      }
    }
    return true;
  };

  const next = () => {
    if (!canProceed()) return;
    const idx = STEPS.findIndex(s => s.key === step);
    const nextStep = STEPS[idx + 1];
    if (nextStep) setStep(nextStep.key);
  };

  const back = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    const prevStep = STEPS[idx - 1];
    if (prevStep) setStep(prevStep.key);
  };

  const handleCreate = () => {
    if (!companyType) return;
    const totalShares = capital.shareholders.reduce((s, sh) => s + (sh.shares || 0), 0);
    if (totalShares !== capital.numberOfShares) {
      setErrors({ shares: 'Share allocation must equal total shares' });
      return;
    }

    startTransition(async () => {
      try {
        const res = await createCompany({
          name: info.name,
          companyType: companyType as any,
          email: info.email,
          taxId: info.taxId,
          phone: info.phone,
          website: info.website,
          address: info.address.line1 ? info.address : undefined,
          metadata: {
            formationWizard: {
              taxRegime: info.taxRegime,
              vatRegime: info.vatRegime,
              capitalAmount: capital.capitalAmount,
              numberOfShares: capital.numberOfShares,
              shareholders: capital.shareholders,
            },
          },
        } as any);

        if (!res.success) {
          toast.error(res.error || 'Failed to create company');
          return;
        }

        toast.success('Company created successfully!');
        router.push('/');
        router.refresh();
      } catch {
        toast.error('An unexpected error occurred');
      }
    });
  };

  const stepError = errors[Object.keys(errors)[0] || ''];

  return (
    <div className="space-y-6">
      <StepIndicator current={step} onStep={s => {
        const targetIdx = STEPS.findIndex(x => x.key === s);
        const currentIdx = STEPS.findIndex(x => x.key === step);
        if (targetIdx >= 0 && targetIdx < currentIdx) setStep(s);
      }} />

      {step === 'type' && <TypeStep value={companyType} onChange={v => { setCompanyType(v); setErrors({}); }} />}
      {step === 'info' && <InfoStep data={info} onChange={d => { setInfo(d); setErrors({}); }} />}
      {step === 'capital' && <CapitalStep data={capital} onChange={d => { setCapital(d); setErrors({}); }} />}
      {step === 'review' && companyType && (
        <ReviewStep data={{ companyType: companyType as WizardData['companyType'], info, capital }} />
      )}

      {stepError && (
        <p className="text-sm text-destructive text-center">{stepError}</p>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={step === 'type'}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        {step !== 'review' ? (
          <Button type="button" onClick={next}>
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" onClick={handleCreate} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isPending ? 'Creating...' : 'Create Company'}
          </Button>
        )}
      </div>
    </div>
  );
}
