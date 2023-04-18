// 类型文件
export interface DefaultOptions {
  appId: string // 项目ID
  uuId: string // 用户ID
  requestUrl: string // 上报地址
  cacheTime: number, // 缓存时间
  ErrorTracker: boolean // 错误监控
  DOMTracker: boolean // 行为监控
  HashTracker: boolean // Hash路由监控
  HistoryTracker: boolean // History路由监控
}

export interface Options extends Partial<DefaultOptions> {
  appId: string
  uuId: string
  requestUrl: string
}

export interface DefaultError {
  errorType: string
  row: number
  col: number
  file: string
  message: string
  error: any
}

export interface ErrorReport extends Partial<DefaultError>{
  errorType: string
  message: string
}