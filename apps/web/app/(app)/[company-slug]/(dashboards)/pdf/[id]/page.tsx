'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InvoiceTemplateData } from '@/pdf/templates/invoice/types';
import { mapInvoiceDataForPdf } from '@/utils/invoicePdfMapper';
import { getInvoiceById } from './actions';
interface PageProps {
  params: Promise<{ id: string; lng: string }>;
}

export default function InvoicePdfTestPage({ params }: PageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceTemplateData | null>(
    null
  );
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Fetch invoice data using server action when component mounts
  useEffect(() => {
    async function fetchInvoiceData() {
      try {
        setIsLoading(true);
        const resolvedParams = await params;
        setInvoiceId(resolvedParams.id);

        const result = await getInvoiceById(resolvedParams.id);

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Failed to fetch invoice data');
        }

        setInvoiceData(result.data);
      } catch (error) {
        toast.error('Error Fetching Invoice', {
          description: String(error),
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoiceData();
  }, [params]);

  async function generatePdf() {
    try {
      setIsPdfLoading(true);
      if (!invoiceId || !invoiceData) return;

      // Transform invoice data for the PDF generator
      const pdfData = mapInvoiceDataForPdf(invoiceData);

      // Call API endpoint to generate PDF
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pdfData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`PDF generation failed: ${error}`);
      }

      // Handle successful PDF generation
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Open PDF in new window
      window.open(url);

      toast.success('PDF Generated', {
        description: 'Invoice PDF was successfully generated'
      });
    } catch (error) {
      toast.error('Error', {
        description: String(error)
      });
    } finally {
      setIsPdfLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="ml-2">Loading invoice data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoice Data</h1>
        <Button
          onClick={generatePdf}
          disabled={isPdfLoading || !invoiceData}
          className="w-full md:w-auto"
        >
          {isPdfLoading ? 'Generating PDF...' : 'Generate PDF'}
        </Button>
      </div>

      {invoiceData ? (
        <div className="mt-4">
          <pre className="max-h-[600px] overflow-auto rounded bg-slate-100 p-4 text-sm">
            {JSON.stringify(invoiceData, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="rounded border border-slate-200 p-6 text-center">
          <p className="text-muted-foreground">
            No invoice data available. Please check the invoice ID.
          </p>
        </div>
      )}
    </div>
  );
}
