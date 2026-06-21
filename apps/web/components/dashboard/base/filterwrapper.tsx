import { FC } from 'react';
import { DocumentFilters } from './DocumentFilters';
import { DOCUMENT_TYPES } from './main';

interface CommonFilterProps<T> {
  filters: {
    status?: T;
    dateRange: string;
    search: string;
  };
  search: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
}

// 2. Enhanced Factory Function
// Adding better type constraints and documentation
/**
 * Creates a wrapped DocumentFilters component with proper typing
 * @param documentType - The type of document being filtered
 * @param statusEnum - The status enum for the document type
 * @returns A typed DocumentFilters component
 */
export function createDocumentFiltersWrapper<T extends string>(
  documentType: keyof typeof DOCUMENT_TYPES,
  statusEnum: Record<string, T>
): FC<CommonFilterProps<T>> {
  return function DocumentFiltersWrapper(props: CommonFilterProps<T>) {
    return (
      <DocumentFilters<T>
        documentType={documentType}
        statusEnum={statusEnum}
        {...props}
      />
    );
  };
}
