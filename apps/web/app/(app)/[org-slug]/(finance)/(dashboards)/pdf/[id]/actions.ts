'use server';
import { prisma } from '@/lib/prisma';

type InvoiceResponse = {
  success: boolean;
  data?: any;
  error?: string;
};

type DelayedCreditResponse = InvoiceResponse;
type DelayedChargesResponse = InvoiceResponse;
type EstimateResponse = InvoiceResponse;
type SalesReceiptResponse = InvoiceResponse;
type RefundReceiptResponse = InvoiceResponse;
type CreditMemoResponse = InvoiceResponse;

export async function getInvoiceById(id: string): Promise<InvoiceResponse> {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,
        payments: true,
        attachments: {
          include: {
            file: true
          }
        },
        estimate: true,
        customerPaymentEvent: {
          include: {
            paymentEvent: true,
            version: true
          }
        },
        CreditMemo: true
      }
    });

    if (!invoice) {
      return {
        success: false,
        error: `Invoice with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: invoice
    };
  } catch (error) {
    try {
      console.error(
        'Error fetching invoice:',
        error instanceof Error ? error.message : String(error)
      );
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getDelayedCreditById(
  id: string
): Promise<DelayedCreditResponse> {
  try {
    const delayedCredit = await db.delayedCredit.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,
        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    if (!delayedCredit) {
      return {
        success: false,
        error: `Delayed Credit with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: delayedCredit
    };
  } catch (error) {
    try {
      console.error(
        'Error fetching delayed credit:',
        error instanceof Error ? error.message : String(error)
      );
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getDelayedChargesById(
  id: string
): Promise<DelayedChargesResponse> {
  try {
    const delayedCharges = await db.delayedCharge.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,
        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    if (!delayedCharges) {
      return {
        success: false,
        error: `Delayed Charges with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: delayedCharges
    };
  } catch (error) {
    try {
      console.error(
        'Error fetching delayed charges:',
        error instanceof Error ? error.message : String(error)
      );

      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getEstimateById(id: string): Promise<EstimateResponse> {
  try {
    const estimate = await db.estimate.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,
        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    if (!estimate) {
      return {
        success: false,
        error: `Estimate with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: estimate
    };
  } catch (error) {
    // Safe error logging
    try {
      console.error(
        'Error fetching estimate:',
        error instanceof Error ? error.message : String(error)
      );

      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getSalesReceiptById(
  id: string
): Promise<SalesReceiptResponse> {
  try {
    const salesReceipt = await db.salesReceipt.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,

        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    if (!salesReceipt) {
      return {
        success: false,
        error: `Sales Receipt with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: salesReceipt
    };
  } catch (error) {
    // Safe error logging
    try {
      console.error(
        'Error fetching sales receipt:',
        error instanceof Error ? error.message : String(error)
      );

      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getRefundReceiptById(
  id: string
): Promise<RefundReceiptResponse> {
  try {
    const refundReceipt = await db.refundReceipt.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,
        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    if (!refundReceipt) {
      return {
        success: false,
        error: `Refund Receipt with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: refundReceipt
    };
  } catch (error) {
    // Safe error logging
    try {
      console.error(
        'Error fetching refund receipt:',
        error instanceof Error ? error.message : String(error)
      );

      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function getCreditMemoById(
  id: string
): Promise<CreditMemoResponse> {
  try {
    const creditMemo = await db.creditMemo.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            Item: true
          }
        },
        Company: true,
        tax: true,
        attachments: {
          include: {
            file: true
          }
        }
      }
    });

    if (!creditMemo) {
      return {
        success: false,
        error: `Credit Memo with ID ${id} not found`
      };
    }
    return {
      success: true,
      data: creditMemo
    };
  } catch (error) {
    // Safe error logging
    try {
      console.error(
        'Error fetching credit memo:',
        error instanceof Error ? error.message : String(error)
      );

      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
    } catch (logError) {
      console.log('Failed to log error details');
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
