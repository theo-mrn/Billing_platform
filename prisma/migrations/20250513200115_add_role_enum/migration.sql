/*
  Warnings:

  - The `role` column on the `OrganizationInvitation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `role` column on the `UserOrganization` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- AlterTable
ALTER TABLE "OrganizationInvitation" DROP COLUMN "role",
ADD COLUMN     "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "UserOrganization" DROP COLUMN "role",
ADD COLUMN     "role" "OrganizationRole" NOT NULL DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "OrganizationInvitation" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "OrganizationInvitation" ALTER COLUMN "role" TYPE "OrganizationRole" USING (
  CASE role
    WHEN 'OWNER' THEN 'OWNER'::"OrganizationRole"
    WHEN 'ADMIN' THEN 'ADMIN'::"OrganizationRole"
    WHEN 'MEMBER' THEN 'MEMBER'::"OrganizationRole"
    WHEN 'VIEWER' THEN 'VIEWER'::"OrganizationRole"
    ELSE 'MEMBER'::"OrganizationRole"
  END
);
ALTER TABLE "OrganizationInvitation" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "UserOrganization" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "UserOrganization" ALTER COLUMN "role" TYPE "OrganizationRole" USING (
  CASE role
    WHEN 'OWNER' THEN 'OWNER'::"OrganizationRole"
    WHEN 'ADMIN' THEN 'ADMIN'::"OrganizationRole"
    WHEN 'MEMBER' THEN 'MEMBER'::"OrganizationRole"
    WHEN 'VIEWER' THEN 'VIEWER'::"OrganizationRole"
    ELSE 'MEMBER'::"OrganizationRole"
  END
);
ALTER TABLE "UserOrganization" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
