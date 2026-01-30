import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for merging Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge for deduplication
 *
 * @param inputs - Class values (strings, objects, arrays)
 * @returns Merged class string
 *
 * @example
 * cn("px-2 py-1", condition && "bg-blue-500")
 * // => "px-2 py-1 bg-blue-500" (if condition is true)
 *
 * @example
 * cn("px-2 px-4") // tailwind-merge resolves conflicts
 * // => "px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
