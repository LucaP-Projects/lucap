export interface StoreItemImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string | null;
  salesDescription: string | null;
  storeShortDescription: string | null;
  storeSlug: string | null;
  salesPrice: number;
  sku: string | null;
  storeStatus: "DRAFT" | "ACTIVE" | "ARCHIVED";
  quantityOnHand: number | null;
  storeFeatures: string[];
  storeImages: StoreItemImage[];
  storeIsPublic: boolean;
  storeCategoryIds: string[];
  companyId: string;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  store?: {
    id: string;
    name: string;
    slug: string;
    company: { id: string; name: string; slug: string; logo: string | null };
  };
}

export interface StoreWithCompany {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo: string | null;
  banner: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  isPublic: boolean;
  allowGuests: boolean;
  customDomain: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    email: string | null;
    phone: string | null;
    address: Record<string, unknown> | null;
  };
  items?: StoreItem[];
  products?: StoreItem[];
}

export interface CartItemWithItem {
  id: string;
  cartId: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  item: StoreItem & {
    company?: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
      store?: {
        id: string;
        name: string;
        slug: string;
      } | null;
    };
  };
}

export interface CartWithItems {
  id: string;
  companyId: string;
  items: CartItemWithItem[];
}

export interface OrderItemWithItem {
  id: string;
  orderId: string;
  itemId: string;
  itemName: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  total: number;
  taxAmount: number;
  item?: StoreItem;
}

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  buyerCompanyId: string;
  sellerCompanyId: string;
  sellerStoreId: string;
  status: string;
  fulfillmentStatus: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes: string | null;
  shippingAddress: Record<string, unknown> | null;
  billingAddress: Record<string, unknown> | null;
  invoiceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemWithItem[];
  buyerCompany: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    address: Record<string, unknown> | null;
  };
  sellerCompany: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    address: Record<string, unknown> | null;
  };
  sellerStore: {
    id: string;
    name: string;
    slug: string;
  };
  invoice: {
    id: string;
    number: string;
    status: string;
    amount: number;
    dueDate: Date;
  } | null;
}

export type ProductWithImages = StoreItem & {
  store?: {
    id: string;
    name: string;
    slug: string;
    company: { id: string; name: string; slug: string; logo: string | null };
  };
};

export interface StoreResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}
