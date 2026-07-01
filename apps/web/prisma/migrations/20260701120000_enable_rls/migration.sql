-- Enable Row Level Security
-- We use "users" because of @@map("users") in schema.prisma

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Create policy for users based on activeCompanyId
-- We use current_setting('app.current_company_id', true) so it doesn't fail if not set
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'tenant_isolation') THEN
        CREATE POLICY tenant_isolation ON "users"
        USING ("activeCompanyId" = current_setting('app.current_company_id', true));
    END IF;
END
$$;

-- Enable RLS for other core multi-tenant tables
-- Add more as needed: Invoice, Account, Customer, etc.
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Invoice' AND policyname = 'tenant_isolation') THEN
        CREATE POLICY tenant_isolation ON "Invoice"
        USING ("companyId" = current_setting('app.current_company_id', true));
    END IF;
END
$$;

ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Customer' AND policyname = 'tenant_isolation') THEN
        CREATE POLICY tenant_isolation ON "Customer"
        USING ("companyId" = current_setting('app.current_company_id', true));
    END IF;
END
$$;
