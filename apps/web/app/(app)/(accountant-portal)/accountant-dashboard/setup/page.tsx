import { headers } from "next/headers";
import { getAccountantsForCurrentUser } from "@/components/accountant/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
  Building2, 
  Settings2, 
  CheckCircle2, 
  Circle, 
  ChevronRight,
  ArrowUpRight,
  Plus,
  LayoutGrid,
  Users,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default async function AccountantSetupDashboard() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) return null;

  const accountants = await getAccountantsForCurrentUser();
  
  // For each company across all accountant firms, let's gather setup metrics
  // In a real-world scenario, we'd do this more efficiently
  const clientCompanies = await Promise.all(
    accountants.flatMap(acc => 
      acc.assignments.map(async (assign: any) => {
        const companyId = assign.companyId;
        
        // Let's count basic setup items
        const [accountCount, taxCount, categoryCount, ticketCount] = await Promise.all([
          prisma.account.count({ where: { companyId, isActive: true } }),
          prisma.taxRate.count({ where: { companyId, isActive: true } }),
          prisma.category.count({ where: { companyId, isActive: true } }),
          prisma.ticket.count({ where: { companyId, status: { not: 'CLOSED' } } })
        ]);

        const setupModules = [
          { name: 'Chart of Accounts', complete: accountCount > 0, count: accountCount },
          { name: 'Tax Config', complete: taxCount > 0, count: taxCount },
          { name: 'Categories', complete: categoryCount > 0, count: categoryCount }
        ];

        const completionRate = Math.round((setupModules.filter(m => m.complete).length / setupModules.length) * 100);

        return {
          ...assign.company,
          firmName: acc.name,
          setupModules,
          completionRate,
          ticketCount,
          lastActivity: assign.updatedAt
        };
      })
    )
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-playfair text-navy flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-emerald-600" />
            Client Setup Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and configure setup progress across all your client companies.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" className="font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                <Users className="h-4 w-4 mr-2" />
                Staff Management
            </Button>
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md">
                <Plus className="h-5 w-5 mr-2" />
                Add Client Company
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-50/50 border-emerald-100">
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <Building2 className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-emerald-800 uppercase tracking-wider">Total Clients</p>
                        <h2 className="text-3xl font-bold text-navy">{clientCompanies.length}</h2>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        <Card className="bg-amber-50/50 border-amber-100">
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-xl">
                        <Settings2 className="h-6 w-6 text-amber-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-800 uppercase tracking-wider">In Setup</p>
                        <h2 className="text-3xl font-bold text-navy">
                            {clientCompanies.filter(c => c.completionRate < 100).length}
                        </h2>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <CheckCircle2 className="h-6 w-6 text-blue-700" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-blue-800 uppercase tracking-wider">Fully Onboarded</p>
                        <h2 className="text-3xl font-bold text-navy">
                            {clientCompanies.filter(c => c.completionRate === 100).length}
                        </h2>
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Active Client Assignments
        </h2>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {clientCompanies.map((company) => (
                <Card key={company.id} className="overflow-hidden group hover:shadow-lg transition-all border-slate-200">
                    <div className="h-2 w-full bg-emerald-600" style={{ opacity: company.completionRate / 100 }} />
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl text-navy">{company.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium">
                                    Firm: {company.firmName}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    Slug: /{company.slug}
                                </span>
                                {company.ticketCount > 0 && (
                                    <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100">
                                        {company.ticketCount} Open Issues
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/${company.slug}/dashboard`}>
                                <ArrowUpRight className="h-5 w-5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">Setup Progress</span>
                                <span className="text-emerald-700 font-bold">{company.completionRate}%</span>
                            </div>
                            <Progress value={company.completionRate} className="h-2" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {company.setupModules.map((module: any) => (
                                <div key={module.name} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 self-start">
                                        {module.complete ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                            <Circle className="h-3.5 w-3.5 text-slate-300" />
                                        )}
                                        <span className={module.complete ? "text-[10px] font-bold text-emerald-700" : "text-[10px] text-slate-400"}>
                                            {module.name}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-navy ml-5">
                                        {module.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t flex justify-between p-4">
                        <div className="text-[11px] text-muted-foreground">
                            Last setup update: {new Date(company.lastActivity).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 border-emerald-200 text-emerald-700" asChild>
                                <Link href={`/${company.slug}/settings/edit-company`}>
                                    Configure
                                </Link>
                            </Button>
                            <Button size="sm" className="h-8 bg-navy hover:bg-navy-light text-white" asChild>
                                <Link href={`/${company.slug}/account-plan`}>
                                    Account Plan
                                </Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
