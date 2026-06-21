import { Role } from "@/lib/generated/prisma/client/prisma/enums";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { uuid } from "better-auth";


async function main() {
  // Create services
  const services = [
    { name: "VPN d'Entreprise", description: "Provisioning and VPN setup" },
    { name: "ERP Implementation", description: "ERP setup and accounting integration" },
    { name: "Email Archiving", description: "Long-term email archiving" },
  ];

  for (const s of services) {
    const slug = s.name.toLowerCase().replace(/\s+/g, '-');
    await prisma.service.upsert({
      where: { slug },
      update: {},
      create: {
        name: s.name,
        slug,
        description: s.description,
      },
    });
  }

  // Admin user
  const adminPassword = await bcrypt.hash("adminpass123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@lucap.local" },
    update: { name: "Arcelin (Admin)" },
    create: {
      email: "admin@lucap.local",
      name: "Arcelin (Admin)",
      role: Role.ADMIN,
      password: adminPassword,
    },
  });

  // Create tenant SARL Méditerranée
  const tenant = await prisma.tenant.upsert({
    where: { slug: "sarl-mediterranee" },
    update: {},
    create: {
      name: "SARL Méditerranée",
      slug: "sarl-mediterranee",
    },
  });

  // Attach a client user
  const clientUser = await prisma.user.upsert({
    where: { email: "contact@mediterranee.tn" },
    update: {},
    create: {
      email: "contact@mediterranee.tn",
      name: "SARL Méditerranée",
      role: Role.CLIENT,
      password: await bcrypt.hash("clientpass", 10),
      tenantId: tenant.id,
    },
  });

  // Seed documents (from prototype)
  const docs = [
    { filename: 'facture_fibre_telecom_octobre.pdf', size: '1.2 Mo', date: '2023-10-12', classification: 'Invoice' },
    { filename: 'quittance_loyer_bureaux_lac.pdf', size: '2.4 Mo', date: '2023-10-01', classification: 'Receipt' },
    { filename: 'contrat_fourniture_dell.pdf', size: '5.1 Mo', date: '2023-09-15', classification: 'Agreement' },
    { filename: 'mecanismes_fiscaux_tunisie_2024.pdf', size: '8.4 Mo', date: '2023-09-05', classification: 'Reference' },
    { filename: 'statuts_sarl_mediterranee_signes.pdf', size: '3.6 Mo', date: '2023-08-28', classification: 'Legal' }
  ];

  for (const d of docs) {
    await prisma.document.create({
      data: {
        filename: d.filename,
        size: d.size,
        tenant: { connect: { id: tenant.id } },
        bucket: 'lucap-clients',
        path: `tenants/${tenant.slug}/${d.filename}`,
        classification: d.classification,
        encryption: 'AES-256-GCM',
        wrappedDek: 'SEED_PLACEHOLDER',
        iv: 'SEED_IV',
      },
    });
  }

  // Seed achats
  const achats = [
    { date: new Date('2023-10-12'), reference: 'FACT-2023-089', counterparty: 'STE Tunisie Télécom', typeLabel: 'SERVICES', ht: 1240.0, tva: 235.6, ttc: 1475.6, status: 'Payé' },
    { date: new Date('2023-10-15'), reference: 'INV/772/2023', counterparty: 'Dell Solutions S.A.', typeLabel: 'MATÉRIEL', ht: 5400.0, tva: 1026.0, ttc: 6426.0, status: 'Payé' },
    { date: new Date('2023-10-18'), reference: 'LC-2023-445', counterparty: 'Local Prestige S.A.R.L', typeLabel: 'LOYER', ht: 2500.0, tva: 0.0, ttc: 2500.0, status: 'En attente' }
  ];

  for (const a of achats) {
    await prisma.transaction.create({
      data: {
        tenantId: tenant.id,
        kind: 'ACHAT',
        date: a.date,
        reference: a.reference,
        counterparty: a.counterparty,
        typeLabel: a.typeLabel,
        ht: a.ht,
        tva: a.tva,
        ttc: a.ttc,
        status: a.status,
      }
    });
  }

  // Seed ventes
  const ventes = [
    { date: new Date('2023-10-12'), reference: 'FA-2023-0842', counterparty: 'SOTEMAIL SA', typeLabel: 'VENTE MARCHANDISES 19%', ht: 10000.0, tva: 1900.0, ttc: 11900.0, rs: 119.0, status: 'Payé' },
    { date: new Date('2023-10-10'), reference: 'FA-2023-0841', counterparty: 'TECH-SOLUTIONS SARL', typeLabel: 'VENTE EXPORT', ht: 25450.0, tva: 0.0, ttc: 25450.0, rs: 0.0, status: 'Payé' },
    { date: new Date('2023-10-05'), reference: 'FA-2023-0840', counterparty: 'GLOBAL TRADING LTD', typeLabel: 'VENTE SERVICES 13%', ht: 5200.0, tva: 676.0, ttc: 5876.0, rs: 58.76, status: 'Payé' }
  ];

  for (const v of ventes) {
    await prisma.transaction.create({
      data: {
        tenantId: tenant.id,
        kind: 'VENTE',
        date: v.date,
        reference: v.reference,
        counterparty: v.counterparty,
        typeLabel: v.typeLabel,
        ht: v.ht,
        tva: v.tva,
        ttc: v.ttc,
        rs: v.rs,
        status: v.status,
      }
    });
  }

  // Seed tickets
  const t1 = await prisma.ticket.create({
    data: {
      tenantId: tenant.id,
      title: "Accès VPN d'Entreprise",
      service: "VPN d'Entreprise",
      channel: 'In-App',
      status: 'En cours',
      clientName: 'SARL Méditerranée'
    }
  });

  await prisma.reply.create({
    data: {
      ticketId: t1.id,
      author: 'staff',
      message: "Bonjour, votre passerelle de sécurité est en cours de provisionnement.",
      type: 'text'
    }
  });

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
