// utils/storage.js - 本地存储工具

const { CACHE_EXPIRY } = require('./constants')

const CACHE_PREFIX = 'yqz_cache_'

/**
 * 设置缓存
 * @param {string} key
 * @param {*} data
 * @param {number} expiry 过期时间（毫秒），默认1小时
 */
function setCache(key, data, expiry = CACHE_EXPIRY) {
  const cacheData = {
    data,
    timestamp: Date.now(),
    expiry
  }
  wx.setStorageSync(CACHE_PREFIX + key, cacheData)
}

/**
 * 获取缓存
 * @param {string} key
 * @returns {*|null}
 */
function getCache(key) {
  const cacheData = wx.getStorageSync(CACHE_PREFIX + key)
  if (!cacheData) return null

  // 检查是否过期
  if (Date.now() - cacheData.timestamp > cacheData.expiry) {
    wx.removeStorageSync(CACHE_PREFIX + key)
    return null
  }

  return cacheData.data
}

/**
 * 删除缓存
 * @param {string} key
 */
function removeCache(key) {
  wx.removeStorageSync(CACHE_PREFIX + key)
}

/**
 * 缓存行程列表
 */
function cacheTrips(trips) {
  setCache('trips', trips)
}

/**
 * 获取缓存的行程列表
 */
function getCachedTrips() {
  return getCache('trips')
}

/**
 * 缓存行程详情
 */
function cacheTripDetail(tripId, detail) {
  setCache(`trip_${tripId}`, detail)
}

/**
 * 获取缓存的行程详情
 */
function getCachedTripDetail(tripId) {
  return getCache(`trip_${tripId}`)
}

/**
 * 缓存 Todo 列表
 */
function cacheTodos(tripId, todos) {
  setCache(`todos_${tripId}`, todos, 30000) // Todo 缓存30秒
}

/**
 * 获取缓存的 Todo 列表
 */
function getCachedTodos(tripId) {
  return getCache(`todos_${tripId}`)
}

/**
 * 清除所有缓存
 */
function clearAllCache() {
  const keys = wx.getStorageInfoSync().keys
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      wx.removeStorageSync(key)
    }
  })
}

module.exports = {
  setCache,
  getCache,
  removeCache,
  cacheTrips,
  getCachedTrips,
  cacheTripDetail,
  getCachedTripDetail,
  cacheTodos,
  getCachedTodos,
  clearAllCache
}
