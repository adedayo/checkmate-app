import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind
 * utilities. Used by every helm (Spartan UI) primitive.
 */
export function hlm(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Alias matching the shadcn/spartan convention. */
export const cn = hlm;
