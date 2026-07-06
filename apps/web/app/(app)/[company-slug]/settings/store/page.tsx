import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getStore } from "@/components/store/actions";
import { StoreSettingsForm } from "@/components/store/store-settings-form";
import { StoreWithCompany } from "@/components/store/types";
import { getSessionWithCompany } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Store Settings",
  description: "Manage your company store profile"
};

export default async function StoreSettingsPage() {
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">
          {store
            ? "Manage your public store profile and visibility."
            : "Enable your company store to start selling to other businesses."}
        </p>
      </div>

      <StoreSettingsForm
        companySlug={companySlug}
        initialData={
          store
            ? {
                id: store.id,
                name: store.name,
                description: store.description,
                slug: store.slug,
                isPublic: store.isPublic,
                allowGuests: store.allowGuests,
                primaryColor: store.primaryColor,
                accentColor: store.accentColor
              }
            : undefined
        }
      />
    </div>
  );
}
