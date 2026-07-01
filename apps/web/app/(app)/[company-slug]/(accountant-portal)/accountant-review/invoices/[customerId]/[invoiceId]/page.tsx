import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getInvoiceForAccountant, InvoiceForAccountant, CustomerForAccountant } from '../../actions';
import QualificationForm from './qualification-form';

interface PageProps {
  params: Promise<{ 'company-slug': string; customerId: string; invoiceId: string }>;
}

export default async function InvoiceQualificationPage({ params }: PageProps) {
  const { 'company-slug': companySlug, customerId, invoiceId } = await params;
  const { invoice, customer } = await getInvoiceForAccountant(invoiceId, customerId);

  if (!invoice || !customer) notFound();

  // Extract existing accountant qualification if previously saved
  let existingQualification: {
    status: 'VALIDATED' | 'REJECTED';
    fournisseur: string;
    numeroFacture: string;
    montantHT: number;
    tauxTVA: number;
    fodec: boolean;
    droitTimbre: number;
  } | null = null;

  if (invoice.notes) {
    try {
      const parsed = JSON.parse(invoice.notes);
      if (parsed.accountantValidation) {
        existingQualification = parsed.accountantValidation;
      }
    } catch {
      // notes is plain text, not JSON — no existing qualification
    }
  }

  const attachment = invoice.attachments[0]?.file ?? null;

  return (
    <div className="flex h-full flex-col">
      {/* Breadcrumb */}
      <div className="shrink-0 border-b bg-white px-4 py-2">
        <Link
          href={`/${companySlug}/accountant-review/invoices/${customerId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {customer.displayName}
        </Link>
      </div>

      {/* Split screen */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left — document preview */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#f0f2f5]">
          <div className="flex shrink-0 items-center justify-between bg-[#1a2540] px-6 py-3">
            <span className="text-xs font-bold tracking-[0.15em] text-white uppercase">
              Pièce Justificative Téléversée
            </span>
            <span className="text-xs font-medium tracking-wider text-slate-400 uppercase">
              {attachment
                ? attachment.filename
                : `INVOICE_${invoice.number}.PDF`}
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-10">
            <InvoiceDocument invoice={invoice} customer={customer} />
          </div>
        </div>

        {/* Right — qualification form */}
        <div className="flex w-[480px] shrink-0 flex-col overflow-auto border-l bg-white">
          <QualificationForm
            invoiceId={invoice.id}
            invoiceNumber={invoice.number}
            invoiceAmount={invoice.amount}
            invoiceTaxRate={invoice.taxRate}
            customerDisplayName={customer.displayName}
            companySlug={companySlug}
            customerId={customerId}
            existingQualification={existingQualification}
          />
        </div>
      </div>
    </div>
  );
}

function InvoiceDocument({
  invoice,
  customer,
}: {
  invoice: InvoiceForAccountant;
  customer: CustomerForAccountant;
}) {
  const totalTTC = invoice.amount + invoice.taxAmount;

  return (
    <div className="w-full max-w-[340px] rounded-sm bg-white px-9 py-8 shadow-lg">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
            {invoice.companyName}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">M.F. : ···</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-slate-600">{invoice.number}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            Date: {formatDate(invoice.createdAt)}
          </p>
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-5">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
          Destinataire :
        </p>
        <p className="text-[11px] font-semibold text-slate-700">{customer.displayName}</p>
        {customer.companyName && (
          <p className="text-[10px] text-gray-500">{customer.companyName}</p>
        )}
      </div>

      {/* Items table */}
      <table className="mb-5 w-full border-t border-gray-200 text-[10px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-1.5 text-left font-bold uppercase tracking-wider text-gray-400">
              Descr.
            </th>
            <th className="py-1.5 text-right font-bold uppercase tracking-wider text-gray-400">
              Montant HT
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-3 text-center text-gray-300">
                —
              </td>
            </tr>
          ) : (
            invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-2 pr-3 text-gray-700">{item.productName}</td>
                <td className="py-2 text-right text-gray-700">
                  {item.amount.toFixed(3)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="space-y-1 text-right text-[10px] text-gray-500">
        <div className="flex justify-between">
          <span>Montant HT :</span>
          <span>{invoice.amount.toFixed(3)} TND</span>
        </div>
        {invoice.taxRate > 0 && (
          <div className="flex justify-between">
            <span>TVA ({invoice.taxRate}%) :</span>
            <span>{invoice.taxAmount.toFixed(3)} TND</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-300 pt-1.5 text-[11px] font-bold text-gray-900">
          <span>Total TTC :</span>
          <span>{totalTTC.toFixed(3)} TND</span>
        </div>
      </div>
    </div>
  );
}
