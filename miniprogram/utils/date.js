// utils/date.js - 日期工具

/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} format 'YYYY-MM-DD' | 'MM-DD' | 'YYYY/MM/DD'
 * @returns {string}
 */
function formatDate(date, format = 'MM/DD') {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`
    case 'MM-DD':
      return `${month}-${day}`
    case 'MM/DD':
      return `${month}/${day}`
    default:
      return `${year}-${month}-${day}`
  }
}

/**
 * 格式化日期范围
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {string}
 */
function formatDateRange(startDate, endDate) {
  const start = formatDate(startDate)
  if (!endDate) return start
  const end = formatDate(endDate)
  return `${start} - ${end}`
}

/**
 * 计算两个日期之间的天数差
 * @param {Date|string} date1
 * @param {Date|string} date2
 * @returns {number}
 */
function dateDiff(date1, date2) {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 检查日期是否已过期
 * @param {Date|string} date
 * @returns {boolean}
 */
function isExpired(date) {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}

/**
 * 检查日期是否即将到期（3天内）
 * @param {Date|string} date
 * @returns {boolean}
 */
function isDueSoon(date) {
  if (!date) return false
  const d = new Date(date)
  const now = new Date()
  const diff = d - now
  return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000
}

/**
 * 获取相对时间描述
 * @param {Date|string} date
 * @returns {string}
 */
function getRelativeTime(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = now - d

  if (diff < 0) {
    // 未来时间
    const absDiff = Math.abs(diff)
    if (absDiff < 60000) return '即将'
    if (absDiff < 3600000) return `${Math.floor(absDiff / 60000)}分钟后`
    if (absDiff < 86400000) return `${Math.floor(absDiff / 3600000)}小时后`
    if (absDiff < 2592000000) return `${Math.floor(absDiff / 86400000)}天后`
    return formatDate(date, 'MM/DD')
  }

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  return formatDate(date, 'MM/DD')
}

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD
 */
function getToday() {
  return formatDate(new Date(), 'YYYY-MM-DD')
}

module.exports = {
  formatDate,
  formatDateRange,
  dateDiff,
  isExpired,
  isDueSoon,
  getRelativeTime,
  getToday
}
