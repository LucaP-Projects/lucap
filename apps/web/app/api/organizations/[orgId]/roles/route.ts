import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const orgId = params.orgId;
    const reqHeaders = request.headers;

    const roles = await auth.api.listOrgRoles({
      query: {
        organizationId: orgId,
      },
      headers: reqHeaders,
    });

    return NextResponse.json(roles, { status: 200 });
  } catch (error: any) {
    console.error('Error listing roles:', error);
    return NextResponse.json({ error: error.message || 'Failed to list roles' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const orgId = params.orgId;
    const reqHeaders = request.headers;
    const body = await request.json();

    const { role, permission } = body;
    if (!role) {
      return NextResponse.json({ error: 'role name is required' }, { status: 400 });
    }

    const newRole = await auth.api.createOrgRole({
      body: {
        role,
        permission,
        organizationId: orgId,
      },
      headers: reqHeaders,
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: error.message || 'Failed to create role' }, { status: 400 });
  }
}
