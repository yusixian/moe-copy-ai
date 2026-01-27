import { FloatingFocusManager, FloatingPortal } from "@floating-ui/react"
import { Icon } from "@iconify/react"
import { useMemo, useRef, useState } from "react"

import { useCombobox } from "./FloatingDropdown"

export interface ComboboxOption {
  id: string
  label: string
  description?: string
}

interface ComboboxProps {
  value: string | null
  onChange: (value: string) => void
  options: ComboboxOption[]
  placeholder?: string
  compact?: boolean
  inputId?: string
  /** 是否允许输入过滤 */
  filterable?: boolean
  /** 空状态文案 */
  emptyText?: string
  className?: string
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder = "",
  compact = false,
  inputId,
  filterable = true,
  emptyText = "无可用选项",
  className = ""
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 过滤选项
  const filteredOptions = useMemo(
    () =>
      filterable && value
        ? options.filter(
            (opt) =>
              opt.label.toLowerCase().includes(value.toLowerCase()) ||
              opt.id.toLowerCase().includes(value.toLowerCase())
          )
        : options,
    [filterable, value, options]
  )

  const {
    refs,
    floatingStyles,
    context,
    activeIndex,
    listRef,
    getReferenceProps,
    getFloatingProps,
    getItemProps
  } = useCombobox({
    items: filteredOptions,
    isOpen,
    onOpenChange: setIsOpen,
    getItemId: (opt) => opt.id,
    selectedValue: value
  })

  const handleSelect = (id: string) => {
    onChange(id)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      activeIndex !== null &&
      filteredOptions[activeIndex]
    ) {
      e.preventDefault()
      handleSelect(filteredOptions[activeIndex].id)
    }
  }

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(!isOpen)
  }

  // 样式
  const inputClass = compact
    ? "flex-1 rounded-l border border-r-0 border-line-1 bg-content px-2 py-1.5 text-xs text-text-1 focus:border-accent-blue focus:outline-none"
    : "flex-1 rounded-l-lg border border-r-0 border-line-1 bg-content p-2.5 text-sm text-text-1 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"

  const buttonClass = compact
    ? "flex items-center justify-center rounded-r border border-line-1 bg-content px-2 text-accent-blue hover:bg-accent-blue-ghost"
    : "flex items-center justify-center rounded-r-lg border border-line-1 bg-content px-3 text-accent-blue hover:bg-accent-blue-ghost"

  const dropdownClass = compact
    ? "z-50 max-h-40 overflow-auto rounded border border-line-1 bg-elevated-solid-1 shadow-lg"
    : "z-50 max-h-48 overflow-auto rounded-lg border border-line-1 bg-elevated-solid-1 shadow-lg"

  const optionClass = compact
    ? "cursor-pointer px-2 py-1.5 text-xs"
    : "cursor-pointer px-3 py-2 text-sm"

  return (
    <>
      <div
        ref={refs.setReference}
        className={className}
        {...getReferenceProps()}>
        <div className="flex">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={value || ""}
            onChange={handleInputChange}
            onClick={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder={placeholder}
            aria-autocomplete="list"
          />
          <button
            type="button"
            onClick={toggleDropdown}
            className={buttonClass}
            tabIndex={-1}>
            <Icon
              icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
              width={compact ? 14 : 18}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            initialFocus={-1}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={dropdownClass}
              {...getFloatingProps()}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, index) => (
                  <div
                    key={opt.id}
                    ref={(node) => {
                      listRef.current[index] = node
                    }}
                    role="option"
                    tabIndex={0}
                    aria-selected={index === activeIndex}
                    {...getItemProps({
                      onClick: () => handleSelect(opt.id)
                    })}
                    className={`${optionClass} ${
                      index === activeIndex
                        ? "bg-accent-blue-ghost-active text-accent-blue"
                        : opt.id === value
                          ? "bg-accent-blue-ghost text-accent-blue"
                          : "text-text-1 hover:bg-accent-blue-ghost-hover"
                    }`}>
                    {opt.label}
                    {opt.description && (
                      <span className="ml-1 text-text-3">
                        ({opt.description})
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className={`${optionClass} text-text-3`}>{emptyText}</div>
              )}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  )
}
