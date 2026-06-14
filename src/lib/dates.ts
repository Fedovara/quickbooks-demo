import { format, differenceInCalendarDays, parseISO, isToday, isPast } from 'date-fns'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM dd, yyyy')
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'yyyy-MM-dd')
}

export function daysBetween(dateStr: string, referenceDate: Date = new Date()): number {
  return differenceInCalendarDays(referenceDate, parseISO(dateStr))
}

export function isDateOverdue(dueDateStr: string): boolean {
  const dueDate = parseISO(dueDateStr)
  return isPast(dueDate) && !isToday(dueDate)
}

export function isDateDueToday(dueDateStr: string): boolean {
  return isToday(parseISO(dueDateStr))
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}
