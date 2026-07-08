"use client";

import { Clock, SendHorizonal, FileSearch, FileCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; variant: "secondary" | "default" | "outline" | "destructive" }> = {
  SUBMITTED: { label: "Submitted", icon: <SendHorizonal className="h-3.5 w-3.5" />, variant: "secondary" },
  IN_REVIEW: { label: "In review", icon: <FileSearch className="h-3.5 w-3.5" />, variant: "default" },
  DOCUMENTS_FILED: { label: "Documents filed", icon: <FileCheck className="h-3.5 w-3.5" />, variant: "outline" },
  REGISTERED: { label: "Registered", icon: <FileCheck className="h-3.5 w-3.5" />, variant: "default" },
  COMPLETED: { label: "Completed", icon: <FileCheck className="h-3.5 w-3.5" />, variant: "default" },
  REJECTED: { label: "Rejected", icon: <XCircle className="h-3.5 w-3.5" />, variant: "destructive" },
};

type RequestItem = {
  id: string;
  status: string;
  companyName: string | null;
  companyType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function FormationRequestsList({ requests }: { requests: RequestItem[] }) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Clock className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">No formation requests yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Submit one from the{" "}
            <a href="/create-company" className="text-primary underline underline-offset-2">
              company formation wizard
            </a>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const meta = STATUS_META[req.status] || STATUS_META.SUBMITTED;
        return (
          <Card key={req.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="flex items-center justify-between py-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">
                  {req.companyName || "Unnamed company"}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                  <span>{req.companyType || "—"}</span>
                  <span>·</span>
                  <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Badge variant={meta.variant} className="gap-1 shrink-0 ml-4">
                {meta.icon}
                {meta.label}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
