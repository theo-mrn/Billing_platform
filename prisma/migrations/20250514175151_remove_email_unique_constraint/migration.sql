-- DropIndex
DROP INDEX "OrganizationInvitation_email_organizationId_key";

-- CreateIndex
CREATE INDEX "OrganizationInvitation_email_organizationId_idx" ON "OrganizationInvitation"("email", "organizationId");
