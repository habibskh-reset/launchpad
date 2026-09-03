import { can, type Entitlement } from "@/domain/entitlements";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export function useCan(entitlement: Entitlement): boolean {
  const role = useWorkspaceStore((s) => s.role);
  const plan = useWorkspaceStore((s) => s.org.plan);
  return can(role, plan, entitlement);
}
