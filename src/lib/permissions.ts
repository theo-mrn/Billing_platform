export type OrganizationRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

interface RolePermissions {
  canManageOrganization: boolean;  // Modifier/Supprimer l'organisation
  canManageMembers: boolean;       // Inviter/Supprimer des membres
  canManageRoles: boolean;         // Modifier les rôles des membres
  canEditResources: boolean;       // Modifier les ressources
  canViewResources: boolean;       // Voir les ressources
}

export const ROLE_PERMISSIONS: Record<OrganizationRole, RolePermissions> = {
  OWNER: {
    canManageOrganization: true,
    canManageMembers: true,
    canManageRoles: true,
    canEditResources: true,
    canViewResources: true,
  },
  ADMIN: {
    canManageOrganization: false,
    canManageMembers: true,
    canManageRoles: true,
    canEditResources: true,
    canViewResources: true,
  },
  MEMBER: {
    canManageOrganization: false,
    canManageMembers: false,
    canManageRoles: false,
    canEditResources: true,
    canViewResources: true,
  },
  VIEWER: {
    canManageOrganization: false,
    canManageMembers: false,
    canManageRoles: false,
    canEditResources: false,
    canViewResources: true,
  },
};

export const ROLE_HIERARCHY: Record<OrganizationRole, number> = {
  OWNER: 3,
  ADMIN: 2,
  MEMBER: 1,
  VIEWER: 0,
};

// Vérifie si un rôle peut en gérer un autre
export function canManageRole(managerRole: OrganizationRole, targetRole: OrganizationRole): boolean {
  return ROLE_HIERARCHY[managerRole] > ROLE_HIERARCHY[targetRole];
}

// Vérifie si un utilisateur a une permission spécifique
export function hasPermission(role: OrganizationRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

// Liste des rôles qu'un utilisateur peut attribuer
export function getAssignableRoles(userRole: OrganizationRole): OrganizationRole[] {
  const userHierarchy = ROLE_HIERARCHY[userRole];
  return Object.entries(ROLE_HIERARCHY)
    .filter(([_, hierarchy]) => hierarchy < userHierarchy)
    .map(([role]) => role as OrganizationRole);
}

// Descriptions des rôles pour l'interface utilisateur
export const ROLE_DESCRIPTIONS: Record<OrganizationRole, string> = {
  OWNER: "Contrôle total de l'organisation",
  ADMIN: "Peut gérer les membres et les ressources",
  MEMBER: "Peut utiliser les ressources",
  VIEWER: "Accès en lecture seule",
}; 