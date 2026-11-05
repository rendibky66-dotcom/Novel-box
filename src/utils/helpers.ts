export const COVER_GRADIENTS = [
  { name: 'Royal Violet', from: '#4c1d95', to: '#1e1b4b', accent: '#c084fc', icon: 'sparkles' },
  { name: 'Amethyst Night', from: '#581c87', to: '#0f172a', accent: '#e9d5ff', icon: 'book' },
  { name: 'Deep Magenta', from: '#701a75', to: '#3b0764', accent: '#f472b6', icon: 'heart' },
  { name: 'Obsidian Velvet', from: '#2e1065', to: '#020617', accent: '#a855f7', icon: 'shield' },
  { name: 'Midnight Neon', from: '#3b0764', to: '#090514', accent: '#818cf8', icon: 'zap' },
  { name: 'Twilight Forest', from: '#1e1b4b', to: '#064e3b', accent: '#34d399', icon: 'compass' }
];

export function formatDateIndo(dateString?: string): string {
  if (!dateString) return 'Belum dibaca';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Baru saja';
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatMinutesToHours(minutes: number): string {
  if (!minutes || minutes <= 0) return '0 mnt';
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}j ${m}m` : `${h} jam`;
}
