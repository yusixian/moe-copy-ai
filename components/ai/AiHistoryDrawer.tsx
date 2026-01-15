import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import type { AiChatHistoryItem } from "~constants/types"
import {
  clearAiChatHistory,
  deleteAiChatHistoryItem,
  getAiChatHistory
} from "~utils/ai-service"

import SummaryResultDisplay from "./SummaryResultDisplay"

interface AiHistoryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const AiHistoryDrawer: React.FC<AiHistoryDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const [historyItems, setHistoryItems] = useState<AiChatHistoryItem[]>([])
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null)
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  // 加载历史记录
  const loadHistory = useCallback(async () => {
    if (isOpen) {
      setIsLoading(true)
      try {
        const history = await getAiChatHistory()
        setHistoryItems(history.items)
      } catch (error) {
        console.error("加载AI聊天历史记录失败:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }, [isOpen])

  // 删除历史记录项
  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteAiChatHistoryItem(id)
      setHistoryItems((prev) => prev.filter((item) => item.id !== id))
      toast.success("已删除记录")
    } catch (error) {
      console.error("删除历史记录失败:", error)
      toast.error("删除失败")
    }
  }, [])

  // 清空所有历史记录
  const handleClearAll = useCallback(async () => {
    if (confirm("确定要清空所有历史记录吗？此操作不可恢复!")) {
      try {
        await clearAiChatHistory()
        setHistoryItems([])
        toast.success("已清空所有历史记录")
      } catch (error) {
        console.error("清空历史记录失败:", error)
        toast.error("清空失败")
      }
    }
  }, [])

  // 导出历史记录为JSON
  const handleExport = useCallback(() => {
    try {
      const jsonString = JSON.stringify(historyItems, null, 2)
      const blob = new Blob([jsonString], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `ai-chat-history-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("导出成功")
    } catch (error) {
      console.error("导出历史记录失败:", error)
      toast.error("导出失败")
    }
  }, [historyItems])

  // 切换展开/折叠状态
  const toggleExpand = useCallback((id: string) => {
    setExpandedItemId((prev) => (prev === id ? null : id))
  }, [])

  // 切换完整提示词的展开/折叠状态
  const togglePromptExpand = useCallback(
    (itemId: string, e: React.MouseEvent) => {
      e.stopPropagation() // 防止触发父元素的点击事件
      setExpandedPrompts((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(itemId)) {
          newSet.delete(itemId)
        } else {
          newSet.add(itemId)
        }
        return newSet
      })
    },
    []
  )

  // 当抽屉打开时加载历史记录
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // 格式化日期时间
  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // 阻止事件冒泡
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩层，点击时关闭抽屉 */}
          <motion.div
            key="ai-history-drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* 抽屉内容，点击时阻止事件冒泡 */}
          <motion.div
            ref={drawerRef}
            key="ai-history-drawer"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            onClick={stopPropagation}
            className="fixed -inset-x-0.5 -bottom-1 z-50 flex h-[80vh] origin-bottom flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-indigo-100 border-b bg-sky-50 p-4">
              <h3 className="flex items-center font-semibold text-lg text-sky-600">
                <Icon
                  icon="mdi:history"
                  className="mr-2"
                  width="24"
                  height="24"
                />
                聊天历史记录
              </h3>
              <div className="flex gap-2">
                {historyItems.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleExport}
                      className="flex items-center rounded-md bg-blue-100 px-2 py-1 font-medium text-blue-600 text-xs hover:bg-blue-200">
                      <Icon
                        icon="line-md:cloud-alt-download"
                        className="mr-1"
                        width="16"
                        height="16"
                      />
                      导出
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="flex items-center rounded-md bg-red-100 px-2 py-1 font-medium text-red-600 text-xs hover:bg-red-200">
                      <Icon
                        icon="line-md:trash"
                        className="mr-1"
                        width="16"
                        height="16"
                      />
                      清空
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center rounded-md bg-sky-100 px-2 py-1 font-medium text-sky-600 text-xs hover:bg-sky-200">
                  <Icon icon="line-md:close" width="16" height="16" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="flex animate-pulse flex-col items-center">
                    <Icon
                      icon="line-md:loading-twotone-loop"
                      className="text-sky-500"
                      width="32"
                      height="32"
                    />
                    <p className="mt-2 text-sky-600 text-sm">加载中...</p>
                  </div>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center text-gray-500">
                  <Icon
                    icon="line-md:image-twotone-alt"
                    className="mb-2"
                    width="32"
                    height="32"
                  />
                  <p className="text-center text-sm">
                    还没有聊天记录
                    <br />
                    与AI聊天后会自动保存
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {historyItems.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className="cursor-pointer rounded-xl border border-sky-100 bg-white p-3 text-left shadow-sm transition-all hover:border-sky-200 hover:shadow"
                      onClick={() => toggleExpand(item.id)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon
                            icon={
                              expandedItemId === item.id
                                ? "line-md:chevron-down"
                                : "line-md:chevron-right"
                            }
                            className="mr-2 text-sky-500"
                            width="18"
                            height="18"
                          />
                          <div className="flex-1 truncate">
                            <p className="font-medium text-sky-600">
                              {new URL(item.url).hostname}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {formatDateTime(item.timestamp)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="rounded-full p-1 text-red-500 hover:bg-red-100"
                          title="删除记录">
                          <Icon icon="line-md:trash" width="16" height="16" />
                        </button>
                      </div>
                      <AnimatePresence initial={false}>
                        {expandedItemId === item.id && (
                          <motion.div
                            key="content"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                              open: {
                                opacity: 1,
                                height: "auto",
                                marginTop: 8
                              },
                              collapsed: { opacity: 0, height: 0, marginTop: 0 }
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden border-sky-100 border-t border-dashed pt-2">
                            <div className="mb-2 rounded-md bg-indigo-50 p-2">
                              <p className="mb-1 font-medium text-indigo-600 text-xs">
                                原始提示词:
                              </p>
                              <p className="whitespace-pre-wrap break-words text-indigo-700 text-xs">
                                {item.prompt}
                              </p>
                            </div>

                            {item.processedPrompt &&
                              item.processedPrompt !== item.prompt && (
                                <div className="mb-2 rounded-md bg-emerald-50 p-2">
                                  <button
                                    type="button"
                                    className="flex w-full cursor-pointer items-center justify-between"
                                    onClick={(e) =>
                                      togglePromptExpand(item.id, e)
                                    }>
                                    <p className="mb-1 font-medium text-emerald-600 text-xs">
                                      完整提示词 (已填充):
                                    </p>
                                    <Icon
                                      icon={
                                        expandedPrompts.has(item.id)
                                          ? "line-md:chevron-up"
                                          : "line-md:chevron-down"
                                      }
                                      className="text-emerald-500"
                                      width="16"
                                      height="16"
                                    />
                                  </button>
                                  <AnimatePresence initial={false}>
                                    {expandedPrompts.has(item.id) && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden">
                                        <p className="whitespace-pre-wrap break-words text-emerald-700 text-xs">
                                          {item.processedPrompt}
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                            {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only */}
                            {/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation only */}
                            <div className="mb-2" onClick={stopPropagation}>
                              <p className="mb-1 font-medium text-sky-600 text-xs">
                                内容:
                              </p>
                              <SummaryResultDisplay content={item.content} />
                            </div>

                            {item.usage && (
                              <div className="rounded-md bg-green-50 p-2">
                                <p className="mb-1 font-medium text-green-600 text-xs">
                                  Token 使用:
                                </p>
                                <div className="flex flex-wrap gap-2 text-green-700 text-xs">
                                  <span>
                                    总计: {item.usage.total_tokens || 0}
                                  </span>
                                  <span>
                                    提示词: {item.usage.prompt_tokens || 0}
                                  </span>
                                  <span>
                                    完成: {item.usage.completion_tokens || 0}
                                  </span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AiHistoryDrawer
