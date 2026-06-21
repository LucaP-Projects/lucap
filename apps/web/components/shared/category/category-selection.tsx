'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronsUpDown } from 'lucide-react';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@silknexus/ui';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

import { CategorySheet } from '../../category/sheet';
import { CategorySelectData, getCategoriesForSelect } from './actions';
import { CategoryItem } from './category-item';

interface CategorySelectProps {
  onSelect: (category: CategorySelectData) => void;
  selectedCategoryId?: string;
  className?: string;
  showAddNew?: boolean;
  key?: string;
}

const CategorySelect = React.forwardRef<HTMLButtonElement, CategorySelectProps>(
  (
    { onSelect, selectedCategoryId, className, showAddNew = false, key },
    ref
  ) => {
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [categories, setCategories] = React.useState<CategorySelectData[]>(
      []
    );
    const [loading, setLoading] = React.useState(false);
    const [selectedCategory, setSelectedCategory] =
      React.useState<CategorySelectData | null>(null);
    const router = useRouter();

    const debouncedSearch = useDebounce(search, 300);

    // Function to fetch categories
    const fetchCategories = React.useCallback(async () => {
      setLoading(true);
      try {
        const response = await getCategoriesForSelect(debouncedSearch);
        if (!response.success) {
          if (response.redirect) {
            router.replace(response.redirect);
            return;
          }
          setCategories([]);
          return;
        }
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }, [debouncedSearch, router]);

    // Fetch categories on mount and when search changes
    React.useEffect(() => {
      fetchCategories();
    }, [debouncedSearch, fetchCategories]);

    const handleSelect = React.useCallback(
      (category: CategorySelectData) => {
        setSelectedCategory(category);
        onSelect(category);
        setOpen(false);
      },
      [onSelect]
    );

    // Handle successful category creation
    const handleCategoryCreated = React.useCallback(() => {
      setSheetOpen(false);
      fetchCategories();
    }, [fetchCategories]);

    React.useEffect(() => {
      if (!selectedCategoryId) {
        setSelectedCategory(null);
        return;
      }

      function findCategory(
        categories: CategorySelectData[],
        id: string
      ): CategorySelectData | null {
        for (const cat of categories) {
          if (cat.id === id) return cat;
          if (cat.subCategories?.length) {
            const found = findCategory(cat.subCategories, id);
            if (found) return found;
          }
        }
        return null;
      }
      const found = findCategory(categories, selectedCategoryId);
      setSelectedCategory(found);
    }, [selectedCategoryId, categories]);

    return (
      <div className="relative w-full" key={key}>
        <Popover open={open} onOpenChange={setOpen} modal>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'relative h-9 w-full pr-8',
                'text-sm',
                !selectedCategory && 'text-muted-foreground',
                className
              )}
            >
              <div className="flex w-full items-center overflow-hidden">
                <div className="min-w-0 flex-1 text-left">
                  <span className="block truncate">
                    {selectedCategory
                      ? selectedCategory.name
                      : 'Select category...'}
                  </span>
                </div>
                {selectedCategory && (
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {selectedCategory.id}
                  </span>
                )}
              </div>
              <ChevronsUpDown className="absolute right-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="max-h-[300px] w-(--radix-popover-trigger-width) overflow-hidden p-0"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command className="w-full">
              <CommandInput
                placeholder="Search categories..."
                value={search}
                onValueChange={setSearch}
                className="h-9"
              />
              {showAddNew && (
                <div className="border-t px-2">
                  <CategorySheet
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    onSuccess={handleCategoryCreated}
                    isNestedForm
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start py-1.5 text-sm"
                    >
                      + Add new category
                    </Button>
                  </CategorySheet>
                </div>
              )}
              <CommandEmpty className="p-2 text-sm">
                {loading ? 'Loading...' : 'No category found.'}
              </CommandEmpty>
              <CommandGroup className="max-h-[200px] overflow-y-auto">
                {categories?.map((category) => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    level={0}
                    selectedCategoryId={selectedCategoryId}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

CategorySelect.displayName = 'CategorySelect';

export { CategorySelect };
export type { CategorySelectData, CategorySelectProps };
