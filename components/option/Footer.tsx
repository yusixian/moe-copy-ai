import { Icon } from "@iconify/react"
import type React from "react"

import { Button } from "~/components/ui/button"

export const Footer: React.FC = () => {
  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
          }
          title="GitHub">
          <Icon icon="mdi:github" width={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open("https://moe.cosine.ren/docs", "_blank")}
          title="文档">
          <Icon icon="mdi:book-open-outline" width={20} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open("https://discord.gg/XzvrvNMcSe", "_blank")}
          title="Discord">
          <Icon icon="mdi:discord" width={20} />
        </Button>
      </div>
      <div className="inline-block rounded-full border border-sky-200 bg-sky-100 px-4 py-2">
        <p className="text-sky-600 text-sm">
          Moe Copy AI 萌抓 ©<span>{` ${new Date().getFullYear()} `}</span>
          <Icon
            icon="line-md:heart-twotone"
            className="-mt-1 inline text-pink-500"
          />
        </p>
      </div>
    </div>
  )
}

export default Footer
