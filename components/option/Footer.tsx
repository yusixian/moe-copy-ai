import { Icon } from "@iconify/react"
import type React from "react"

export const Footer: React.FC = () => {
  return (
    <div className="mt-8 text-center">
      <div className="inline-block rounded-full border border-sky-200 bg-sky-100 px-4 py-2">
        <p className="text-sky-600 text-sm">
          Moe Copy AI<span className="ml-2">✨</span> 萌抓 ©
          <span>{` ${new Date().getFullYear()} `}</span>
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
