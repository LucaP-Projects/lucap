import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Package } from "lucide-react";
import { getStore } from "@/components/store/actions";
import { getProducts } from "@/components/store/products/actions";
import { ProductWithImages } from "@/components/store/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getSessionWithCompany } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Store Products",
  description: "Manage your store products"
};

export default async function StoreProductsPage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const storeResult = await getStore(session.user.activeCompanyId);
  const store = storeResult.success ? storeResult.data : null;

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  if (!store) {
    redirect(`/${companySlug}/settings/store`);
  }

  const productsResult = await getProducts();
  const products = (productsResult.success ? productsResult.data : []) as ProductWithImages[];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage the products available in your store.
          </p>
        </div>
        <Link href={`/${companySlug}/store/products/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Products
          </CardTitle>
          <CardDescription>
            {products.length} product{products.length !== 1 ? "s" : ""} in your store.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
              <p className="text-muted-foreground">
                Add your first product to start selling.
              </p>
              <Link href={`/${companySlug}/store/products/new`} className="mt-4">
                <Button>Add Product</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "ACTIVE"
                            ? "default"
                            : product.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      {product.inventory === null ? "Unlimited" : product.inventory}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/${companySlug}/store/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
