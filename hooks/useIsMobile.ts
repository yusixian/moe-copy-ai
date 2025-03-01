import { useMediaQuery } from "react-responsive"

export const useIsMobile = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 })
  return isMobile
}
