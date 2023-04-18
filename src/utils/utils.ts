/**
 * 获取元素的dom路径
 * @param {*} element
 * @returns
 */
export function getPathTo(element: HTMLElement): string | undefined {
  if (element.id !== '') return '//*[@id="' + element.id + '"]'
  if (element === document.body) return element.tagName
  let ix = 0
  let siblings = element.parentElement!.children
  for (let i = 0; i < siblings.length; i++) {
    let sibling = siblings[i]
    if (sibling === element)
      return (
        getPathTo(element.parentElement as HTMLElement) + '/' + element.tagName + '[' + (ix + 1) + ']'
      )
    if (sibling?.nodeType === 1 && sibling.tagName === element.tagName) ix++
  }
}

//*[@id="root"]/DIV[1]/DIV[2]/BUTTON[1]

/**
 * 创建重写方法  keyof变量对象将属性全部扩展  ->  ...
 */
export function createHistoryTracker<T extends keyof History>(type: T) {
  // 1. 复制原方法
  const origin = history[type]
  // 2. 返回一个
  return function (this: any) {
    // 调用原方法
    const res = origin.apply(this, arguments)

    // 创建自定义事件并触发
    const event = new Event(type)
    window.dispatchEvent(event)

    return res
  }
}

/**
 * 批量化添加监听
 */
export function batchAddLister(events: string[], fn: () => void) {
  events.forEach(event => {
    window.addEventListener(event, fn)
  })
}


