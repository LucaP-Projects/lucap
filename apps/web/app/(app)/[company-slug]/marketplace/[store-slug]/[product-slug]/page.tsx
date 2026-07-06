import { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductDetail } from "@/components/store/marketplace/product-detail";
import { getProductBySlug } from "@/components/store/products/actions";
import { ProductWithImages } from "@/components/store/types";
import { Button } from "@/components/ui/button";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Product",
  description: "Product details"
};

interface ProductPageProps {
  params: Promise<{ "store-slug": string; "product-slug": string }>;
}

export default async function MarketplaceProductPage({ params }: ProductPageProps) {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  const { "store-slug": storeSlug, "product-slug": productSlug } = await params;
  const productResult = await getProductBySlug(productSlug);

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  const product = productResult.data as ProductWithImages;

  if (product.store?.slug !== storeSlug) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <Link href={`/${companySlug}/marketplace/${storeSlug}`}>
        <Button variant="ghost" className="mb-4 pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to {product.store?.name}
        </Button>
      </Link>

      <ProductDetail product={product} companySlug={companySlug} />
    </div>
  );
}
