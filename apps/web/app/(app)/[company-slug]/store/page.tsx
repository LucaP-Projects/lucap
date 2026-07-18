import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStore } from "@/components/store/actions";
import { getReceivedOrders } from "@/components/store/orders/actions";
import { getProducts } from "@/components/store/products/actions";
import { StoreUrlCard } from "@/components/store/store-url-card";
import { ProductWithImages, StoreWithCompany } from "@/components/store/types";
import { Button } from "@/components/ui/button";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Store",
  description: "Manage your company store"
};

export default async function StorePage() {
  const session = await getSessionWithCompany();

  if (!session?.user?.activeCompanyId) {
    redirect("/select-company");
  }

  const storeResult = await getStore();
  const store = storeResult.success ? (storeResult.data as StoreWithCompany) : null;

  const companySlug = session.activeCompany?.slug;
  if (!companySlug) {
    redirect("/select-company");
  }

  if (!store) {
    return (
      <div className="flex flex-col gap-6">
        <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-indigo-900">
              Company Store
            </h2>
            <p className="text-sm text-gray-600">
              Sell your products and services to other companies in the LucaP ecosystem.
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800">Store Not Enabled</h3>
          <p className="mt-1 text-sm text-gray-600">
            You haven&apos;t set up your company store yet. Enable it to start selling.
          </p>
          <Link href={`/${companySlug}/settings/store`}>
            <Button className="mt-4 bg-indigo-600 px-5 py-2.5 text-sm font-medium shadow-sm hover:bg-indigo-700">
              Set Up Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const [productsResult, ordersResult] = await Promise.all([
    getProducts(),
    getReceivedOrders()
  ]);
  const products = (productsResult.success ? productsResult.data : []) as ProductWithImages[];
  const orders = (ordersResult.success ? ordersResult.data : []) as { status: string }[];

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.storeStatus === "ACTIVE").length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-indigo-900">{store.name}</h2>
          <p className="text-sm text-gray-600">
            {store.isPublic
              ? "Your store is live in the marketplace."
              : "Your store is currently hidden from the marketplace."}
          </p>
        </div>
        <Link href={`/${companySlug}/settings/store`}>
          <Button variant="outline">Settings</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg">
          <div className="border-b border-gray-100 bg-indigo-50 px-4 py-2">
            <h3 className="text-sm font-medium text-indigo-700">Products in Store</h3>
          </div>
          <div className="p-4 lg:p-5">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 7 12 3 4 7v10l8 4 8-4V7Z" />
                  <path d="m4 7 8 4 8-4" />
                  <path d="M12 11v10" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
                <p className="mt-1 text-sm text-gray-600">
                  Active: <span className="font-medium">{activeProducts}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg">
          <div className="border-b border-gray-100 bg-amber-50 px-4 py-2">
            <h3 className="text-sm font-medium text-amber-700">Total Orders</h3>
          </div>
          <div className="p-4 lg:p-5">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
                <p className="mt-1 text-sm text-gray-600">
                  Pending: <span className="font-medium">{pendingOrders}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow hover:shadow-lg">
          <div
            className={`border-b border-gray-100 px-4 py-2 ${store.isPublic ? "bg-green-50" : "bg-gray-100"}`}
          >
            <h3
              className={`text-sm font-medium ${store.isPublic ? "text-green-700" : "text-gray-600"}`}
            >
              Store Visibility
            </h3>
          </div>
          <div className="p-4 lg:p-5">
            <div className="flex items-center">
              <div
                className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${store.isPublic ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {store.isPublic ? (
                    <>
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 11s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <path d="M2 2l20 20" />
                    </>
                  )}
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {store.isPublic ? "Public" : "Hidden"}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {store.isPublic ? "Visible in marketplace" : "Not visible to buyers"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <StoreUrlCard companySlug={companySlug} storeSlug={store.slug} />
      </div>

      <div className="mt-2 grid gap-5 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 7 12 3 4 7v10l8 4 8-4V7Z" />
                <path d="m4 7 8 4 8-4" />
                <path d="M12 11v10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">Products</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">Manage the products in your store.</p>
          <Link href={`/${companySlug}/store/products`}>
            <Button variant="outline" className="mt-4 w-full">
              Manage Products
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800">Orders</h3>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            View and fulfill orders from other companies.
          </p>
          <Link href={`/${companySlug}/store/orders`}>
            <Button variant="outline" className="mt-4 w-full">
              View Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
