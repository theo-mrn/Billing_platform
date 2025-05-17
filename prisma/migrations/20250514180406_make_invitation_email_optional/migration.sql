/*
  Warnings:

  - A unique constraint covering the columns `[email,organizationId]` on the table `OrganizationInvitation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "OrganizationInvitation_email_organizationId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationInvitation_email_organizationId_key" ON "OrganizationInvitation"("email", "organizationId");
