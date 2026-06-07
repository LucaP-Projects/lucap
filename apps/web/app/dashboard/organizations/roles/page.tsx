"use client";

import React, { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  FileText, 
  Ticket as TicketIcon, 
  TrendingUp, 
  Users,
  Settings,
  Sparkles,
  Info
} from "lucide-react";

// Standard statements that represent our domain resources
const RESOURCES = [
  { id: "document", name: "Documents", icon: FileText, desc: "Client secure assets and invoices" },
  { id: "ticket", name: "Support Tickets", icon: TicketIcon, desc: "VPN and security channels" },
  { id: "transaction", name: "Transactions", icon: TrendingUp, desc: "Achat & Vente balance logs" },
];

const ACTIONS = [
  { id: "create", name: "Create" },
  { id: "read", name: "Read" },
  { id: "update", name: "Update" },
  { id: "delete", name: "Delete" },
];

export default function RolesDashboard() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeOrg, setActiveOrg] = useState<any | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // New Organization fields
  const [newOrgName, setNewOrgName] = useState("");
  const [creatingOrg, setCreatingOrg] = useState(false);

  // New Role fields
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePermissions] = useState<Record<string, string[]>>({
    document: ["read"],
    ticket: ["read"],
    transaction: ["read"],
  });
  const [creatingRole, setCreatingRole] = useState(false);

  // Editing Role fields
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [editingRolePerms, setEditingRolePerms] = useState<Record<string, string[]>>({});
  const [updatingRole, setUpdatingRole] = useState(false);

  // Simulation Sandbox Sandbox state
  const [previewRole, setPreviewRole] = useState<string>("member");
  const [previewResource, setPreviewResource] = useState<string>("document");
  const [previewAction, setPreviewAction] = useState<string>("read");

  // Notifications
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load organizations
  const fetchOrganizations = async () => {
    setLoadingOrgs(true);
    try {
      // Fetch organizations list using client
      const res = await authClient.organization.list();
      if (res.data) {
        setOrganizations(res.data);
        if (res.data.length > 0) {
          // Find or default to active
          setActiveOrg(res.data[0]);
        }
      }
    } catch (e: any) {
      console.error(e);
      showNotification("Error loading organizations", "error");
    } finally {
      setLoadingOrgs(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Load roles when activeOrg changes
  useEffect(() => {
    if (!activeOrg) {
      setRoles([]);
      return;
    }
    loadRoles();
  }, [activeOrg]);

  const loadRoles = async () => {
    if (!activeOrg) return;
    setLoadingRoles(true);
    try {
      const res = await fetch(`/api/organizations/${activeOrg.id}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data || []);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to load roles");
      }
    } catch (e: any) {
      console.error(e);
      showNotification(e.message || "Failed to load roles", "error");
    } finally {
      setLoadingRoles(false);
    }
  };

  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Create Organization Handler
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    setCreatingOrg(true);
    try {
      const slug = newOrgName.toLowerCase().replace(/\s+/g, "-");
      const res = await authClient.organization.create({
        name: newOrgName,
        slug: slug,
      });

      if (res.error) {
        throw new Error(res.error.message || "Failed to create organization");
      }

      showNotification(`Organization "${newOrgName}" created successfully!`, "success");
      setNewOrgName("");
      // Refresh organizations
      await fetchOrganizations();
    } catch (err: any) {
      showNotification(err.message || "Error creating organization", "error");
    } finally {
      setCreatingOrg(false);
    }
  };

  // Toggle permission flag during creation
  const handleTogglePerm = (resource: string, action: string) => {
    setNewRolePermissions((prev) => {
      const current = prev[resource] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  };

  const handleToggleEditPerm = (resource: string, action: string) => {
    setEditingRolePerms((prev) => {
      const current = prev[resource] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [resource]: updated };
    });
  };

  // Create Dynamic Custom Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !activeOrg) return;
    setCreatingRole(true);
    try {
      const roleSlug = newRoleName.toLowerCase().replace(/\s+/g, "-");
      const res = await fetch(`/api/organizations/${activeOrg.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: roleSlug,
          permission: newRolePerms,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create dynamic role");
      }

      showNotification(`Custom role "${roleSlug}" defined and synced!`, "success");
      setNewRoleName("");
      setNewRolePermissions({
        document: ["read"],
        ticket: ["read"],
        transaction: ["read"],
      });
      loadRoles();
    } catch (err: any) {
      showNotification(err.message || "Failed to create role", "error");
    } finally {
      setCreatingRole(false);
    }
  };

  // Begin updating permission set of custom roles
  const handleStartEdit = (roleItem: any) => {
    setEditingRole(roleItem);
    // Parse permission string into object
    let perms: Record<string, string[]> = {};
    try {
      perms = typeof roleItem.permission === "string" 
        ? JSON.parse(roleItem.permission)
        : (roleItem.permission || {});
    } catch {
      perms = {};
    }
    setEditingRolePerms(perms);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !activeOrg) return;
    setUpdatingRole(true);
    try {
      const res = await fetch(`/api/organizations/${activeOrg.id}/roles/${editingRole.role || editingRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          permission: editingRolePerms,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update role");
      }

      showNotification(`Role permissions updated!`, "success");
      setEditingRole(null);
      loadRoles();
    } catch (err: any) {
      showNotification(err.message || "Failed to update role", "error");
    } finally {
      setUpdatingRole(false);
    }
  };

  // Delete Dynamic Role
  const handleDeleteRole = async (roleNameOrId: string) => {
    if (!confirm("Are you sure you want to delete this custom role? This will revoke access for all members currently holding this role.")) return;
    try {
      const res = await fetch(`/api/organizations/${activeOrg.id}/roles/${roleNameOrId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete role");
      }

      showNotification("Role removed successfully.", "success");
      // If we deleted the role we were editing, close the form
      if (editingRole && (editingRole.role === roleNameOrId || editingRole.id === roleNameOrId)) {
        setEditingRole(null);
      }
      loadRoles();
    } catch (err: any) {
      showNotification(err.message || "Error deleting role", "error");
    }
  };

  // Sandbox permission check simulation
  const checkSandboxPermission = () => {
    // Built-in rules
    if (previewRole === "owner") return true;
    if (previewRole === "admin") {
      // Admins have all rights except deleting organizations which is blocked by system
      return true;
    }
    if (previewRole === "member") {
      if (previewResource === "document" && previewAction === "read") return true;
      if (previewResource === "ticket" && (previewAction === "create" || previewAction === "read")) return true;
      if (previewResource === "transaction" && previewAction === "read") return true;
      return false;
    }

    // Dynamic role check
    const matchedRole = roles.find((r) => r.role === previewRole);
    if (!matchedRole) return false;

    let parsedPerms: Record<string, string[]> = {};
    try {
      parsedPerms = typeof matchedRole.permission === "string" 
        ? JSON.parse(matchedRole.permission) 
        : matchedRole.permission;
    } catch {
      parsedPerms = {};
    }

    const resourceActions = parsedPerms[previewResource] || [];
    return resourceActions.includes(previewAction);
  };

  const hasPerm = checkSandboxPermission();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-800 p-6 flex flex-col gap-6 shrink-0 bg-neutral-900/40">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-heading text-lg font-bold tracking-wider text-primary">LUCAP</span>
            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded font-mono uppercase tracking-widest">Enterprise</span>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Dynamic Access Control Panel</p>
        </div>

        <hr className="border-neutral-800" />

        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 px-2">Workspace</p>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors">
            <Building2 className="size-4" /> Organizations Settings
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary transition-colors">
            <Shield className="size-4 text-primary" /> Dynamic Role CRUD
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800/50 hover:text-white transition-colors">
            <Users className="size-4" /> Team Memberships
          </a>
        </div>

        <div className="mt-auto">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-950/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400 animate-pulse" />
              <span className="text-xs font-semibold text-amber-300">Direct Engine Integration</span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Better Auth's native dynamic roles are stored directly in postgres storage, evaluated securely on every request.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* Floating notifications */}
        {message && (
          <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
            message.type === "success" 
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-800" 
              : "bg-rose-955/90 text-rose-300 border-rose-800"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="size-5 shrink-0" /> : <XCircle className="size-5 shrink-0" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-900">
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading">Dynamic Access Control Settings</h1>
            <p className="text-sm text-neutral-400 mt-1">Configure custom runtime roles for secure resources.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-neutral-500">Selected Organization</span>
              <select 
                value={activeOrg?.id || ""} 
                onChange={(e) => {
                  const matched = organizations.find(o => o.id === e.target.value);
                  if (matched) setActiveOrg(matched);
                }}
                className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1 text-sm text-white font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {loadingOrgs ? (
          <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : organizations.length === 0 ? (
          /* Empty State - Create First Organization */
          <div className="max-w-md mx-auto py-20 flex flex-col items-center text-center gap-6">
            <div className="size-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
              <Building2 className="size-8 text-neutral-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">No Organizations Found</h2>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                Better Auth plugins rely on organizations representing isolated tenants. Create your corporate workspace to enable role scopes.
              </p>
            </div>
            <form onSubmit={handleCreateOrg} className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-1.5 text-left">
                <Label htmlFor="org-name" className="text-neutral-300">Organization / Tenant Title</Label>
                <Input 
                  id="org-name"
                  placeholder="e.g. SARL Méditerranée" 
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>
              <Button type="submit" disabled={creatingOrg} className="w-full">
                {creatingOrg ? "Creating Workspace..." : "Create Organization"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle main section: Roles Listing & Management */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              
              {/* Active Roles & Permissions Manifest card */}
              <Card className="bg-neutral-950 border-neutral-900 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Permission Mapping Grid</CardTitle>
                      <CardDescription>Runtime roles inside `{activeOrg?.name}`</CardDescription>
                    </div>
                    {loadingRoles && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  
                  {/* Default Roles Info */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Built-In Scopes (Immutables)</h3>
                    
                    {/* Owner Row */}
                    <div className="p-4 rounded-xl border border-neutral-800/40 bg-neutral-900/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">owner</span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">All Powerful</span>
                        </div>
                        <span className="text-xs text-neutral-500 font-mono">System Built-In</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {RESOURCES.map(r => (
                          <span key={r.id} className="text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-neutral-400">
                            {r.name}: <span className="text-emerald-400 font-semibold font-mono">all permissions</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Admin Row */}
                    <div className="p-4 rounded-xl border border-neutral-800/40 bg-neutral-900/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">admin</span>
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Administrative</span>
                        </div>
                        <span className="text-xs text-neutral-500 font-mono">System Built-In</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {RESOURCES.map(r => (
                          <span key={r.id} className="text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-neutral-400">
                            {r.name}: <span className="text-emerald-400 font-semibold font-mono">create, read, update, delete</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Member Row */}
                    <div className="p-4 rounded-xl border border-neutral-800/40 bg-neutral-900/10 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">member</span>
                          <span className="text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700/50 px-2 py-0.5 rounded">Basic Access</span>
                        </div>
                        <span className="text-xs text-neutral-500 font-mono">System Default</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-neutral-400">
                          Documents: <span className="text-amber-500 font-mono">read</span>
                        </span>
                        <span className="text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-neutral-400">
                          Support Tickets: <span className="text-amber-500 font-mono">create, read</span>
                        </span>
                        <span className="text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-neutral-400">
                          Transactions: <span className="text-amber-500 font-mono">read</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Roles section */}
                  <hr className="border-neutral-900" />
                  
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest flex items-center justify-between">
                      <span>Custom Runtime Roles (Postgres Stores)</span>
                      <span className="font-mono text-neutral-600 text-[10px] lowercase">dynamically created</span>
                    </h3>

                    {roles.length === 0 ? (
                      <div className="text-center p-8 rounded-xl border border-dashed border-neutral-800 text-neutral-500">
                        <Info className="size-5 mx-auto text-neutral-600 mb-2" />
                        <p className="text-sm">No custom roles defined yet.</p>
                        <p className="text-[11px] text-neutral-600 mt-1">Configure your first custom role on the right panel.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {roles.map((roleItem) => {
                          let permData: Record<string, string[]> = {};
                          try {
                            permData = typeof roleItem.permission === "string" 
                              ? JSON.parse(roleItem.permission) 
                              : roleItem.permission;
                          } catch {
                            permData = {};
                          }

                          return (
                            <div 
                              key={roleItem.id} 
                              className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                                editingRole && editingRole.id === roleItem.id 
                                  ? "border-primary/50 bg-primary/5" 
                                  : "border-neutral-800 bg-neutral-900/20"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm font-mono text-primary">{roleItem.role}</span>
                                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">Dynamic</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    size="icon-xs" 
                                    variant="ghost" 
                                    onClick={() => handleStartEdit(roleItem)}
                                    title="Edit permissions Set"
                                  >
                                    <Edit3 className="size-3.5 text-neutral-400 hover:text-white" />
                                  </Button>
                                  <Button 
                                    size="icon-xs" 
                                    variant="destructive" 
                                    onClick={() => handleDeleteRole(roleItem.id || roleItem.role)}
                                    title="Delete role permanently"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Permissions detail */}
                              <div className="flex flex-wrap gap-2">
                                {RESOURCES.map((res) => {
                                  const actions = permData[res.id] || [];
                                  if (actions.length === 0) return null;
                                  return (
                                    <span key={res.id} className="text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 text-neutral-300">
                                      {res.name}: <span className="text-emerald-400 font-mono font-medium">{actions.join(", ")}</span>
                                    </span>
                                  );
                                })}
                                {Object.values(permData).flat().length === 0 && (
                                  <span className="text-xs text-neutral-600 italic">No resource permissions assigned.</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Sandbox Tester Simulation */}
              <Card className="bg-neutral-950 border-neutral-900 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="size-5 text-indigo-400" />
                    Interactive Access Sandbox Checker
                  </CardTitle>
                  <CardDescription>Simulates role-permission query instantly based on live structures</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    
                    {/* Role Pick */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-neutral-400 text-xs">Role Scope</Label>
                      <select 
                        value={previewRole} 
                        onChange={(e) => setPreviewRole(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="owner">owner (Built-in)</option>
                        <option value="admin">admin (Built-in)</option>
                        <option value="member">member (Built-in)</option>
                        {roles.map((r) => (
                          <option key={r.id} value={r.role}>{r.role} (Custom)</option>
                        ))}
                      </select>
                    </div>

                    {/* Resource Pick */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-neutral-400 text-xs">Target Resource</Label>
                      <select 
                        value={previewResource} 
                        onChange={(e) => setPreviewResource(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-xs text-white"
                      >
                        {RESOURCES.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Action Pick */}
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-neutral-400 text-xs">Action Requested</Label>
                      <select 
                        value={previewAction} 
                        onChange={(e) => setPreviewAction(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-1.5 text-xs text-white"
                      >
                        {ACTIONS.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Check Result */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-neutral-800/80 bg-neutral-900/30 h-full">
                      <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Verdict</span>
                      <div className="mt-1 flex items-center gap-1.5">
                        {hasPerm ? (
                          <>
                            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                            <span className="text-xs font-semibold text-emerald-400 font-mono">GRANTED</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="size-4 text-rose-400 shrink-0" />
                            <span className="text-xs font-semibold text-rose-400 font-mono">DENIED</span>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Right Form column: Create / Edit Modals as cards */}
            <div className="flex flex-col gap-8">
              
              {/* Editing Form: only active when a role is clicked */}
              {editingRole && (
                <Card className="bg-neutral-950 border-primary/40 rounded-2xl overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-indigo-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-md font-bold flex items-center justify-between">
                      <span>Edit Custom Role</span>
                      <span className="font-mono text-xs text-primary">@{editingRole.role}</span>
                    </CardTitle>
                    <CardDescription>Adjust current permissions for runtime role</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleUpdateRole}>
                    <CardContent className="flex flex-col gap-4">
                      
                      <div className="space-y-4">
                        <Label className="text-neutral-400 text-xs">Permission Mapping</Label>
                        
                        {RESOURCES.map((res) => {
                          const ResourceIcon = res.icon;
                          return (
                            <div key={res.id} className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-850 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <ResourceIcon className="size-4 text-primary shrink-0" />
                                <span className="text-xs font-semibold">{res.name}</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1">
                                {ACTIONS.map((act) => {
                                  const isChecked = (editingRolePerms[res.id] || []).includes(act.id);
                                  return (
                                    <button
                                      key={act.id}
                                      type="button"
                                      onClick={() => handleToggleEditPerm(res.id, act.id)}
                                      className={`px-1.5 py-1 text-[10px] font-medium rounded border tracking-tight transition-colors ${
                                        isChecked 
                                          ? "bg-primary/25 border-primary/40 text-primary-foreground font-semibold" 
                                          : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300"
                                      }`}
                                    >
                                      {act.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs border-neutral-800 text-neutral-300" 
                        onClick={() => setEditingRole(null)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        size="sm" 
                        className="flex-1 text-xs bg-primary text-white" 
                        disabled={updatingRole}
                      >
                        {updatingRole ? "Saving..." : "Save Config"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              )}

              {/* Create Role card */}
              <Card className="bg-neutral-950 border-neutral-900 rounded-2xl overflow-hidden shadow-xl">
                <CardHeader>
                  <CardTitle className="text-md font-bold flex items-center gap-2">
                    <Plus className="size-4 text-primary" />
                    Define New Role
                  </CardTitle>
                  <CardDescription>Creates a runtime role stored in Postgres adapter</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateRole}>
                  <CardContent className="flex flex-col gap-5">
                    
                    {/* Role Id Field */}
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="role-name" className="text-neutral-300">Identifier Name</Label>
                      <Input 
                        id="role-name" 
                        placeholder="e.g. auditor, compliance" 
                        required 
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-primary"
                      />
                    </div>

                    {/* Permissions builder */}
                    <div className="space-y-4">
                      <Label className="text-neutral-400 text-xs">Permission Matrix</Label>
                      
                      {RESOURCES.map((res) => {
                        const ResourceIcon = res.icon;
                        return (
                          <div key={res.id} className="p-3 bg-neutral-900/50 rounded-xl border border-neutral-850 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <ResourceIcon className="size-4 text-primary shrink-0" />
                              <span className="text-xs font-semibold">{res.name}</span>
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                              {ACTIONS.map((act) => {
                                const isChecked = (newRolePerms[res.id] || []).includes(act.id);
                                return (
                                  <button
                                    key={act.id}
                                    type="button"
                                    onClick={() => handleTogglePerm(res.id, act.id)}
                                    className={`px-1.5 py-1 text-[10px] font-medium rounded border tracking-tight transition-colors ${
                                      isChecked 
                                        ? "bg-primary/25 border-primary/40 text-primary-foreground font-semibold" 
                                        : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300"
                                    }`}
                                  >
                                    {act.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      disabled={creatingRole} 
                      className="w-full bg-primary hover:bg-primary/80 transition-all font-semibold flex items-center justify-center gap-1.5"
                    >
                      <span>Create Custom Role</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </CardFooter>
                </form>
              </Card>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
