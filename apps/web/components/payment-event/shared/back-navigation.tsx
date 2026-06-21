import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function BackNavigation({ to }: { to: string }) {
  return (
    <div className="mb-2">
      <Link href={to}>
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground h-9 px-2 transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
      </Link>
    </div>
  );
}
