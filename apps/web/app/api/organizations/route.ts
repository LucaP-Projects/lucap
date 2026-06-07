import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  return session;
}

export async function GET(request: Request) {
  const session = await requireSession(request);
  const userId = session.user.id;
  const orgs = await prisma.organization.findMany({
    where: { memberships: { some: { userId } } },
    include: { memberships: { where: { userId } } },
  });
  return new Response(JSON.stringify(orgs), { status: 200 });
}

export async function POST(request: Request) {
  const session = await requireSession(request);
  const body = await request.json();
  const name = body?.name;
  const slug = body?.slug || (name || '').toLowerCase().replace(/\s+/g, '-');
  if (!name) return new Response(JSON.stringify({ error: 'name required' }), { status: 400 });

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      memberships: {
        create: [{ userId: session.user.id, role: 'admin' }],
      },
    },
  });

  return new Response(JSON.stringify(org), { status: 201 });
}
