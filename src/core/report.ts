/* 上报数据 */
import { addCache, clearCache, getCache } from './cache'

let timer: any

export function report(data: any) {
  // 前端如何将数据发送给后端?  原生ajax, fetchApi【html5API】 ->  缺点: 语法复杂、跨域
  // 有无其他替代方案?  资源请求[script, link,  img]  ->  跨域、 缺点： 长度限制
  // sendBeacon: 优点： 支持跨域、无长度限制【字符串】、不会因为页面关闭而丢包  缺点： 兼容性
  const url = window._monitor_url
  if (navigator.sendBeacon) {
    // 支持sendBeacon
    navigator.sendBeacon(url, JSON.stringify(data))
  } else {
    // 不支持sendBeacon
    const image = new Image()
    image.src = `${url}?${JSON.stringify(data)}`
  }
  // 清理已上报的数据
  clearCache()
}

/* 合并数据 再上报 */
export function lazyReport(type: string, data: any) {
  // 清理上次未完成上报
  if (timer) clearTimeout(timer)

  // 准备上报的数据结构 appId 项目ID  uuId 用户ID  type 上报类型
  const log = {
    appId: window._monitor_appId,
    userId: window._monitor_uuId,
    type,
    data,
    currentTime: Date.now(),
    currentPage: location.href,
    ua: navigator.userAgent
  }

  // 添加上报到缓存中
  addCache(JSON.stringify(log))

  // 取出上报缓存
  const reportData = getCache()

  // 判断是否有缓存时间
  if (window._monitor_time === 0) return report(reportData)

  // 超过10条数据就直接上报
  if (reportData.length === 10) return report(reportData)

  // 延迟上报数据
  timer = setTimeout(() => {
    report(reportData)
  }, window._monitor_time)
}
