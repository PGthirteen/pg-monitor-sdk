import { Options } from '../type/core'
import Tracker from './Tracker'
import { ErrorCatcher } from './ErrorTracker'
import { actionCatcher } from './DomTracker'
import { lazyReport, report } from './report'
import { getCache } from './cache'

// 监控内容： 1. 错误   2. 用户行为   3.  PV统计   4. UV统计

// 分析可得:  返回一个方法,  传入一个配置【根据配置去加载监控内容】

export function init(options: Options) {
  // 实例化监控类
  new Tracker(options)

  // 上报UV
  lazyReport('user', { message: 'SDK加载' })

  // 避免页面关闭时数据还没上报
  window.addEventListener('unload', () => {
    const reportData = getCache()
    if (reportData.length) report(reportData)
  })
}

// 手动错误上报
export { ErrorCatcher, actionCatcher }