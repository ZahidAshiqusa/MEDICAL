export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-PK', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatStaffId(id: string): string {
  return id.replace(/(.{4})/g, '$1-').slice(0, -1);
}

export function formatPhone(phone: string): string {
  if (phone.startsWith('+92')) return phone;
  if (phone.startsWith('0')) return '+92' + phone.slice(1);
  return '+92' + phone;
}

export function getRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isThisWeek(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo && date <= now;
}

export function isThisMonth(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export function isThisYear(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date.getFullYear() === now.getFullYear();
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

export function getWhatsAppLink(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleaned}`;
}

export function getPhoneLink(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  return `tel:${cleaned}`;
}
