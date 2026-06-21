'use client';

import { Check, FolderTree } from 'lucide-react';
import { CommandItem } from '@silknexus/ui';
import { cn } from '@/lib/utils';
import { CategorySelectData } from './actions';

interface CategoryItemProps {
  category: CategorySelectData;
  level: number;
  selectedCategoryId?: string;
  onSelect: (category: CategorySelectData) => void;
}

export function CategoryItem({
  category,
  level,
  selectedCategoryId,
  onSelect
}: CategoryItemProps) {
  const paddingLeft = level * 16;

  return (
    <>
      <CommandItem
        value={category.name}
        onSelect={() => onSelect(category)}
        className={cn(
          'flex items-center gap-2',
          selectedCategoryId === category.id && 'bg-accent'
        )}
        style={{ paddingLeft: `${paddingLeft + 16}px` }}
      >
        <FolderTree className="h-4 w-4" />
        <span>{category.name}</span>
        {category.description && (
          <span className="text-muted-foreground ml-2 max-w-[150px] truncate text-sm">
            ({category.description})
          </span>
        )}
        {selectedCategoryId === category.id && (
          <Check className="ml-auto h-4 w-4" />
        )}
      </CommandItem>
      {category.subCategories?.map((sub) => (
        <CategoryItem
          key={sub.id}
          category={sub}
          level={level + 1}
          selectedCategoryId={selectedCategoryId}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}
