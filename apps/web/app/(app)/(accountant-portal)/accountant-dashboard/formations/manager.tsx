"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SendHorizonal, FileSearch, FileCheck, XCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { updateFormationRequestStatus, updateFormationNotes } from "@/components/company/wizard/actions";

const STATUS_OPTIONS = [
  "SUBMITTED", "IN_REVIEW", "DOCUMENTS_FILED", "REGISTERED", "COMPLETED", "REJECTED",
];

const STATUS_META: Record<string, { label: string; icon: React.ReactNode }> = {
  SUBMITTED: { label: "Submitted", icon: <SendHorizonal className="h-3.5 w-3.5" /> },
  IN_REVIEW: { label: "In review", icon: <FileSearch className="h-3.5 w-3.5" /> },
  DOCUMENTS_FILED: { label: "Documents filed", icon: <FileCheck className="h-3.5 w-3.5" /> },
  REGISTERED: { label: "Registered", icon: <FileCheck className="h-3.5 w-3.5" /> },
  COMPLETED: { label: "Completed", icon: <FileCheck className="h-3.5 w-3.5" /> },
  REJECTED: { label: "Rejected", icon: <XCircle className="h-3.5 w-3.5" /> },
};

type RequestItem = {
  id: string;
  status: string;
  companyName: string | null;
  companyType: string | null;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  submitterName: string | null;
  submitterEmail: string | null;
  createdAt: Date;
  notes: string | null;
  capitalAmount: number | null;
  numberOfShares: number | null;
  shareholders: unknown;
  user: { name: string | null; email: string | null } | null;
};

export function FormationRequestsManager({ requests }: { requests: RequestItem[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const pending = requests.filter((r) => r.status === "SUBMITTED" || r.status === "IN_REVIEW");
  const other = requests.filter((r) => !["SUBMITTED", "IN_REVIEW"].includes(r.status));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                isExpanded={expanded === req.id}
                onToggle={() => setExpanded(expanded === req.id ? null : req.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          History ({other.length})
        </h2>
        {other.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed requests.</p>
        ) : (
          <div className="space-y-2">
            {other.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                isExpanded={expanded === req.id}
                onToggle={() => setExpanded(expanded === req.id ? null : req.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function RequestCard({
  req, isExpanded, onToggle,
}: {
  req: RequestItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(req.status);
  const [notes, setNotes] = useState(req.notes || "");
  const meta = STATUS_META[status] || STATUS_META.SUBMITTED;

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateFormationRequestStatus(req.id, newStatus);
      if (res.success) {
        setStatus(newStatus);
        toast.success(`Status updated to ${STATUS_META[newStatus]?.label || newStatus}`);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updateFormationNotes(req.id, notes);
      if (res.success) {
        toast.success("Notes saved");
      } else {
        toast.error(res.error || "Failed to save notes");
      }
    });
  };

  const submitter = req.user
    ? { name: req.user.name || req.submitterName, email: req.user.email || req.submitterEmail }
    : { name: req.submitterName, email: req.submitterEmail };

  return (
    <Card>
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
      >
        <CardContent className="flex items-center justify-between py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">
                {req.companyName || "Unnamed"}
              </p>
              {req.companyType && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {req.companyType}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              <span>{submitter.name || submitter.email || "Unknown"}</span>
              <span>·</span>
              <span>{new Date(req.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <Badge variant={status === "REJECTED" ? "destructive" : "secondary"} className="gap-1">
              {meta.icon}
              {meta.label}
            </Badge>
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardContent>
      </button>

      {isExpanded && (
        <CardContent className="pb-4 pt-0 space-y-4">
          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Tax ID</span>
              <p className="font-medium">{req.taxId || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Email</span>
              <p className="font-medium">{req.email || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Phone</span>
              <p className="font-medium">{req.phone || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Capital</span>
              <p className="font-medium">
                {req.capitalAmount ? `${req.capitalAmount.toLocaleString()} TND` : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Shares</span>
              <p className="font-medium">{req.numberOfShares || "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs">Shareholders</span>
              <p className="font-medium">
                {Array.isArray(req.shareholders) ? req.shareholders.length : "—"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground block mb-1">Status</label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s]?.label || s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Internal notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this request..."
              rows={3}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleSaveNotes}
              disabled={isPending}
            >
              {isPending ? "Saving..." : "Save notes"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
