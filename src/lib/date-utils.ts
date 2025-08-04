import { format } from 'date-fns';

/**
 * Standard date formats used across the application
 */
export const DATE_FORMATS = {
  // Display formats
  SHORT_DATE: 'dd/MM/yy', // 24/07/25
  MEDIUM_DATE: 'dd/MM/yyyy', // 24/07/2025
  LONG_DATE: 'dd MMMM yyyy', // 24 July 2025
  DAY_SHORT: 'EEE', // Mon, Tue, Wed
  DAY_MONTH: 'dd/MM', // 24/07
  TIME: 'HH:mm', // 14:30
  DATETIME: 'dd/MM/yy HH:mm', // 24/07/25 14:30

  // API formats (ISO)
  API_DATE: 'yyyy-MM-dd', // 2025-07-24
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", // 2025-07-24T14:30:00.000Z
} as const;

/**
 * Format date for display in the UI
 */
export function formatDisplayDate(
  date: Date | string,
  formatType: keyof typeof DATE_FORMATS = 'SHORT_DATE',
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, DATE_FORMATS[formatType]);
}

/**
 * Format date for API calls
 */
export function formatApiDate(date: Date): string {
  return format(date, DATE_FORMATS.API_DATE);
}

/**
 * Format datetime for API calls (full ISO string)
 */
export function formatApiDateTime(date: Date): string {
  return date.toISOString();
}

/**
 * Create start of day for date range queries
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Create end of day for date range queries
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Format timesheet working hours for display
 */
export function formatWorkingHours(
  hours: number | string | null | undefined,
): string {
  // Handle edge cases
  if (hours === null || hours === undefined || hours === '') {
    return '0.0h';
  }

  // Convert to number if it's a string
  const numericHours = typeof hours === 'string' ? parseFloat(hours) : hours;

  // Check if it's a valid number
  if (isNaN(numericHours) || !isFinite(numericHours)) {
    return '0.0h';
  }

  return `${numericHours.toFixed(1)}h`;
}

/**
 * Format week range for display
 */
export function formatWeekRange(startDate: Date, endDate: Date): string {
  return `${formatDisplayDate(startDate, 'DAY_MONTH')} - ${formatDisplayDate(
    endDate,
    'DAY_MONTH',
  )}`;
}

/**
 * Safely convert Prisma Decimal (string) to number
 */
export function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? 0 : value;
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
}
