// Small display helpers for the replies screens.

/** "Just now", "5m", "3h", "2d", then a short date. */
export function shortTime(iso: string, now = Date.now()): string {
  const seconds = Math.floor((now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
  });
}

/** A full timestamp for hover text and screen readers. */
export function fullTime(iso: string): string {
  return new Date(iso).toLocaleString('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** What to call someone: their name, or their username if they have none. */
export function displayName(person: {
  name: string | null;
  username: string;
}): string {
  return person.name?.trim() || person.username;
}
