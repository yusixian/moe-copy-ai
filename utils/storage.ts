import { Storage } from "@plasmohq/storage"

// 创建存储实例 sync 有大小限制(通常每个项目不超过8KB，总大小约100KB）适合存储配置信息
// 如果需要存储大量数据，可以使用 local 存储
export const syncStorage = new Storage({ area: "sync" })
export const localStorage = new Storage({ area: "local" })
