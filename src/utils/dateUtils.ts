/**
 * Formats a timestamp into human-readable relative time (e.g. "Edited 2 hours ago").
 */
export function formatRelativeTime(timestamp: number | string | Date): string {
  if (!timestamp) return 'Recently edited';
  
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  
  if (isNaN(time)) return 'Recently edited';
  
  const diffSec = Math.max(0, Math.floor((now - time) / 1000));

  if (diffSec < 45) return 'Edited just now';
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Edited ${diffMin}m ago`;
  
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Edited ${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Edited yesterday';
  if (diffDays < 7) return `Edited ${diffDays}d ago`;
  
  return `Edited ${new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}
