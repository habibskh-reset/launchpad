import type { OrgRole, PlanId } from "./org";

export type Entitlement =
  | "folders.create"
  | "folders.edit"
  | "links.create"
  | "links.edit"
  | "todos.edit"
  | "backup.export"
  | "backup.import"
  | "workspace.invite"
  | "billing.manage";

const PLAN_ENTITLEMENTS: Record<PlanId, ReadonlySet<Entitlement>> = {
  free: new Set([
    "folders.create",
    "folders.edit",
    "links.create",
    "links.edit",
    "todos.edit",
    "backup.export",
    "backup.import",
  ]),
  pro: new Set([
    "folders.create",
    "folders.edit",
    "links.create",
    "links.edit",
    "todos.edit",
    "backup.export",
    "backup.import",
    "workspace.invite",
    "billing.manage",
  ]),
};

const ROLE_ENTITLEMENTS: Record<OrgRole, ReadonlySet<Entitlement> | "all"> = {
  owner: "all",
  admin: "all",
  member: new Set([
    "folders.create",
    "folders.edit",
    "links.create",
    "links.edit",
    "todos.edit",
    "backup.export",
    "backup.import",
  ]),
  viewer: new Set(),
};

export function can(
  role: OrgRole,
  plan: PlanId,
  entitlement: Entitlement,
): boolean {
  const roleGrant = ROLE_ENTITLEMENTS[role];
  if (roleGrant !== "all" && !roleGrant.has(entitlement)) return false;
  return PLAN_ENTITLEMENTS[plan].has(entitlement);
}
