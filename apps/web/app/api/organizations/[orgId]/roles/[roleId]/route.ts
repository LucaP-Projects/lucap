import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Get a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string; roleId: string } }
) {
  try {
    const orgId = params.orgId;
    const roleId = params.roleId;
    const reqHeaders = request.headers;

    const role = await auth.api.getOrgRole({
      query: {
        roleId: roleId,
        organizationId: orgId,
      },
      headers: reqHeaders,
    });

    return NextResponse.json(role, { status: 200 });
  } catch (error: any) {
    console.error('Error getting role:', error);
    return NextResponse.json({ error: error.message || 'Failed to get role' }, { status: 404 });
  }
}

// Update a role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgId: string; roleId: string } }
) {
  try {
    const orgId = params.orgId;
    const roleId = params.roleId;
    const reqHeaders = request.headers;
    const body = await request.json();

    const { data, permission } = body;

    const updatedRole = await auth.api.updateOrgRole({
      body: {
        roleId: roleId,
        organizationId: orgId,
        data: {
          ...data,
          ...(permission ? { permission } : {}),
        },
      },
      headers: reqHeaders,
    });

    return NextResponse.json(updatedRole, { status: 200 });
  } catch (error: any) {
    console.error('Error updating role:', error);
    return NextResponse.json({ error: error.message || 'Failed to update role' }, { status: 400 });
  }
}

// Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string; roleId: string } }
) {
  try {
    const orgId = params.orgId;
    const roleId = params.roleId;
    const reqHeaders = request.headers;

    await auth.api.deleteOrgRole({
      body: {
        roleId: roleId,
        organizationId: orgId,
      },
      headers: reqHeaders,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete role' }, { status: 400 });
  }
}
