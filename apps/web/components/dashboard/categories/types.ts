export interface Item {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  quantityOnHand: number | null;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  level: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  subCategories: Category[];
  items: Item[];
}

export interface CategoryTableProps {
  categories: Category[];
}
export interface CategoryResponse {
  success: boolean;
  data?: CategoryWithItems[];
  error?: string;
}

// Define the item type
export interface ItemWithDetails {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  quantityOnHand: number | null;
}

// Define the category type
export interface CategoryWithItems {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null; // Add this line
  level: number;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  subCategories: CategoryWithItems[];
  items: ItemWithDetails[];
}
