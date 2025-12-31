import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cognitive System: Area-to-Color Mapping
// Each life area has a specific color for visual coherence
const AREA_COLOR_MAP: Record<string, string> = {
  'Espiritual': '#7c3aed',           // Purple - Spiritual/Transcendence
  'Financiera': '#064e3b',           // Dark Green - Financial/Growth
  'Laboral': '#1e3a8a',              // Dark Blue - Work/Professional
  'Pareja/familia/amistades': '#facc15', // Yellow - Relationships/Warmth
  // Additional common areas
  'Salud': '#22c55e',                // Green - Health/Vitality
  'Desarrollo Personal': '#8b5cf6',  // Violet - Personal Growth
  'Educación': '#0ea5e9',            // Cyan - Learning
  'Recreación': '#f97316',           // Orange - Fun/Leisure
}

// Default color when no area is selected or area not in mapping
const DEFAULT_AREA_COLOR = '#6b7280' // Gray

/**
 * Returns the hex color code associated with a life area name.
 * Falls back to default gray if the area is not mapped.
 * 
 * @param areaName - The name of the life area (e.g., "Financiera", "Espiritual")
 * @returns Hex color code string
 */
export function getAreaColor(areaName: string | null | undefined): string {
  if (!areaName) return DEFAULT_AREA_COLOR

  // Try exact match first
  if (AREA_COLOR_MAP[areaName]) {
    return AREA_COLOR_MAP[areaName]
  }

  // Try case-insensitive match
  const lowerName = areaName.toLowerCase()
  for (const [key, color] of Object.entries(AREA_COLOR_MAP)) {
    if (key.toLowerCase() === lowerName) {
      return color
    }
  }

  return DEFAULT_AREA_COLOR
}

/**
 * Returns all available area colors for reference
 */
export function getAreaColorMap(): Record<string, string> {
  return { ...AREA_COLOR_MAP }
}

/**
 * Formats a date/time string in a consistent way that avoids React hydration errors.
 * Uses explicit formatting to ensure server and client produce identical output.
 * 
 * @param dateString - ISO date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDateTime(
  dateString: string | Date | null | undefined,
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
  } = {}
): string {
  if (!dateString) return '';

  const { includeTime = true, includeSeconds = false } = options;

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    if (isNaN(date.getTime())) return '';

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    let result = `${day}/${month}/${year}`;

    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      if (includeSeconds) {
        const seconds = date.getSeconds().toString().padStart(2, '0');
        result += `, ${hours}:${minutes}:${seconds}`;
      } else {
        result += `, ${hours}:${minutes}`;
      }
    }

    return result;
  } catch {
    return '';
  }
}

/**
 * Formats just the date portion (no time)
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  return formatDateTime(dateString, { includeTime: false });
}
