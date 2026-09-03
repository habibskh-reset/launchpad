import type { AppUser } from "@/types/auth";

export type OrgRole = "owner" | "admin" | "member" | "viewer";

export type PlanId = "free" | "pro";

export interface Organization {
  id: string;
  name: string;
  plan: PlanId;
}

export interface Membership {
  orgId: string;
  userId: string;
  role: OrgRole;
}

export const DEFAULT_ORG: Organization = {
  id: "org_personal",
  name: "Personal",
  plan: "pro",
};

export function personalOrganization(user: AppUser): Organization {
  const name = user.displayName?.trim();
  return {
    id: `org_${user.uid}`,
    name: name ? `${name}'s workspace` : "Personal",
    plan: "pro",
  };
}

export function sessionFromUser(user: AppUser | null): {
  org: Organization;
  role: OrgRole;
} {
  if (!user) {
    return { org: DEFAULT_ORG, role: "viewer" };
  }
  return { org: personalOrganization(user), role: "owner" };
}
