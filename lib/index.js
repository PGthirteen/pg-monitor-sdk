(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ys = {}));
})(this, (function (exports) { 'use strict';

  // 资源缓存数组
  const cache = [];
  function addCache(item) {
      cache.push(item);
  }
  function getCache() {
      return cache;
  }
  function clearCache() {
      cache.length = 0;
  }

  /* 上报数据 */
  let timer;
  function report(data) {
      // 前端如何将数据发送给后端?  原生ajax, fetchApi【html5API】 ->  缺点: 语法复杂、跨域
      // 有无其他替代方案?  资源请求[script, link,  img]  ->  跨域、 缺点： 长度限制
      // sendBeacon: 优点： 支持跨域、无长度限制【字符串】、不会因为页面关闭而丢包  缺点： 兼容性
      const url = window._monitor_url;
      if (navigator.sendBeacon) {
          // 支持sendBeacon
          navigator.sendBeacon(url, JSON.stringify(data));
      }
      else {
          // 不支持sendBeacon
          const image = new Image();
          image.src = `${url}?${JSON.stringify(data)}`;
      }
      // 清理已上报的数据
      clearCache();
  }
  /* 合并数据 再上报 */
  function lazyReport(type, data) {
      // 清理上次未完成上报
      if (timer)
          clearTimeout(timer);
      // 准备上报的数据结构 appId 项目ID  uuId 用户ID  type 上报类型
      const log = {
          appId: window._monitor_appId,
          userId: window._monitor_uuId,
          type,
          data,
          currentTime: Date.now(),
          currentPage: location.href,
          ua: navigator.userAgent
      };
      // 添加上报到缓存中
      addCache(JSON.stringify(log));
      // 取出上报缓存
      const reportData = getCache();
      // 判断是否有缓存时间
      if (window._monitor_time === 0)
          return report(reportData);
      // 超过10条数据就直接上报
      if (reportData.length === 10)
          return report(reportData);
      // 延迟上报数据
      timer = setTimeout(() => {
          report(reportData);
      }, window._monitor_time);
  }

  /* 全局监控-> JS错误、资源错误、Promise错误 */
  function ErrorTrackerReport() {
      // 资源加载错误上报
      function SourceErrorReport(e) {
          const target = e.target;
          const log = {
              errorType: 'sourceError',
              message: `${target.tagName}资源加载错误`,
              file: target.src || target.href
          };
          // console.log('---资源错误---', log)
          lazyReport('error', log);
      }
      // JS错误 【改为捕获阶段】
      window.addEventListener('error', function (e) {
          const target = e.target;
          // 判断是否为资源错误[script  link  img]
          const isSource = target instanceof HTMLImageElement || target instanceof HTMLScriptElement || target instanceof HTMLLinkElement;
          if (isSource)
              return SourceErrorReport(e);
          // 提取一些有效信息 上报给后端
          // errorType 错误类型 file 错误文件  row col 错误位置  error 错误对象  message 错误信息
          const log = {
              errorType: 'jsError',
              message: e.message,
              file: e.filename,
              row: e.lineno,
              col: e.colno,
              error: e.error
          };
          // console.log('----js错误----', log)
          // 上报log 给后端服务器即可
          lazyReport('error', log);
      }, true);
      // Promise错误
      window.addEventListener('unhandledrejection', function (e) {
          const log = {
              errorType: 'promiseError',
              message: e.reason,
              error: e.reason
          };
          // console.log('----Promise错误----', log)
          lazyReport('error', log);
      });
  }
  /* 手动错误上报 */
  function ErrorCatcher(message, error) {
      const log = {
          errorType: 'jsError',
          message: message,
          error: error
      };
      // console.log('---js错误----', log)
      lazyReport('error', log);
  }

  /**
   * 获取元素的dom路径
   * @param {*} element
   * @returns
   */
  function getPathTo(element) {
      if (element.id !== '')
          return '//*[@id="' + element.id + '"]';
      if (element === document.body)
          return element.tagName;
      let ix = 0;
      let siblings = element.parentElement.children;
      for (let i = 0; i < siblings.length; i++) {
          let sibling = siblings[i];
          if (sibling === element)
              return (getPathTo(element.parentElement) + '/' + element.tagName + '[' + (ix + 1) + ']');
          if ((sibling === null || sibling === void 0 ? void 0 : sibling.nodeType) === 1 && sibling.tagName === element.tagName)
              ix++;
      }
  }
  //*[@id="root"]/DIV[1]/DIV[2]/BUTTON[1]
  /**
   * 创建重写方法  keyof变量对象将属性全部扩展  ->  ...
   */
  function createHistoryTracker(type) {
      // 1. 复制原方法
      const origin = history[type];
      // 2. 返回一个
      return function () {
          // 调用原方法
          const res = origin.apply(this, arguments);
          // 创建自定义事件并触发
          const event = new Event(type);
          window.dispatchEvent(event);
          return res;
      };
  }
  /**
   * 批量化添加监听
   */
  function batchAddLister(events, fn) {
      events.forEach(event => {
          window.addEventListener(event, fn);
      });
  }

  // 用户行为监控
  /**
   * 无痕埋点
   */
  function AutoTrackerReport() {
      // 只埋点 点击行为
      document.body.addEventListener('click', function (e) {
          const target = e.target;
          const isNo = target.getAttribute('data-no');
          const message = target.getAttribute('data-tracker');
          // 判断是否需要上报
          if (isNo != null)
              return;
          // 处理需要上报的数据格式  type 点击类型   message  点击信息
          const log = {
              type: 'click',
              message: message || getPathTo(target)
          };
          // console.log('---无痕埋点信息---', log)
          lazyReport('action', log);
      });
  }
  /**
   * 手动埋点
   */
  function actionCatcher(type, message) {
      const log = { type, message };
      // console.log('---手动埋点信息---', log)
      lazyReport('action', log);
  }

  // PV监听
  /*
  * History模式监听器
  * */
  function HistoryTrackerReport() {
      // 1. 重写pushState与replaceState方法 添加自定义事件
      history.pushState = createHistoryTracker('pushState');
      history.replaceState = createHistoryTracker('replaceState');
      const eventList = ['pushState', 'replaceState', 'popstate', 'load', 'unload'];
      pageTrackerReport(eventList);
  }
  /*
  * Hash模式监听器
  * */
  function HashTrackerReport() {
      // 1. 重写pushState与replaceState方法 添加自定义事件
      history.pushState = createHistoryTracker('pushState');
      const eventList = ['pushState', 'popstate', 'hashChange', 'load', 'unload'];
      pageTrackerReport(eventList);
  }
  // * 页面信息上报
  function pageTrackerReport(eventList) {
      // 保存当前页面地址
      let pageName = location.href;
      let startTime = Date.now();
      // 计算存留时间
      function getStayTime() {
          const time = Date.now() - startTime;
          startTime = Date.now();
          return time;
      }
      // 2. 监听自定义事件 ->  从而得知路由变化
      batchAddLister(eventList, lister);
      // 3. 整理log  上报数据
      function lister() {
          // 上报的内容:  page 上一个页面  stayTime停留时间
          const log = {
              page: pageName,
              stayTime: getStayTime()
          };
          console.log('---page改变了---', log);
          lazyReport('visit', log);
          pageName = location.href;
      }
  }

  class Tracker {
      constructor(options) {
          this.data = Object.assign(this.defaultOptions(), options);
          // 根据配置加载监控
          this.installTracker();
      }
      // 默认配置加载  private 私有的【仅限该类使用】
      defaultOptions() {
          return {
              appId: '',
              uuId: '',
              requestUrl: '',
              cacheTime: 1000,
              ErrorTracker: false,
              DOMTracker: false,
              HashTracker: false,
              HistoryTracker: false
          };
      }
      // 加载监控
      installTracker() {
          const { requestUrl, uuId, appId, cacheTime } = this.data;
          // 将请求地址保存到window
          window['_monitor_url'] = requestUrl;
          window['_monitor_uuId'] = uuId;
          window['_monitor_appId'] = appId;
          window['_monitor_time'] = cacheTime || 0;
          // 判断配置 加载监控
          // 错误监控 ->  前端监听错误 需要监听哪些错误?  JS错误、Promise错误、资源错误
          // 怎么去监控这些错误?  JS错误、异步错误、资源错误  ->  error事件  Promise错误 -> unhandledrejection
          if (this.data.ErrorTracker) {
              ErrorTrackerReport();
          }
          // 用户行为监控
          if (this.data.DOMTracker) {
              AutoTrackerReport();
          }
          // Hash路由监控
          if (this.data.HashTracker) {
              HashTrackerReport();
          }
          // History路由监控
          if (this.data.HistoryTracker) {
              HistoryTrackerReport();
          }
      }
  }

  // 监控内容： 1. 错误   2. 用户行为   3.  PV统计   4. UV统计
  // 分析可得:  返回一个方法,  传入一个配置【根据配置去加载监控内容】
  function init(options) {
      // 实例化监控类
      new Tracker(options);
      // 上报UV
      lazyReport('user', { message: 'SDK加载' });
      // 避免页面关闭时数据还没上报
      window.addEventListener('unload', () => {
          const reportData = getCache();
          if (reportData.length)
              report(reportData);
      });
  }

  exports.ErrorCatcher = ErrorCatcher;
  exports.actionCatcher = actionCatcher;
  exports.init = init;

}));
