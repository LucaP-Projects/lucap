import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface ReturnButtonProps {
  href: string;
  label: string;
}

export const ReturnButton = ({ href, label }: ReturnButtonProps) => (
    <Button size="sm" asChild>
      <Link href={href}>
        <ArrowLeftIcon /> <span>{label}</span>
      </Link>
    </Button>
  );
