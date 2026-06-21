import * as z from 'zod';

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

export const itemFormSchema = z
  .object({
    // Basic Information
    type: z.enum(['INVENTORY', 'NON_INVENTORY', 'SERVICE']),
    name: z.string().min(1, 'Name is required').max(100),
    sku: z.string().max(50).optional(),
    categoryId: z.string().optional(),
    image: z
      .any()
      .refine(
        (file) => !file || file?.size <= MAX_FILE_SIZE,
        'Max image size is 5MB'
      )
      .refine(
        (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported'
      )
      .optional(),
    description: z.string().max(1000).optional(),
    salesDescription: z.string().max(1000).optional(),
    purchaseDescription: z.string().max(1000).optional(),

    // Sales Information
    sellable: z.boolean().default(true),
    salesPrice: z.number().min(0).default(0),
    salesTaxable: z.boolean().default(true),
    incomeAccountId: z.string().optional(),

    // Purchase Information
    purchasable: z.boolean().default(false),
    cost: z.number().min(0).default(0),
    expenseAccountId: z.string().optional(),
    preferredVendorId: z.string().optional(),

    // Inventory Specific Fields
    trackInventory: z.boolean().default(false),
    quantityOnHand: z.number().int().default(0),
    reorderPoint: z.number().int().nullable(),
    initialQuantity: z.number().int().nullable(),
    asOfDate: z.date().optional(),
    inventoryAssetAccountId: z.string().optional(),

    status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED']).default('ACTIVE'),

    discountEnabled: z.boolean().optional(),
    discountType: z
      .enum(['PERCENTAGE', 'FIXED_AMOUNT'])
      .optional()
      .or(z.string())
      .nullable(),
    discountValue: z.number().optional().nullable(),
    discountAmount: z.number().optional()
  })
  .superRefine((data, ctx) => {
    if (data.type === 'INVENTORY') {
      if (data.initialQuantity === undefined || data.initialQuantity === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Initial quantity is required for inventory items',
          path: ['initialQuantity']
        });
      } else if (data.initialQuantity < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Initial quantity cannot be negative',
          path: ['initialQuantity']
        });
      }

      if (data.reorderPoint === undefined || data.reorderPoint === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Reorder point is required for inventory items',
          path: ['reorderPoint']
        });
      } else if (data.reorderPoint < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Reorder point cannot be negative',
          path: ['reorderPoint']
        });
      }

      if (!data.asOfDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'As of date is required for inventory items',
          path: ['asOfDate']
        });
      }
    }
  });

export const itemUpdateSchema = z.object({
  type: z.enum(['INVENTORY', 'NON_INVENTORY', 'SERVICE']).optional().nullable(),
  name: z.string().max(100).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  categoryId: z.string().optional().nullable(),
  image: z
    .any()
    .refine(
      (file) => !file || file?.size <= MAX_FILE_SIZE,
      'Max image size is 5MB'
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file?.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported'
    )
    .optional()
    .nullable(),
  description: z.string().max(1000).optional().nullable(),
  salesDescription: z.string().max(1000).optional().nullable(),
  purchaseDescription: z.string().max(1000).optional().nullable(),
  sellable: z.boolean().optional().nullable(),
  salesPrice: z.number().min(0).optional().nullable(),
  salesTaxable: z.boolean().optional().nullable(),
  incomeAccountId: z.string().optional().nullable(),
  purchasable: z.boolean().optional().nullable(),
  cost: z.number().min(0).optional().nullable(),
  expenseAccountId: z.string().optional().nullable(),
  preferredVendorId: z.string().optional().nullable(),
  trackInventory: z.boolean().optional().nullable(),
  quantityOnHand: z.number().int().optional().nullable(),
  reorderPoint: z.number().int().optional().nullable(),
  initialQuantity: z.number().int().optional().nullable(),
  asOfDate: z.date().optional().nullable(),
  inventoryAssetAccountId: z.string().optional().nullable(),
  discountEnabled: z.boolean().optional().nullable(),
  discountType: z
    .enum(['PERCENTAGE', 'FIXED_AMOUNT'])
    .optional()
    .or(z.string())
    .nullable(), // <-- allow null
  discountValue: z.number().optional().nullable(), // <-- allow null
  discountAmount: z.number().optional().nullable()
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
