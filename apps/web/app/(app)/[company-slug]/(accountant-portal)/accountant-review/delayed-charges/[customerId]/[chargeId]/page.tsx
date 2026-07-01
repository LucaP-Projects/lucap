import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DocumentPreview } from '@/components/accountant-review/document-preview';
import QualificationForm from '@/components/accountant-review/qualification-form';
import { getDelayedChargeForAccountant } from '../../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string; chargeId: string }>;
}

export default async function DelayedChargeQualificationPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId, chargeId } = await params;
  const { delayedCharge, customer } = await getDelayedChargeForAccountant(chargeId, customerId);

  if (!delayedCharge || !customer) notFound();

  let existingQualification: {
    status: 'VALIDATED' | 'REJECTED';
    fournisseur: string;
    numeroFacture: string;
    montantHT: number;
    tauxTVA: number;
    fodec: boolean;
    droitTimbre: number;
  } | null = null;

  if (delayedCharge.notes) {
    try {
      const parsed = JSON.parse(delayedCharge.notes);
      if (parsed.accountantValidation) {
        existingQualification = parsed.accountantValidation;
      }
    } catch {
      // notes is plain text, not JSON — no existing qualification
    }
  }

  const attachment = delayedCharge.attachments[0]?.file ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b bg-white px-4 py-2">
        <Link
          href={`/${companySlug}/accountant-review/delayed-charges/${customerId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {customer.displayName}
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden bg-[#f0f2f5]">
          <div className="flex shrink-0 items-center justify-between bg-[#1a2540] px-6 py-3">
            <span className="text-xs font-bold tracking-[0.15em] text-white uppercase">
              Pièce Justificative Téléversée
            </span>
            <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
              {attachment ? attachment.filename : `DELAYED_CHARGE_${delayedCharge.number}.PDF`}
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-10">
            <DocumentPreview
              documentLabel="Delayed Charge"
              companyName={delayedCharge.companyName}
              number={delayedCharge.number}
              createdAt={delayedCharge.createdAt}
              customerDisplayName={customer.displayName}
              customerCompanyName={customer.companyName}
              items={delayedCharge.items}
              amount={delayedCharge.amount}
              taxRate={delayedCharge.taxRate}
              taxAmount={delayedCharge.taxAmount}
            />
          </div>
        </div>

        <div className="flex w-[480px] shrink-0 flex-col overflow-auto border-l bg-white">
          <QualificationForm
            documentType="delayedCharge"
            documentId={delayedCharge.id}
            documentNumber={delayedCharge.number}
            documentAmount={delayedCharge.amount}
            documentTaxRate={delayedCharge.taxRate}
            customerDisplayName={customer.displayName}
            backHref={`/${companySlug}/accountant-review/delayed-charges/${customerId}`}
            existingQualification={existingQualification}
          />
        </div>
      </div>
    </div>
  );
}
