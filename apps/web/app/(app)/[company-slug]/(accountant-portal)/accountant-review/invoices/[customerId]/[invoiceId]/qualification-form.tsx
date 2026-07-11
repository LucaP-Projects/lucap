'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { qualifyInvoice } from '../../actions';

const TVA_OPTIONS = [
  { label: '0%', value: 0 },
  { label: '7%', value: 7 },
  { label: '13%', value: 13 },
  { label: '19%', value: 19 },
];

type ExistingQualification = {
  status: 'VALIDATED' | 'REJECTED';
  fournisseur: string;
  numeroFacture: string;
  montantHT: number;
  tauxTVA: number;
  fodec: boolean;
  droitTimbre: number;
};

interface Props {
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceTaxRate: number;
  customerDisplayName: string;
  companySlug: string;
  customerId: string;
  existingQualification: ExistingQualification | null;
}

const labelClass =
  'mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400';
const inputClass =
  'w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:border-slate-400 focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:text-gray-400';

export default function QualificationForm({
  invoiceId,
  invoiceNumber,
  invoiceAmount,
  invoiceTaxRate,
  customerDisplayName,
  companySlug,
  customerId,
  existingQualification,
}: Props) {
  const router = useRouter();

  const [fournisseur, setFournisseur] = useState(
    existingQualification?.fournisseur ?? customerDisplayName
  );
  const [numeroFacture, setNumeroFacture] = useState(
    existingQualification?.numeroFacture ?? invoiceNumber
  );
  const [montantHT, setMontantHT] = useState(
    existingQualification?.montantHT ?? invoiceAmount
  );
  const [tauxTVA, setTauxTVA] = useState(
    existingQualification?.tauxTVA ?? invoiceTaxRate ?? 19
  );
  const [fodec, setFodec] = useState(existingQualification?.fodec ?? false);
  const [droitTimbre, setDroitTimbre] = useState(
    existingQualification?.droitTimbre ?? 1
  );
  const [qualificationStatus, setQualificationStatus] = useState<
    'VALIDATED' | 'REJECTED' | null
  >(existingQualification?.status ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const montantTVA = useMemo(() => (montantHT * tauxTVA) / 100, [montantHT, tauxTVA]);
  const montantFodec = useMemo(
    () => (fodec ? montantHT * 0.01 : 0),
    [montantHT, fodec]
  );
  const totalTTC = useMemo(
    () => montantHT + montantTVA + montantFodec + droitTimbre,
    [montantHT, montantTVA, montantFodec, droitTimbre]
  );

  const isLocked = !!qualificationStatus;

  const handleQualify = async (status: 'VALIDATED' | 'REJECTED') => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await qualifyInvoice(invoiceId, {
        fournisseur,
        numeroFacture,
        montantHT,
        tauxTVA,
        fodec,
        droitTimbre,
        status,
      });

      if (result.success) {
        setQualificationStatus(status);
        setTimeout(() => {
          router.push(
            `/${companySlug}/accountant-review/invoices/${customerId}`
          );
          router.refresh();
        }, 1200);
      } else {
        setError(result.error ?? 'Une erreur est survenue.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col px-7 py-6">
      <h2 className="mb-7 text-lg font-semibold text-gray-900">
        Formulaire de qualification fiscale
      </h2>

      <div className="flex-1 space-y-5">
        {/* Row 1 — Fournisseur / N° Facture */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fournisseur</label>
            <input
              type="text"
              value={fournisseur}
              onChange={(e) => setFournisseur(e.target.value)}
              disabled={isLocked}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Numéro de Facture</label>
            <input
              type="text"
              value={numeroFacture}
              onChange={(e) => setNumeroFacture(e.target.value)}
              disabled={isLocked}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 2 — Montant HT / Taux TVA */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Montant HT</label>
            <input
              type="number"
              value={montantHT}
              onChange={(e) => setMontantHT(Number(e.target.value))}
              disabled={isLocked}
              min={0}
              step="0.001"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Taux TVA</label>
            <select
              value={tauxTVA}
              onChange={(e) => setTauxTVA(Number(e.target.value))}
              disabled={isLocked}
              className={inputClass}
            >
              {TVA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3 — FODEC / Droit de Timbre */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>FODEC (1%)</label>
            <select
              value={fodec ? 'true' : 'false'}
              onChange={(e) => setFodec(e.target.value === 'true')}
              disabled={isLocked}
              className={inputClass}
            >
              <option value="false">Désactivé</option>
              <option value="true">Activé</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Droit de Timbre</label>
            <input
              type="number"
              value={droitTimbre}
              onChange={(e) => setDroitTimbre(Number(e.target.value))}
              disabled={isLocked}
              min={0}
              step="0.001"
              className={inputClass}
            />
          </div>
        </div>

        {/* Calculated totals */}
        <div className="rounded bg-gray-50 px-4 py-4">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Montant TVA :</span>
              <span className="font-medium tabular-nums">
                {montantTVA.toFixed(3)} TND
              </span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Montant Fodec :</span>
              <span className="font-medium tabular-nums">
                {montantFodec.toFixed(3)} TND
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-2">
              <span className="font-medium text-blue-900">
                Total TTC Calculé :
              </span>
              <span className="text-base font-bold tabular-nums text-blue-900">
                {totalTTC.toFixed(3)} TND
              </span>
            </div>
          </div>
        </div>

        {/* Status banner */}
        {qualificationStatus && (
          <div
            className={`rounded px-4 py-3 text-center text-sm font-semibold ${
              qualificationStatus === 'VALIDATED'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {qualificationStatus === 'VALIDATED'
              ? '✓ Facture validée et commitée avec succès'
              : '✗ Facture passée / rejetée'}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={() => handleQualify('REJECTED')}
          disabled={isSubmitting || isLocked}
          className={`rounded px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all ${
            qualificationStatus === 'REJECTED'
              ? 'bg-red-600 text-white shadow-sm'
              : 'border border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-800'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          Passer / Rejeter
        </button>
        <button
          type="button"
          onClick={() => handleQualify('VALIDATED')}
          disabled={isSubmitting || isLocked}
          className={`rounded px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-all ${
            qualificationStatus === 'VALIDATED'
              ? 'bg-green-700 text-white shadow-sm'
              : 'bg-[#1a2540] text-white hover:bg-[#243256]'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isSubmitting ? 'En cours…' : 'Valider et Committer'}
        </button>
      </div>
    </div>
  );
}
