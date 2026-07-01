import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCompanyFiles } from "@/components/shared/drive/actions";
import { DriveView } from "@/components/shared/drive/drive-view";
import { HardDrive, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DrivePage({
  params
}: {
  params: Promise<{ "company-slug": string }>;
}) {
  const { "company-slug": companySlug } = await params;

  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return null;

  const company = await prisma.company.findUnique({
    where: { slug: companySlug }
  });

  if (!company) notFound();

  const files = await getCompanyFiles(company.id);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-navy flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-primary" />
            Company Drive
          </h1>
          <p className="text-muted-foreground mt-1">
            Access and manage all documents, receipts, and invoices for {company.name}.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border p-6 min-h-[600px]">
        <DriveView files={files} companySlug={companySlug} />
      </div>
    </div>
  );
}
