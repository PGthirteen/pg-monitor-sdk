// 资源缓存数组
const cache: string[] = []

export function addCache(item: string) {
  cache.push(item)
}

export function getCache(): string[]{
  return cache
}

export function clearCache() {
  cache.length = 0
}