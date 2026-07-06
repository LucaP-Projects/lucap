import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/store/products/product-form";
import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Add Product",
  description: "Add a new product to your store"
};

export default async function NewProductPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const companyId = session.user.activeCompanyId;

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      where: { companyId, active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.item.findMany({
      where: { companyId, isActive: true, sellable: true },
      select: { id: true, name: true, sku: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground">
          Add a new product to your company store.
        </p>
      </div>

      <ProductForm companySlug={companySlug} categories={categories} items={items} />
    </div>
  );
}
