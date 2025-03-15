import { Icon } from "@iconify/react"
import React, { useCallback } from "react"

export const OptionHeader: React.FC = () => {
  const handleOpenGithub = useCallback(() => {
    window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
  }, [])

  return (
    <header className="mb-6 flex items-center justify-between rounded-xl border-2 border-sky-200 bg-white p-4 shadow-md">
      <div>
        <h1 className="flex items-center text-2xl font-bold text-sky-600">
          Moe Copy AI <span className="ml-2">✨</span> 萌抓
        </h1>
        <p className="text-sm text-indigo-600">
          配置你的小助手，让它更好地为你服务 (。・ω・。)
        </p>
      </div>

      <button
        onClick={handleOpenGithub}
        className="transform rounded-full p-2 text-sky-500 transition hover:rotate-12 hover:bg-blue-50"
        title="访问GitHub">
        <Icon icon="mdi:github" width="24" height="24" />
      </button>
    </header>
  )
}

export default OptionHeader
