-- AlterEnum
BEGIN;
CREATE TYPE "AccountantUserRole_new" AS ENUM ('SUPER_ACCOUNTANT', 'ACCOUNTANT_STAFF');
ALTER TABLE "public"."AccountantUser" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "AccountantUser" ALTER COLUMN "role" TYPE "AccountantUserRole_new" USING ("role"::text::"AccountantUserRole_new");
ALTER TYPE "AccountantUserRole" RENAME TO "AccountantUserRole_old";
ALTER TYPE "AccountantUserRole_new" RENAME TO "AccountantUserRole";
DROP TYPE "public"."AccountantUserRole_old";
ALTER TABLE "AccountantUser" ALTER COLUMN "role" SET DEFAULT 'ACCOUNTANT_STAFF';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SystemRole_new" AS ENUM ('MODERATOR', 'STAFF');
ALTER TABLE "Role" ALTER COLUMN "systemRole" TYPE "SystemRole_new" USING ("systemRole"::text::"SystemRole_new");
ALTER TYPE "SystemRole" RENAME TO "SystemRole_old";
ALTER TYPE "SystemRole_new" RENAME TO "SystemRole";
DROP TYPE "public"."SystemRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "AccountantUser" ALTER COLUMN "role" SET DEFAULT 'ACCOUNTANT_STAFF';
