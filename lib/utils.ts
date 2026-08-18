import { Gender } from '@/types';

/**
 * Generates a random 6-character alphanumeric room code
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Gets or creates a persistent session ID for this browser
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('ask_session_id');
  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem('ask_session_id', sessionId);
  }
  return sessionId;
}

/**
 * Simple UUID v4 generator
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formats gender for display
 */
export function formatGender(gender: Gender): string {
  switch (gender) {
    case 'male':
      return 'Male';
    case 'female':
      return 'Female';
    case 'prefer_not_to_say':
      return 'Prefer not to say';
    default:
      return '';
  }
}

/**
 * Gets a consistent pastel color from a name string
 */
export function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: '#FCE7F3', text: '#9D174D' }, // pink
    { bg: '#DBEAFE', text: '#1E40AF' }, // blue
    { bg: '#D1FAE5', text: '#065F46' }, // green
    { bg: '#FEF3C7', text: '#92400E' }, // yellow
    { bg: '#EDE9FE', text: '#5B21B6' }, // purple
    { bg: '#FFE4E6', text: '#9F1239' }, // rose
    { bg: '#E0F2FE', text: '#075985' }, // sky
    { bg: '#F3E8FF', text: '#6B21A8' }, // violet
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Stores the current user's member ID for a room
 */
export function saveMemberId(roomCode: string, memberId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`ask_member_${roomCode}`, memberId);
}

/**
 * Gets the current user's member ID for a room
 */
export function getMemberId(roomCode: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`ask_member_${roomCode}`);
}

/**
 * Format relative time
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
