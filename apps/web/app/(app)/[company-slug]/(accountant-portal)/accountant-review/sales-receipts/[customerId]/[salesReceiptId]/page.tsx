import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DocumentPreview } from '@/components/accountant-review/document-preview';
import QualificationForm from '@/components/accountant-review/qualification-form';
import { getSalesReceiptForAccountant } from '../../actions';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string; salesReceiptId: string }>;
}

export default async function SalesReceiptQualificationPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId, salesReceiptId } = await params;
  const { salesReceipt, customer } = await getSalesReceiptForAccountant(
    salesReceiptId,
    customerId
  );

  if (!salesReceipt || !customer) notFound();

  let existingQualification: {
    status: 'VALIDATED' | 'REJECTED';
    fournisseur: string;
    numeroFacture: string;
    montantHT: number;
    tauxTVA: number;
    fodec: boolean;
    droitTimbre: number;
  } | null = null;

  if (salesReceipt.notes) {
    try {
      const parsed = JSON.parse(salesReceipt.notes);
      if (parsed.accountantValidation) {
        existingQualification = parsed.accountantValidation;
      }
    } catch {
      // notes is plain text, not JSON — no existing qualification
    }
  }

  const attachment = salesReceipt.attachments[0]?.file ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b bg-white px-4 py-2">
        <Link
          href={`/${companySlug}/accountant-review/sales-receipts/${customerId}`}
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
              {attachment ? attachment.filename : `SALES_RECEIPT_${salesReceipt.number}.PDF`}
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-10">
            <DocumentPreview
              documentLabel="Sales Receipt"
              companyName={salesReceipt.companyName}
              number={salesReceipt.number}
              createdAt={salesReceipt.createdAt}
              customerDisplayName={customer.displayName}
              customerCompanyName={customer.companyName}
              items={salesReceipt.items}
              amount={salesReceipt.amount}
              taxRate={salesReceipt.taxRate}
              taxAmount={salesReceipt.taxAmount}
            />
          </div>
        </div>

        <div className="flex w-[480px] shrink-0 flex-col overflow-auto border-l bg-white">
          <QualificationForm
            documentType="salesReceipt"
            documentId={salesReceipt.id}
            documentNumber={salesReceipt.number}
            documentAmount={salesReceipt.amount}
            documentTaxRate={salesReceipt.taxRate}
            customerDisplayName={customer.displayName}
            backHref={`/${companySlug}/accountant-review/sales-receipts/${customerId}`}
            existingQualification={existingQualification}
          />
        </div>
      </div>
    </div>
  );
}
