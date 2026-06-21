const colorPalette = {
  blue: {
    main: '#3B82F6',
    light: '#EFF6FF'
  },
  green: {
    main: '#10B981',
    light: '#ECFDF5'
  },
  red: {
    main: '#EF4444',
    light: '#FEE2E2'
  },
  purple: {
    main: '#8B5CF6',
    light: '#EDE9FE'
  },
  yellow: {
    main: '#F59E0B',
    light: '#FEF3C7'
  },
  gray: {
    main: '#6B7280',
    light: '#F3F4F6'
  }
};

function getColorFromPalette(colorName: string) {
  const lowerColorName = (colorName || '').toLowerCase();
  const colorSet = colorPalette[lowerColorName as keyof typeof colorPalette];

  return {
    main: colorSet?.main || '#3B82F6',
    light: colorSet?.light || '#EFF6FF'
  };
}

export function mapInvoiceDataForPdf(document: any, paper?: string) {
  const documentType = paper || 'invoice';

  const customerAddress = document.customer?.billingAddress || {};

  const items = document.items.map((item: any) => ({
    productName: item.productName,
    description: item.description,
    quantity: item.quantity,
    rate: item.rate,
    sku: item.sku || item.Item?.sku || '',
    taxable: item.taxable
  }));

  const company = {
    name: document.Company?.name || '',
    email: document.Company?.email || '',
    address: {
      line1: document.Company?.address?.street || '',
      city: document.Company?.address?.city || '',
      state: document.Company?.address?.state || '',
      postalCode: document.Company?.address?.postalCode || '',
      country: document.Company?.address?.country || ''
    }
  };

  const settings = document.paymentEventSnapshot?.customPdfSettings || {
    sku: false,
    note: false,
    rate: true,
    amount: true,
    shipTo: true,
    dueDate: true,
    quantity: true,
    invoiceNo: true,
    description: true,
    invoiceDate: true,
    tableNumber: true,
    productService: true
  };

  const colorName = document.paymentEventSnapshot?.color || 'blue';
  const colors = getColorFromPalette(colorName);

  // Convert document type to paperType format for template selection
  let paperType = documentType;
  console.log('documentType', documentType);
  // Map specific document types to their template paperType values
  if (documentType === 'credit') paperType = 'delayed credit';
  if (documentType === 'charge') paperType = 'delayed charge';
  if (documentType === 'receipt') paperType = 'sales receipt';
  if (documentType === 'refund') paperType = 'refund receipt';
  if (documentType === 'creditMemo') paperType = 'credit memo';

  return {
    formData: {
      invoiceNumber: document.number,
      dueDate: document.dueDate ? new Date(document.dueDate) : new Date(),
      items: items,
      customerAddress: {
        line1: customerAddress.line1 || '',
        city: customerAddress.city || '',
        state: customerAddress.state || '',
        postalCode: customerAddress.postalCode || ''
      },
      emailCustomer:
        document.emailCustomer || document.customer?.primaryEmail || '',
      discountType: document.discountType || 'NONE',
      discountValue: document.discountValue || 0
    },
    company: company,
    color: colors.main,
    colorLight: colors.light,
    settings: settings,
    note: document.notes || '',
    taxRate: document.taxRate || 0,
    subtotal: calculateSubtotal(document.items),
    discountAmount: document.discountAmount || 0,
    total: document.amount || 0,
    paperType: paperType
  };
}

function calculateSubtotal(items: any[]) {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + item.quantity * item.rate, 0);
}
