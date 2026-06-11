import { auth } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { orgId: string } }) {
  try {
    const org = await auth.api.getFullOrganization({
      query: {
        organizationId: params.orgId,
      },
      headers: request.headers,
    });
    return new Response(JSON.stringify(org), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unauthorized or Not Found' }), { status: error.status || 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { orgId: string } }) {
  try {
    const body = await request.json();
    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.slug) data.slug = body.slug;

    const org = await auth.api.updateOrganization({
      body: {
        data,
      },
      headers: request.headers,
    });
    return new Response(JSON.stringify(org), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to update organization' }), { status: error.status || 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { orgId: string } }) {
  try {
    await auth.api.deleteOrganization({
      body: {
        organizationId: params.orgId,
      },
      headers: request.headers,
    });
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to delete organization' }), { status: error.status || 400 });
  }
}
