interface PriceCalculationParams {
  items: Array<{ quantity: number; rate: number }>;
  taxRate: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  discountPosition: 'BEFORE_TAX' | 'AFTER_TAX';
}

export function usePriceCalculation({
  items,
  taxRate,
  discountType,
  discountValue,
  discountPosition
}: PriceCalculationParams) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );

  const discountAmount =
    discountType === 'PERCENTAGE'
      ? subtotal * (Math.min(discountValue, 100) / 100)
      : Math.min(discountValue, subtotal);

  const taxableAmount =
    discountPosition === 'BEFORE_TAX' ? subtotal - discountAmount : subtotal;

  const taxAmount = taxableAmount * (taxRate / 100);

  const total =
    discountPosition === 'BEFORE_TAX'
      ? subtotal - discountAmount + taxAmount
      : subtotal + taxAmount - discountAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2))
  };
}
