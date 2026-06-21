import { format } from 'date-fns';
import {
  Download,
  FileText,
  Home,
  Percent,
  Landmark,
  AlertCircle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface BaseSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  children?: React.ReactNode;
  title: string;
}

export const BaseSheet = ({
  isOpen,
  onOpenChange,
  isLoading,
  children,
  title
}: BaseSheetProps) => {
  if (isLoading) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent>
          <div className="flex h-full items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex h-full w-full flex-col p-0 sm:max-w-xl">
        <div className="flex h-full flex-col">
          <div className="border-border bg-card/40 border-b px-6 pb-4 pt-6 shadow-sm">
            <SheetHeader>
              <SheetTitle className="text-primary text-2xl font-bold">
                {title}
              </SheetTitle>
            </SheetHeader>
            <Separator className="my-4" />
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            {children}
          </div>

          <div className="border-border bg-card/30 mt-auto border-t px-6 py-4">
            <SheetFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border hover:bg-muted/60 transition-colors"
              >
                Close
              </Button>
            </SheetFooter>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export interface CustomerAddress {
  city?: string;
  line1?: string;
  line2?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export const CustomerAddressInfo = ({
  address
}: {
  address?: CustomerAddress;
}) => {
  if (!address) return null;

  // Check if address has any meaningful data
  const hasAddressData = Object.values(address).some((val) => val);

  if (!hasAddressData) return null;

  return (
    <div className="border-border bg-muted/30 rounded-lg border p-4 shadow-sm">
      <h3 className="text-primary mb-2 flex items-center gap-2 font-medium">
        <Home className="h-4 w-4" />
        Customer
      </h3>
      <div className="space-y-1 text-sm">
        {address.line1 && <p>{address.line1}</p>}
        {address.line2 && <p>{address.line2}</p>}
        <p>
          {address.city && `${address.city}, `}
          {address.state && `${address.state} `}
          {address.postalCode && address.postalCode}
        </p>
        {address.country && <p>{address.country}</p>}
      </div>
    </div>
  );
};

export const TaxInformation = ({
  taxRate,
  taxAmount,
  taxId
}: {
  taxRate?: number;
  taxAmount?: number;
  taxId?: string;
}) => {
  if (!taxRate && !taxAmount) return null;

  return (
    <div className="border-border bg-muted/30 rounded-lg border p-4 shadow-sm">
      <h3 className="text-primary mb-2 flex items-center gap-2 font-medium">
        <Landmark className="h-4 w-4" />
        Tax Information
      </h3>
      <div className="space-y-1 text-sm">
        {taxRate && (
          <p>
            Tax Rate: <span className="font-medium">{taxRate}%</span>
          </p>
        )}
        {taxAmount && (
          <p>
            Tax Amount:{' '}
            <span className="font-medium">{formatCurrency(taxAmount)}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export const DiscountInformation = ({
  discountType,
  discountValue,
  discountAmount,
  discountApplicationTime
}: {
  discountType?: string;
  discountValue?: number;
  discountAmount?: number;
  discountApplicationTime?: string;
}) => {
  const hasDiscount = discountAmount && discountAmount > 0;

  if (!hasDiscount) return null;

  return (
    <div className="border-border bg-muted/30 rounded-lg border p-4 shadow-sm">
      <h3 className="text-primary mb-2 flex items-center gap-2 font-medium">
        <Percent className="h-4 w-4" />
        Discount Information
      </h3>
      <div className="space-y-1 text-sm">
        {discountType && (
          <p>
            Type:{' '}
            <span className="font-medium">
              {discountType.replace(/_/g, ' ').toLowerCase()}
            </span>
          </p>
        )}
        {discountValue && discountValue > 0 && (
          <p>
            Value:{' '}
            <span className="font-medium text-amber-600">
              {discountType === 'PERCENTAGE'
                ? `${discountValue}%`
                : formatCurrency(discountValue)}
            </span>
          </p>
        )}
        {discountAmount && discountAmount > 0 && (
          <p>
            Amount:{' '}
            <span className="font-medium text-amber-600">
              {formatCurrency(discountAmount)}
            </span>
          </p>
        )}
        {discountApplicationTime && (
          <p>
            Applied:{' '}
            <span className="font-medium">
              {discountApplicationTime.replace(/_/g, ' ').toLowerCase()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export const CustomerInfo = ({
  customer,
  parentEmail
}: {
  customer: { displayName: string; primaryEmail: string | null };
  parentEmail?: string;
}) => (
  <div className="border-border bg-muted/30 rounded-lg border p-4 shadow-sm">
    <h3 className="text-primary mb-2 flex items-center gap-2 font-medium">
      <FileText className="h-4 w-4" />
      Customer Information
    </h3>
    <div className="space-y-1 text-sm">
      <p className="font-medium">{customer.displayName}</p>
      <p className="text-muted-foreground">
        {customer.primaryEmail
          ? customer.primaryEmail
          : parentEmail
            ? parentEmail
            : 'No email provided'}
      </p>
    </div>
  </div>
);

const getGoogleStorageFileUrl = (filePath: string) => {
  const BUCKET_NAME =
    process.env.NEXT_PUBLIC_GOOGLE_STORAGE_BUCKET || 'lucapacioli.com.tn';
  return `https://storage.googleapis.com/${BUCKET_NAME}/${filePath}`;
};

export const Attachments = ({
  attachments
}: {
  attachments: Array<{
    fileId: string;
    file: {
      filename: string;
      path: string;
    };
  }>;
}) =>
  attachments.length > 0 ? (
    <div className="border-border bg-muted/30 rounded-lg border p-4 shadow-sm">
      <h3 className="text-primary mb-3 font-medium">Attachments</h3>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.fileId}
            className="border-border bg-card/50 hover:bg-card/80 flex items-center justify-between rounded-md border p-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="text-primary h-4 w-4" />
              <span className="max-w-[200px] truncate text-sm">
                {attachment.file.filename}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  getGoogleStorageFileUrl(attachment.file.path),
                  '_blank'
                )
              }
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  ) : null;

export const Notes = ({ notes }: { notes?: string | null }) =>
  notes ? (
    <div className="border-border bg-muted/30 rounded-lg border p-4 shadow-sm">
      <h3 className="text-primary mb-2 font-medium">Notes</h3>
      <p className="text-muted-foreground border-border bg-card/50 whitespace-pre-wrap rounded-md border p-3 text-sm">
        {notes}
      </p>
    </div>
  ) : null;

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

export const formatDate = (date: Date) => format(new Date(date), 'PPp');
