import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getMyFormationRequests } from "@/components/company/wizard/actions";
import { FormationRequestsList } from "./list";

export default async function FormationRequestsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/login");

  const requests = await getMyFormationRequests();

  return (
    <div className="container mx-auto max-w-3xl pt-10 pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Company formation requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your company registration requests submitted to LucaPacioli.
        </p>
      </div>
      <FormationRequestsList requests={requests} />
    </div>
  );
}
