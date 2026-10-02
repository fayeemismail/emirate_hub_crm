export type LeadSource = 'online' | 'manual';

export function leadSourceLabel(source?: LeadSource | string): string {
  return source === 'manual' ? 'Manual' : 'Online';
}

export function leadSourceHint(source?: LeadSource | string): string {
  return source === 'manual'
    ? 'Created in the CRM'
    : 'Submitted via the website form';
}
