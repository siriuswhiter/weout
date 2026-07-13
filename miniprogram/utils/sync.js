// utils/sync.js - 轮询同步逻辑

const { POLLING_INTERVAL } = require('./constants')

let pollingTimer = null
let currentTripId = null

/**
 * 启动轮询
 * @param {string} tripId 行程ID
 * @param {function} callback 数据更新回调
 * @param {number} interval 轮询间隔（毫秒）
 */
function startPolling(tripId, callback, interval = POLLING_INTERVAL) {
  // 先停止之前的轮询
  stopPolling()

  currentTripId = tripId

  pollingTimer = setInterval(async () => {
    if (!currentTripId) {
      stopPolling()
      return
    }
    try {
      await callback(currentTripId)
    } catch (err) {
      console.error('[Sync] 轮询失败:', err)
    }
  }, interval)
}

/**
 * 停止轮询
 */
function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
  currentTripId = null
}

/**
 * 检查是否正在轮询
 * @returns {boolean}
 */
function isPolling() {
  return pollingTimer !== null
}

module.exports = {
  startPolling,
  stopPolling,
  isPolling
}
