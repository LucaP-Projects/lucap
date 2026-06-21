interface Invoice {
  id: string;
  amount: number;
  dueDate: Date;
  payments: { amount: number }[];
}

export function calculateRemainingAmount(invoice: Invoice): number {
  const paidAmount = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  return invoice.amount - paidAmount;
}

export function distributePayment(amount: number, invoices: Invoice[]) {
  const sortedInvoices = [...invoices].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  let remainingPayment = amount;
  const payments: { invoiceId: string; amount: number }[] = [];

  for (const invoice of sortedInvoices) {
    const remainingInvoiceAmount = calculateRemainingAmount(invoice);

    if (remainingPayment <= 0) break;

    const paymentForInvoice = Math.min(
      remainingInvoiceAmount,
      remainingPayment
    );
    if (paymentForInvoice > 0) {
      payments.push({
        invoiceId: invoice.id,
        amount: Number(paymentForInvoice.toFixed(2))
      });
      remainingPayment = Number(
        (remainingPayment - paymentForInvoice).toFixed(2)
      );
    }
  }

  return payments;
}

export function calculateMaxPaymentAmount(invoices: Invoice[]): number {
  return Number(
    invoices
      .reduce((sum, invoice) => sum + calculateRemainingAmount(invoice), 0)
      .toFixed(2)
  );
}
