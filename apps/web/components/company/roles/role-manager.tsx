"use client";

import { useState, useTransition } from "react";
import { Permission } from "@/lib/generated/prisma/enums";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCompanyRole } from "./actions";

interface RoleManagerProps {
  companyId: string;
}

export function RoleManager({ companyId }: RoleManagerProps) {
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleTogglePermission = (permission: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleCreateRole = () => {
    if (!roleName) {
      toast.error("Please enter a role name");
      return;
    }
    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    startTransition(async () => {
      try {
        await createCompanyRole(companyId, roleName, selectedPermissions);
        toast.success("Role created successfully");
        setRoleName("");
        setSelectedPermissions([]);
      } catch (error: any) {
        toast.error(error.message || "Failed to create role");
      }
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create Custom Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="role-name">Role Name</Label>
          <Input
            id="role-name"
            placeholder="e.g. Sales Manager"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <Label>Permissions</Label>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(Permission).map((permission) => (
              <div key={permission} className="flex items-center space-x-2">
                <Checkbox
                  id={`perm-${permission}`}
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={() => handleTogglePermission(permission)}
                />
                <label
                  htmlFor={`perm-${permission}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {permission.replace(/_/g, " ")}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleCreateRole} disabled={isPending}>
          {isPending ? "Creating..." : "Create Role"}
        </Button>
      </CardFooter>
    </Card>
  );
}
