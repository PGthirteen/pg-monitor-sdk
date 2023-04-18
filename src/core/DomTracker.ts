// 用户行为监控
import { getPathTo } from '../utils/utils'
import { lazyReport } from './report'

/**
 * 无痕埋点
 */
export function AutoTrackerReport() {
  // 只埋点 点击行为
  document.body.addEventListener('click', function (e) {
    const target = e.target as HTMLElement
    const isNo = target.getAttribute('data-no')
    const message = target.getAttribute('data-tracker')
    // 判断是否需要上报
    if (isNo != null) return
    // 处理需要上报的数据格式  type 点击类型   message  点击信息
    const log = {
      type: 'click',
      message: message || getPathTo(target)
    }
    // console.log('---无痕埋点信息---', log)
    lazyReport('action', log)
  })
}


/**
 * 手动埋点
 */
export function actionCatcher(type: string, message: string) {
  const log = { type, message }
  // console.log('---手动埋点信息---', log)
  lazyReport('action', log)
}