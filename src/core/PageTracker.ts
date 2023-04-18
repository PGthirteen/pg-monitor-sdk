// PV监听
import { batchAddLister, createHistoryTracker } from '../utils/utils'
import { lazyReport } from './report'

/*
* History模式监听器
* */

export function HistoryTrackerReport() {
  // 1. 重写pushState与replaceState方法 添加自定义事件
  history.pushState = createHistoryTracker('pushState')
  history.replaceState = createHistoryTracker('replaceState')

  const eventList = ['pushState', 'replaceState', 'popstate', 'load', 'unload']
  pageTrackerReport(eventList)

}


/*
* Hash模式监听器
* */
export function HashTrackerReport() {
  // 1. 重写pushState与replaceState方法 添加自定义事件
  history.pushState = createHistoryTracker('pushState')

  const eventList = ['pushState', 'popstate', 'hashChange', 'load', 'unload']
  pageTrackerReport(eventList)

}

// * 页面信息上报
function pageTrackerReport(eventList: string[]) {
  // 保存当前页面地址
  let pageName = location.href
  let startTime = Date.now()

  // 计算存留时间
  function getStayTime() {
    const time = Date.now() - startTime
    startTime = Date.now()
    return time
  }

  // 2. 监听自定义事件 ->  从而得知路由变化
  batchAddLister(eventList, lister)

  // 3. 整理log  上报数据
  function lister() {
    // 上报的内容:  page 上一个页面  stayTime停留时间
    const log = {
      page: pageName,
      stayTime: getStayTime()
    }
    console.log('---page改变了---', log)
    lazyReport('visit', log)

    pageName = location.href
  }
}
