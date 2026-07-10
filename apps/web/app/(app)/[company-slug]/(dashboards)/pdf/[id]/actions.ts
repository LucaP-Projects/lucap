'use server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');
  return session;
}

export async function getInvoiceById(id: string) {
  try {
    await requireAuth();
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
        creditMemo: true
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type InvoiceResponse = ReturnType<typeof getInvoiceById>;

export async function getDelayedCreditById(
  id: string
) {
  try {
    await requireAuth();
    const delayedCredit = await prisma.delayedCredit.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type DelayedCreditResponse = ReturnType<typeof getDelayedCreditById>;

export async function getDelayedChargesById(
  id: string
) {
  try {
    await requireAuth();
    const delayedCharges = await prisma.delayedCharge.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type DelayedChargesResponse = ReturnType<typeof getDelayedChargesById>;

export async function getEstimateById(id: string) {
  try {
    await requireAuth();
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type EstimateResponse = ReturnType<typeof getEstimateById>;

export async function getSalesReceiptById(
  id: string
) {
  try {
    await requireAuth();
    const salesReceipt = await prisma.salesReceipt.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type SalesReceiptResponse = ReturnType<typeof getSalesReceiptById>;

export async function getRefundReceiptById(
  id: string
) {
  try {
    await requireAuth();
    const refundReceipt = await prisma.refundReceipt.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type RefundReceiptResponse = ReturnType<typeof getRefundReceiptById>;

export async function getCreditMemoById(
  id: string
) {
  try {
    await requireAuth();
    const creditMemo = await prisma.creditMemo.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        },
        company: true,
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
      console.log('Failed to log error details', logError instanceof Error ? logError.message : String(logError));
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}
export type CreditMemoResponse = ReturnType<typeof getCreditMemoById>;
