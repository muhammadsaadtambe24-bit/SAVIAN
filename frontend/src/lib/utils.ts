import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes with clsx + tailwind-merge */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Convert minutes from midnight to HH:MM string */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const formatMinutesToTime = minutesToTime


/** Convert HH:MM string to minutes from midnight */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** Format duration in minutes to human-readable string */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Department display config — colors + labels for P.Way, OHE, S&T */
export const DEPARTMENT_CONFIG = {
  P_WAY: { label: 'P. Way', color: '#f59e0b', bgClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  OHE: { label: 'OHE', color: '#3b82f6', bgClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  S_AND_T: { label: 'S&T', color: '#10b981', bgClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
} as const

/** Severity display config */
export const SEVERITY_CONFIG = {
  CRITICAL: { label: 'Critical', bgClass: 'bg-red-500/20 text-red-400 border-red-500/30' },
  HIGH: { label: 'High', bgClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  MEDIUM: { label: 'Medium', bgClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  LOW: { label: 'Low', bgClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
} as const

/** Train type color config for Marey chart */
export const TRAIN_TYPE_COLORS = {
  RAJDHANI: '#ef4444',
  VANDE_BHARAT: '#f97316',
  EXPRESS: '#3b82f6',
  MAIL: '#8b5cf6',
  PASSENGER: '#06b6d4',
  FREIGHT: '#6b7280',
} as const
