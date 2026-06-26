'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlusCircle } from 'lucide-react';
import { selectCompany } from '@/components/company/select/actions';
import { Company } from '@/components/company/select/types';
import Loading from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authClient } from '@/lib/auth-client';

interface Props {
  companies: Company[];
}

export function SelectCompanyForm({ companies }: Props) {
  const [isTransitionPending, startTransition] = useTransition();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const router = useRouter();
  const { data: session, isPending, isRefetching } = authClient.useSession();

  const handleSelectCompany = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }

    startTransition(async () => {
      try {
        await selectCompany(selectedCompanyId);

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
        toast.error(
          error instanceof Error ? error.message : 'Failed to select company'
        );
      }
    });
  };

  if (isPending || isRefetching) {
    return (
      <div className="flex justify-center">
        <Loading variant="light" size="md" />
      </div>
    );
  }

  if (!session || !companies) {
    return null;
  }

  if (companies.length === 0) {
    return (
      <>
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Welcome!</CardTitle>
          <CardDescription className="text-center">
            Get started by creating your first company
          </CardDescription>
        </CardHeader>

        <CardContent className="py-4 text-center">
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
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center">Select Company</CardTitle>
        <CardDescription className="text-center">
          Choose a company to work with
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company..." />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center gap-2">
                  {company.logo && (
                    <Image
                      src={company.logo}
                      alt={company.name}
                      className="h-6 w-6 rounded-full"
                      width={24}
                      height={24}
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
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4">
        <Button
          onClick={handleSelectCompany}
          disabled={isTransitionPending || !selectedCompanyId}
        >
          {isTransitionPending ? <span>Selecting...</span> : <span>Select Company</span>}
        </Button>

        <Link href={`/create-company`}>
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Company
          </Button>
        </Link>
      </CardFooter>
    </>
  );
}
