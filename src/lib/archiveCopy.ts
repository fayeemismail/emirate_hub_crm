/** Shared UI copy so Resolved (final stage) vs Archive (soft-delete) stay distinct. */

export const ARCHIVE_CONFIRM_TITLE = 'Archive inquiry?';

export const ARCHIVE_CONFIRM_BUTTON = 'Archive';

export function archiveConfirmMessage(clientName: string): string {
  return `Hide ${clientName}'s inquiry from active views. You can restore it later from Archives. Use archive for spam or mistakes — completed work stays on the final board stage.`;
}

export const RESTORE_CONFIRM_TITLE = 'Restore inquiry?';

export const RESTORE_CONFIRM_BUTTON = 'Restore';

export function restoreConfirmMessage(clientName: string, stageTitle?: string): string {
  const stage = stageTitle ? ` on stage “${stageTitle}”` : '';
  return `Return ${clientName}'s inquiry to the live board${stage}.`;
}

export const ACTIVE_INQUIRIES_EMPTY =
  'Only active inquiries are listed here. Archived items are under Archives; completed work stays in the final stage.';
