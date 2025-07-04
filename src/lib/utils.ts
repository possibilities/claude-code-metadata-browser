import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const seconds = now - timestamp

  if (seconds < 5) {
    return 'now'
  }

  if (seconds < 60) {
    return seconds === 1 ? '1 second ago' : `${seconds} seconds ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const remainingMinutes = minutes % 60
    const remainingSeconds = seconds % 60
    if (hours === 1) {
      if (remainingMinutes === 0 && remainingSeconds === 0) return '1 hour ago'
      if (remainingMinutes === 0)
        return `1 hour ${remainingSeconds} seconds ago`
      return `1 hour ${remainingMinutes} minutes ago`
    }
    if (remainingMinutes === 0 && remainingSeconds === 0)
      return `${hours} hours ago`
    if (remainingMinutes === 0)
      return `${hours} hours ${remainingSeconds} seconds ago`
    return `${hours} hours ${remainingMinutes} minutes ago`
  }

  const days = Math.floor(hours / 24)
  if (days < 30) {
    const remainingHours = hours % 24
    const remainingMinutes = (minutes % (24 * 60)) % 60
    if (days === 1) {
      if (remainingHours === 0 && remainingMinutes === 0) return '1 day ago'
      if (remainingHours === 0) return `1 day ${remainingMinutes} minutes ago`
      return `1 day ${remainingHours} hours ago`
    }
    if (remainingHours === 0 && remainingMinutes === 0)
      return `${days} days ago`
    if (remainingHours === 0)
      return `${days} days ${remainingMinutes} minutes ago`
    return `${days} days ${remainingHours} hours ago`
  }

  const months = Math.floor(days / 30)
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`
  }

  const years = Math.floor(months / 12)
  return years === 1 ? '1 year ago' : `${years} years ago`
}
