import { useCallback, useMemo, useState } from "react"

interface UseSelectionSetOptions<T, K extends string | number> {
  items: T[]
  getKey: (item: T, index: number) => K
  /** Filter items that can be selected. Default: all items */
  canSelect?: (item: T) => boolean
  /** Whether to select all selectable items by default. Default: true */
  defaultSelectAll?: boolean
}

interface UseSelectionSetReturn<T, K extends string | number> {
  selectedKeys: Set<K>
  selectedItems: T[]
  selectedCount: number
  isSelected: (key: K) => boolean
  isAllSelected: boolean
  toggle: (key: K) => void
  toggleAll: () => void
  selectAll: () => void
  deselectAll: () => void
}

export function useSelectionSet<T, K extends string | number>({
  items,
  getKey,
  canSelect = () => true,
  defaultSelectAll = true
}: UseSelectionSetOptions<T, K>): UseSelectionSetReturn<T, K> {
  const selectableItems = useMemo(
    () => items.filter((item) => canSelect(item)),
    [items, canSelect]
  )

  const [selectedKeys, setSelectedKeys] = useState<Set<K>>(() => {
    if (defaultSelectAll) {
      return new Set(selectableItems.map((item, idx) => getKey(item, idx)))
    }
    return new Set()
  })

  const toggle = useCallback((key: K) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedKeys(
      new Set(selectableItems.map((item, idx) => getKey(item, idx)))
    )
  }, [selectableItems, getKey])

  const deselectAll = useCallback(() => {
    setSelectedKeys(new Set())
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedKeys((prev) => {
      if (prev.size === selectableItems.length) {
        return new Set()
      }
      return new Set(selectableItems.map((item, idx) => getKey(item, idx)))
    })
  }, [selectableItems, getKey])

  const selectedItems = useMemo(() => {
    return items.filter((item, idx) => selectedKeys.has(getKey(item, idx)))
  }, [items, selectedKeys, getKey])

  const isSelected = useCallback(
    (key: K) => selectedKeys.has(key),
    [selectedKeys]
  )

  const isAllSelected = selectedKeys.size === selectableItems.length

  return {
    selectedKeys,
    selectedItems,
    selectedCount: selectedKeys.size,
    isSelected,
    isAllSelected,
    toggle,
    toggleAll,
    selectAll,
    deselectAll
  }
}
