// 错误监控类
import { ErrorReport } from '../type/core'
import { SourceElement } from '../type/dom'
import { lazyReport } from './report'

/* 全局监控-> JS错误、资源错误、Promise错误 */
export function ErrorTrackerReport() {
  // 资源加载错误上报
  function SourceErrorReport(e: ErrorEvent) {
    const target = e.target as SourceElement
    const log: ErrorReport = {
      errorType: 'sourceError',
      message: `${target.tagName}资源加载错误`,
      file: target.src || target.href
    }
    // console.log('---资源错误---', log)
    lazyReport('error', log)
  }

  // JS错误 【改为捕获阶段】
  window.addEventListener('error', function (e) {
    const target = e.target
    // 判断是否为资源错误[script  link  img]
    const isSource = target instanceof HTMLImageElement || target instanceof HTMLScriptElement || target instanceof HTMLLinkElement
    if (isSource) return SourceErrorReport(e)
    // 提取一些有效信息 上报给后端
    // errorType 错误类型 file 错误文件  row col 错误位置  error 错误对象  message 错误信息
    const log: ErrorReport = {
      errorType: 'jsError',
      message: e.message,
      file: e.filename,
      row: e.lineno,
      col: e.colno,
      error: e.error
    }
    // console.log('----js错误----', log)
    // 上报log 给后端服务器即可
    lazyReport('error', log)
  }, true)

  // Promise错误
  window.addEventListener('unhandledrejection', function (e) {
    const log: ErrorReport = {
      errorType: 'promiseError',
      message: e.reason,
      error: e.reason
    }
    // console.log('----Promise错误----', log)
    lazyReport('error', log)
  })
}

/* 手动错误上报 */
export function ErrorCatcher(message: string, error: any) {
  const log: ErrorReport = {
    errorType: 'jsError',
    message: message,
    error: error
  }
  // console.log('---js错误----', log)
  lazyReport('error', log)
}

