/**
 * Utility functions for translating option lists
 */

/**
 * Translates option objects by mapping labelKey to localized label
 * @param options Array of options with value and labelKey
 * @param t Translation function from useI18n
 * @returns Array of options with translated labels
 */
export function translateOptions<T extends { value: string; labelKey: string }>(
  options: T[],
  t: (key: string) => string
): Array<{ value: string; label: string }> {
  return options.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey)
  }))
}
