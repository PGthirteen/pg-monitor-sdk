// 监控类
import { Options } from '../type/core'
import { ErrorTrackerReport } from './ErrorTracker'
import { AutoTrackerReport } from './DomTracker'
import { HashTrackerReport, HistoryTrackerReport } from './PageTracker'

export default  class Tracker {
  readonly data: Options

  constructor(options: Options) {
    this.data = Object.assign(this.defaultOptions(), options)
    // 根据配置加载监控
    this.installTracker()
  }

  // 默认配置加载  private 私有的【仅限该类使用】
  private defaultOptions(): Options {
    return {
      appId: '',
      uuId: '',
      requestUrl: '',
      cacheTime: 1000,
      ErrorTracker: false,
      DOMTracker: false,
      HashTracker: false,
      HistoryTracker: false
    }
  }

  // 加载监控
  private installTracker() {
    const { requestUrl, uuId, appId, cacheTime } = this.data
    // 将请求地址保存到window
    window['_monitor_url'] = requestUrl
    window['_monitor_uuId'] = uuId
    window['_monitor_appId'] = appId
    window['_monitor_time'] = cacheTime || 0

    // 判断配置 加载监控
    // 错误监控 ->  前端监听错误 需要监听哪些错误?  JS错误、Promise错误、资源错误
    // 怎么去监控这些错误?  JS错误、异步错误、资源错误  ->  error事件  Promise错误 -> unhandledrejection
    if (this.data.ErrorTracker) {
      ErrorTrackerReport()
    }
    // 用户行为监控
    if (this.data.DOMTracker) {
      AutoTrackerReport()
    }
    // Hash路由监控
    if (this.data.HashTracker) {
      HashTrackerReport()
    }
    // History路由监控
    if (this.data.HistoryTracker) {
      HistoryTrackerReport()
    }
  }
  
}