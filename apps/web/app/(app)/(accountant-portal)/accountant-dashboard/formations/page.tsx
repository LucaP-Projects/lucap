import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFormationRequests } from "@/components/company/wizard/actions";
import { FormationRequestsManager } from "./manager";

export default async function AccountantFormationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.isAccountant && session?.user?.role !== "ADMIN") {
    redirect("/auth/login");
  }

  const requests = await getAllFormationRequests();

  return (
    <div className="container mx-auto max-w-5xl pt-6 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Company formation requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and manage incoming company registration requests.
        </p>
      </div>
      <FormationRequestsManager requests={requests} />
    </div>
  );
}
