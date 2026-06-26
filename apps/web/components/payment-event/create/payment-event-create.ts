'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionWithCompany } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentEventFormValues } from '@/validation/payment-event/subscription.schema';

export async function createOneTimePaymentEvent(data: PaymentEventFormValues) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    
    if (data.type !== 'ONE_TIME') {
      throw new Error('Invalid payment event type');
    }

    // Calculate total amount from items
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    const paymentSettings = {
      type: 'ONE_TIME' as const,
      settings: {
        amount: totalAmount, // Use calculated total
        generateInvoiceNow: data.generateInvoiceNow,
        defaultDueDate: data.dueDate?.toISOString()
      }
    };

    const paymentEvent = await prisma.$transaction(async (tx) => {
      // Create the base payment event
      const event = await tx.paymentEvent.create({
        data: {
          active: true,
          type: 'ONE_TIME',
          company: { connect: { id: session.user?.activeCompanyId } }
        }
      });

      // Create the initial version with items
      const version = await tx.paymentEventVersion.create({
        data: {
          paymentEventId: event.id,
          version: 1,
          name: data.name,
          description: data.description,
          type: 'ONE_TIME',
          status: 'ACTIVE',
          scheduledActivationDate: new Date(),
          paymentSettings,
          // Add items creation
          items: {
            create: data.items.map((item) => ({
              productName: item.productName,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              taxable: item.taxable
            }))
          }
        }
      });

      // Update the payment event with the current version
      const updatedEvent = await tx.paymentEvent.update({
        where: { id: event.id },
        data: {
          versionId: version.id
        },
        include: {
          currentVersion: {
            include: {
              items: true // Include items in the response
            }
          },
          versions: {
            include: {
              items: true // Include items in versions
            },
            orderBy: {
              version: 'desc'
            }
          }
        }
      });

      return updatedEvent;
    });

    revalidatePath('/payment-events');
    return { success: true, data: paymentEvent };
  } catch (error) {
    console.error('Error creating payment event:', error);
    return { error: 'Failed to create payment event' };
  }
}

// Helper function for when assigning customers to payment event
export async function createSubscriptionPaymentEvent(
  data: PaymentEventFormValues
) {
  try {
    const session = await getSessionWithCompany();
    if (!session?.user?.id) {
      redirect('/login');
    }
    if (!session?.user?.activeCompanyId) {
      redirect('/select-company');
    }
    if (data.type !== 'SUBSCRIPTION') {
      throw new Error('Invalid payment event type');
    }

    // Calculate total amount from items
    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    const paymentSettings = {
      type: 'SUBSCRIPTION' as const,
      settings: {
        amount: totalAmount, // Use calculated total
        frequency: {
          unit: data.frequency.unit,
          value: data.frequency.value
        },
        // Anchor date configuration
        useAnchorDate: data.useAnchorDate,
        anchorConfig: data.useAnchorDate ? data.anchorConfig : undefined,

        // Optional settings
        allowPause: data.allowPause,
        trialPeriodDays: data.trialPeriodDays,

        // Initial fee handling
        initialFee:
          data.initialFee?.amount > 0
            ? {
                amount: data.initialFee.amount,
                description: data.initialFee.description
              }
            : undefined
      }
    };

    const paymentEvent = await prisma.$transaction(async (tx) => {
      // Create the base payment event
      const event = await tx.paymentEvent.create({
        data: {
          active: true,
          type: 'SUBSCRIPTION',
          company: { connect: { id: session.user?.activeCompanyId } }
        }
      });

      // Create the initial version with items
      const version = await tx.paymentEventVersion.create({
        data: {
          paymentEventId: event.id,
          version: 1,
          name: data.name,
          description: data.description,
          type: 'SUBSCRIPTION',
          status: 'ACTIVE',
          scheduledActivationDate: new Date(),
          paymentSettings,
          // Add items creation
          items: {
            create: data.items.map((item) => ({
              productName: item.productName,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              taxable: item.taxable
            }))
          }
        }
      });

      // Update the payment event with the current version
      const updatedEvent = await tx.paymentEvent.update({
        where: { id: event.id },
        data: {
          versionId: version.id
        },
        include: {
          currentVersion: {
            include: {
              items: true // Include items in the response
            }
          },
          versions: {
            include: {
              items: true // Include items in versions
            },
            orderBy: {
              version: 'desc'
            }
          }
        }
      });

      return updatedEvent;
    });

    revalidatePath('/payment-events');
    return { success: true, data: paymentEvent };
  } catch (error) {
    console.error('Error creating subscription payment event:', error);
    return { error: 'Failed to create subscription payment event' };
  }
}
