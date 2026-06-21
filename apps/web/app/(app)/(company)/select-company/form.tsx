'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { selectCompany } from '@/components/company/select/actions';
import { Company } from '@/components/company/select/types';
import Loading from '@/components/shared/loading';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

interface Props {
  companies: Company[];
  lng: string;
}

export function SelectCompanyForm({ companies, lng }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const router = useRouter();
  const { data: session, status, refetch: update } = authClient.useSession();

  const handleSelectCompany = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }

    startTransition(async () => {
      try {
        const result = await selectCompany(selectedCompanyId);

        const selectedCompany = companies.find(
          (company) => company.id === selectedCompanyId
        );

        if (!selectedCompany) {
          throw new Error('Selected company not found');
        }

        await authClient.updateSession();

        toast.success('Company selected successfully');

        router.push(`/`);
      } catch (error) {
        console.error('Selection error:', error);
        toast.error(
          error instanceof Error ? error.message : 'Failed to select company'
        );
      }
    });
  };

  if (status === 'loading') {
    return <Loading variant="light" size="lg" />;
  }

  if (status !== 'authenticated' || !companies) {
    return null;
  }

  if (companies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="py-4 text-center">
          <p className="text-muted-foreground mb-4">
            You don&apos;t have any companies yet. Create your first company to
            get started.
          </p>
          <Link href={`/create-company`}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Company
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a company..." />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              <div className="flex items-center gap-2">
                {company.logo && (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-6 w-6 rounded-full"
                  />
                )}
                <span>{company.name}</span>
                {company.isAdmin && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    (Admin)
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={handleSelectCompany}
          disabled={isPending || !selectedCompanyId}
        >
          {isPending ? <span>Selecting...</span> : <span>Select Company</span>}
        </Button>

        <Link href={`/create-company`}>
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Company
          </Button>
        </Link>
      </div>
    </div>
  );
}
