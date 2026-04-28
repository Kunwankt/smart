export type AuditAction = "seed_building" | "update_building";

export interface AuditLog<TBefore = unknown, TAfter = unknown> {
  action: AuditAction;
  actor: "admin" | "system";
  at: Date;
  ip?: string | null;
  userAgent?: string | null;
  before?: TBefore;
  after?: TAfter;
}

