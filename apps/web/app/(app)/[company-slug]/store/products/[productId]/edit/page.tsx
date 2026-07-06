import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { ProductForm } from "@/components/store/products/product-form";
import { getSessionWithCompany } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Edit your store product"
};

interface EditProductPageProps {
  params: Promise<{ "productId": string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const { productId } = await params;
  const companyId = session.user.activeCompanyId;

  const [product, categories, items] = await Promise.all([
    prisma.product.findFirst({
      where: { id: productId, companyId },
      include: {
        categories: { include: { category: { select: { id: true, name: true } } } }
      }
    }),
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

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">
          Update your store product details.
        </p>
      </div>

      <ProductForm
        companySlug={companySlug}
        categories={categories}
        items={items}
        initialData={product}
      />
    </div>
  );
}
