import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  return session;
}

async function requireAdmin(orgId: string, userId: string) {
  const membership = await prisma.organizationMembership.findFirst({ where: { organizationId: orgId, userId } });
  if (!membership || membership.role !== 'admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  return membership;
}

export async function GET(request: Request, { params }: { params: { orgId: string } }) {
  const session = await requireSession(request);
  const org = await prisma.organization.findUnique({ where: { id: params.orgId }, include: { memberships: true } });
  if (!org) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  // ensure user is member
  const isMember = await prisma.organizationMembership.findFirst({ where: { organizationId: org.id, userId: session.user.id } });
  if (!isMember) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  return new Response(JSON.stringify(org), { status: 200 });
}

export async function PATCH(request: Request, { params }: { params: { orgId: string } }) {
  const session = await requireSession(request);
  await requireAdmin(params.orgId, session.user.id);
  const body = await request.json();
  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.slug) data.slug = body.slug;
  const org = await prisma.organization.update({ where: { id: params.orgId }, data });
  return new Response(JSON.stringify(org), { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { orgId: string } }) {
  const session = await requireSession(request);
  await requireAdmin(params.orgId, session.user.id);
  await prisma.organization.delete({ where: { id: params.orgId } });
  return new Response(null, { status: 204 });
}
