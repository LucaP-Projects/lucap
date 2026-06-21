'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Search,
  MoreHorizontal,
  FolderOpen,
  Badge,
  Sheet,
  Table
} from 'lucide-react';


import { CategorySheet } from '@/components/category/sheet';
import { deleteCategory } from './actions';
import { CategoryWithItems } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { TableRow, TableCell, TableHeader, TableHead, TableBody } from '@/components/ui/table';
import { toast } from 'sonner';

// Types
interface Item {
  id: string;
  name: string;
  type: string;
  salesPrice: number;
  quantityOnHand: number | null;
}

interface Category {
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

interface CategoryRowProps {
  category: Category;
  level: number;
  onExpand: (id: string) => void;
  isExpanded: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onViewItems: (category: Category) => void;
}

// Helper function to remove category from tree
const removeCategoryFromTree = (
  categories: Category[],
  id: string
): Category[] =>
  categories
    .filter((category) => category.id !== id)
    .map((category) => {
      if (category.subCategories) {
        return {
          ...category,
          subCategories: removeCategoryFromTree(category.subCategories, id)
        };
      }
      return category;
    });

// Category Row Component for Mobile Cards
const CategoryCard: React.FC<{
  category: Category;
  level: number;
  onExpand: (id: string) => void;
  isExpanded: boolean;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onViewItems: (category: Category) => void;
}> = ({
  category,
  level,
  onExpand,
  isExpanded,
  onEdit,
  onDelete,
  onViewItems
}) => {
  const hasSubCategories =
    category.subCategories && category.subCategories.length > 0;

  return (
    <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {hasSubCategories && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onExpand(category.id)}
                  className="rounded-full p-1 hover:bg-gray-100"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </motion.div>
                </motion.button>
              )}
              <h3 className="text-lg font-bold text-gray-900">
                {category.name}
              </h3>
            </div>
            {category.description && (
              <p className="mb-2 text-sm text-gray-500">
                {category.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-lg p-0 transition-colors hover:bg-blue-100"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl border-0 py-2 shadow-xl"
            >
              <DropdownMenuItem
                onClick={() => onViewItems(category)}
                className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Items
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(category)}
                className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category)}
                className="mx-2 cursor-pointer rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Level
            </p>
            <Badge variant="outline">{level}</Badge>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Items
            </p>
            <span className="inline-flex items-center rounded-md border border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 px-2 py-1 text-sm font-semibold text-blue-800">
              {category.items.length}
            </span>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Status
            </p>
            <Badge variant={category.active ? 'default' : 'secondary'}>
              {category.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
              Sub Categories
            </p>
            <span className="inline-flex items-center rounded-md border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 text-sm font-semibold text-green-800">
              {category.subCategories?.length || 0}
            </span>
          </div>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Created Date
          </p>
          <p className="font-medium text-gray-600">
            {new Date(category.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Category Row Component for Desktop Table
const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  level,
  onExpand,
  isExpanded,
  onEdit,
  onDelete,
  onViewItems
}) => {
  const hasSubCategories =
    category.subCategories && category.subCategories.length > 0;
  const indentPadding = level * 16;

  return (
    <TableRow className="group h-16 border-b border-gray-50 transition-all duration-200 hover:bg-blue-50/30">
      <TableCell
        className="px-6 py-4"
        style={{ paddingLeft: `${indentPadding + 24}px` }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            {hasSubCategories && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onExpand(category.id)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </motion.div>
              </motion.button>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-base font-bold text-gray-900 transition-colors group-hover:text-blue-700">
              {category.name}
            </div>
            {category.description && (
              <div className="line-clamp-1 text-sm font-medium text-gray-500">
                {category.description}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <Badge variant="outline">{level}</Badge>
      </TableCell>
      <TableCell className="px-4 py-4">
        <span className="inline-flex items-center rounded-md border border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100 px-2 py-1 text-sm font-semibold text-blue-800">
          {category.items.length}
        </span>
      </TableCell>
      <TableCell className="px-4 py-4">
        <Badge variant={category.active ? 'default' : 'secondary'}>
          {category.active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="px-4 py-4">
        <span className="inline-flex items-center rounded-md border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 text-sm font-semibold text-green-800">
          {category.subCategories?.length || 0}
        </span>
      </TableCell>
      <TableCell className="px-4 py-4 font-medium text-gray-600">
        {new Date(category.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="px-4 py-4 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 rounded-lg p-0 transition-colors hover:bg-blue-100"
            >
              <MoreHorizontal className="h-4 w-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 rounded-xl border-0 py-2 shadow-xl"
          >
            <DropdownMenuItem
              onClick={() => onViewItems(category)}
              className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Items
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(category)}
              className="mx-2 cursor-pointer rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(category)}
              className="mx-2 cursor-pointer rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

const CategoriesPageClient: React.FC<{ initialCategories: Category[] }> = ({
  initialCategories
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [search, setSearch] = useState('');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false); // Add this state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isItemsSheetOpen, setIsItemsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // In CategoriesPageClient, modify handleCategoryCreated:
  const handleCategoryCreated = async (newCategory?: CategoryWithItems) => {
    if (newCategory) {
      // Update categories state with the new category
      setCategories((prevCategories) => {
        const updatedCategories = [...prevCategories];

        if (newCategory.parentId) {
          // For nested categories, recursively update the tree
          const updateCategoryTree = (categories: Category[]): Category[] =>
            categories.map((category) => {
              if (category.id === newCategory.parentId) {
                return {
                  ...category,
                  subCategories: [...category.subCategories, newCategory]
                };
              }
              if (category.subCategories.length > 0) {
                return {
                  ...category,
                  subCategories: updateCategoryTree(category.subCategories)
                };
              }
              return category;
            });

          return updateCategoryTree(updatedCategories);
        } else {
          // For root categories, add to the main array
          return [...updatedCategories, newCategory];
        }
      });
    }
  };

  // Add this function to handle category updates
  const handleCategoryUpdated = async (updatedCategory?: CategoryWithItems) => {
    if (updatedCategory) {
      // Update categories state with the updated category
      setCategories((prevCategories) => {
        // Function to update the category in the tree
        const updateCategoryInTree = (categories: Category[]): Category[] =>
          categories.map((category) => {
            if (category.id === updatedCategory.id) {
              return {
                ...updatedCategory,
                subCategories: category.subCategories // Preserve subcategories
              };
            }
            if (category.subCategories.length > 0) {
              return {
                ...category,
                subCategories: updateCategoryInTree(category.subCategories)
              };
            }
            return category;
          });

        return updateCategoryInTree(prevCategories);
      });
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleViewItems = (category: Category) => {
    setSelectedCategory(category);
    setIsItemsSheetOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditSheetOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const onDeleteConfirm = async () => {
    try {
      if (!selectedCategory) return;

      setIsLoading(true);
      const response = await deleteCategory(selectedCategory.id);

      if (response.success) {
        // Optimistic update
        setCategories((prevCategories) =>
          removeCategoryFromTree(prevCategories, selectedCategory.id)
        );

        toast('Category deleted successfully');

        setIsDeleteDialogOpen(false);
      } else {
        if (response.redirect) {
          window.location.href = response.redirect;
          return;
        }

        toast(response.error || 'Failed to delete category');
      }
    } catch (error) {
      toast('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategoryTreeMobile = (
    category: Category,
    level = 0
  ): React.ReactElement[] => {
    const isExpanded = expandedCategories.has(category.id);
    const elements: React.ReactElement[] = [];

    elements.push(
      <motion.div
        key={category.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <CategoryCard
          category={category}
          level={level}
          onExpand={toggleExpand}
          isExpanded={isExpanded}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewItems={handleViewItems}
        />
      </motion.div>
    );

    if (
      isExpanded &&
      category.subCategories &&
      category.subCategories.length > 0
    ) {
      category.subCategories.forEach((subCategory) => {
        elements.push(...renderCategoryTreeMobile(subCategory, level + 1));
      });
    }

    return elements;
  };

  const renderCategoryTreeDesktop = (
    category: Category,
    level = 0
  ): React.ReactElement[] => {
    const isExpanded = expandedCategories.has(category.id);
    const elements: React.ReactElement[] = [];

    elements.push(
      <CategoryRow
        key={category.id}
        category={category}
        level={level}
        onExpand={toggleExpand}
        isExpanded={isExpanded}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewItems={handleViewItems}
      />
    );

    if (
      isExpanded &&
      category.subCategories &&
      category.subCategories.length > 0
    ) {
      category.subCategories.forEach((subCategory) => {
        elements.push(...renderCategoryTreeDesktop(subCategory, level + 1));
      });
    }

    return elements;
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(search.toLowerCase()) ||
      category.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 shadow-2xl md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90" />
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-20 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                Category Management
              </h1>
              <p className="text-base font-medium text-blue-100 md:text-lg">
                Organize and manage your product categories
              </p>
            </div>
            <div className="flex-shrink-0">
              <CategorySheet
                open={isCreateSheetOpen}
                onOpenChange={setIsCreateSheetOpen}
                onSuccess={handleCategoryCreated}
              >
                <Button className="w-full border-0 bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition-all duration-300 hover:bg-blue-50 hover:shadow-xl md:w-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Category
                </Button>
              </CategorySheet>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-xl border-gray-200 pl-12 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Categories Table/Cards */}
        <Card className="overflow-hidden rounded-2xl border-0 bg-white shadow-xl">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50/50 px-6 py-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-gray-900 md:text-2xl">
                  Categories Overview
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Manage and configure your product categories
                </CardDescription>
              </div>
              <div className="rounded-full border bg-white px-4 py-2 text-sm text-gray-500 shadow-sm">
                {filteredCategories.length}{' '}
                {filteredCategories.length === 1 ? 'category' : 'categories'}
              </div>
            </div>
          </CardHeader>

          {/* Mobile Card Layout */}
          <div className="block md:hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="text-lg font-medium text-gray-500">
                  Loading categories...
                </p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center space-y-6 px-6 py-20">
                <div className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
                  <FolderOpen className="h-16 w-16 text-blue-600" />
                </div>
                <div className="max-w-md space-y-3 text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    No categories found
                  </h3>
                  <p className="text-base text-gray-500">
                    {search
                      ? 'No categories match your search criteria. Try adjusting your search terms.'
                      : 'Get started by creating your first category to organize your products effectively.'}
                  </p>
                </div>
                {!search && (
                  <CategorySheet
                    open={isCreateSheetOpen}
                    onOpenChange={setIsCreateSheetOpen}
                    onSuccess={handleCategoryCreated}
                  >
                    <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
                      <Plus className="mr-2 h-5 w-5" />
                      Create your first category
                    </Button>
                  </CategorySheet>
                )}
              </div>
            ) : (
              <div className="space-y-4 p-4">
                <AnimatePresence>
                  {filteredCategories
                    .map((category) => renderCategoryTreeMobile(category))
                    .flat()}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                  <TableHead className="h-12 px-6 text-left font-bold text-gray-800">
                    Name
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Level
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Items
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Status
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Sub Categories
                  </TableHead>
                  <TableHead className="h-12 px-4 text-left font-bold text-gray-800">
                    Created Date
                  </TableHead>
                  <TableHead className="h-12 w-16 px-4 text-center" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-80 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                        <p className="text-lg font-medium text-gray-500">
                          Loading categories...
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-96 px-6 text-center">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
                          <FolderOpen className="h-16 w-16 text-blue-600" />
                        </div>
                        <div className="max-w-md space-y-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            No categories found
                          </h3>
                          <p className="text-center text-base text-gray-500">
                            {search
                              ? 'No categories match your search criteria. Try adjusting your search terms.'
                              : 'Get started by creating your first category to organize your products effectively.'}
                          </p>
                        </div>
                        {!search && (
                          <div className="mt-2">
                            <CategorySheet
                              open={isCreateSheetOpen}
                              onOpenChange={setIsCreateSheetOpen}
                              onSuccess={handleCategoryCreated}
                            >
                              <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl">
                                <Plus className="mr-2 h-5 w-5" />
                                Create your first category
                              </Button>
                            </CategorySheet>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {filteredCategories
                      .map((category) => renderCategoryTreeDesktop(category))
                      .flat()}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Items View Sheet */}
        <Sheet open={isItemsSheetOpen} onOpenChange={setIsItemsSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-xl">
            <SheetHeader className="px-6 py-4">
              <SheetTitle className="text-2xl">
                Items in {selectedCategory?.name}
              </SheetTitle>
              <SheetDescription>
                View and manage items in this category
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {selectedCategory?.items.length === 0 ? (
                <div className="text-muted-foreground flex items-center justify-center p-8">
                  There are no items in this category.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCategory?.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell className="text-right">
                          ${item.salesPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantityOnHand ?? 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Edit CategorySheet */}
        <CategorySheet
          open={isEditSheetOpen}
          onOpenChange={(open) => {
            setIsEditSheetOpen(open);
            if (!open) {
              setSelectedCategory(null);
            }
          }}
          category={selectedCategory as CategoryWithItems}
          onSuccess={(updatedCategory) => {
            handleCategoryUpdated(updatedCategory);
            setIsEditSheetOpen(false);
            setSelectedCategory(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="mx-4 rounded-2xl border-0 shadow-2xl sm:max-w-md">
            <DialogHeader className="space-y-4">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Delete Category
              </DialogTitle>
              <DialogDescription className="space-y-4 text-gray-600">
                <p>
                  Are you sure you want to delete &quot;{selectedCategory?.name}&quot;?
                  This action cannot be undone.
                </p>
                <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-amber-800">
                  <div className="flex items-center space-x-3">
                    <FolderOpen className="h-5 w-5 flex-shrink-0 text-amber-600" />
                    <span className="text-sm font-semibold">
                      Note: Categories with items or subcategories cannot be
                      deleted.
                    </span>
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isLoading}
                className="rounded-xl border-gray-300 px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={onDeleteConfirm}
                disabled={isLoading}
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-6 py-2 text-white shadow-lg hover:from-red-700 hover:to-red-800"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Deleting...
                  </>
                ) : (
                  'Delete Category'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CategoriesPageClient;
