import { Icon } from "@iconify/react"
import type React from "react"
import { useCallback } from "react"

import { Button } from "~/components/ui/button"

export const OptionHeader: React.FC = () => {
  const handleOpenGithub = useCallback(() => {
    window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
  }, [])

  return (
    <header className="mb-6 flex items-center justify-between rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
      <div>
        <h1 className="font-bold text-2xl text-blue-600">
          Moe Copy AI 萌抓
        </h1>
        <p className="text-blue-500 text-sm">
          配置你的小助手，让它更好地为你服务
        </p>
      </div>

      <Button variant="ghost" size="icon" onClick={handleOpenGithub} title="访问GitHub">
        <Icon icon="mdi:github" width="24" height="24" />
      </Button>
    </header>
  )
}

export default OptionHeader
