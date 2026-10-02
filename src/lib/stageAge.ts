/** Stage aging helpers for kanban/table cards. */

export const STAGE_STALE_DAYS = 3;

export function daysInStage(
  statusChangedAt?: string,
  createdAt?: string,
  now = Date.now()
): number {
  const raw = statusChangedAt || createdAt;
  if (!raw) return 0;
  const t = Date.parse(raw);
  if (!Number.isFinite(t)) return 0;
  const ms = Math.max(0, now - t);
  return Math.floor(ms / (24 * 60 * 60 * 1000));
}

export function formatStageAge(days: number): string {
  if (days < 1) return 'Today in stage';
  if (days === 1) return '1d in stage';
  return `${days}d in stage`;
}

export function isStaleInStage(days: number, threshold = STAGE_STALE_DAYS): boolean {
  return days >= threshold;
}
