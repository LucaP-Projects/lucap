import { formatDate } from '@/lib/utils';

export type DocumentPreviewItem = {
  id: string;
  productName: string;
  amount: number;
};

interface DocumentPreviewProps {
  documentLabel: string;
  companyName: string;
  number: string;
  createdAt: Date;
  customerDisplayName: string;
  customerCompanyName: string | null;
  items: DocumentPreviewItem[];
  amount: number;
  taxRate: number;
  taxAmount: number;
}

export function DocumentPreview({
  documentLabel,
  companyName,
  number,
  createdAt,
  customerDisplayName,
  customerCompanyName,
  items,
  amount,
  taxRate,
  taxAmount,
}: DocumentPreviewProps) {
  const totalTTC = amount + taxAmount;

  return (
    <div className="w-full max-w-[340px] rounded-sm bg-white px-9 py-8 shadow-lg">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-800">
            {companyName}
          </p>
          <p className="mt-0.5 text-[10px] text-gray-400">M.F. : ···</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-slate-600">{number}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {documentLabel} · Date: {formatDate(createdAt)}
          </p>
        </div>
      </div>

      {/* Recipient */}
      <div className="mb-5">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
          Destinataire :
        </p>
        <p className="text-[11px] font-semibold text-slate-700">{customerDisplayName}</p>
        {customerCompanyName && (
          <p className="text-[10px] text-gray-500">{customerCompanyName}</p>
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
          {items.length === 0 ? (
            <tr>
              <td colSpan={2} className="py-3 text-center text-gray-300">
                —
              </td>
            </tr>
          ) : (
            items.map((item) => (
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
          <span>{amount.toFixed(3)} TND</span>
        </div>
        {taxRate > 0 && (
          <div className="flex justify-between">
            <span>TVA ({taxRate}%) :</span>
            <span>{taxAmount.toFixed(3)} TND</span>
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
