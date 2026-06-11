import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const orgs = await auth.api.listOrganizations({
      headers: request.headers,
    });
    return new Response(JSON.stringify(orgs), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Unauthorized' }), { status: error.status || 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name;
    const slug = body?.slug || (name || '').toLowerCase().replace(/\s+/g, '-');
    if (!name) return new Response(JSON.stringify({ error: 'name required' }), { status: 400 });

    const org = await auth.api.createOrganization({
      body: {
        name,
        slug,
      },
      headers: request.headers,
    });

    return new Response(JSON.stringify(org), { status: 201, headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Failed to create organization' }), { status: error.status || 400 });
  }
}
