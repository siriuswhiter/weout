// utils/auth.js - 认证工具

const STORAGE_KEY_USER_ID = 'yqz_user_id'
const STORAGE_KEY_USER_INFO = 'yqz_user_info'

/**
 * 自动登录
 * @returns {Promise<string>} userId
 */
async function autoLogin() {
  // 先检查本地缓存
  const cachedUserId = wx.getStorageSync(STORAGE_KEY_USER_ID)
  if (cachedUserId) {
    return cachedUserId
  }

  // 调用云函数登录
  try {
    const res = await wx.cloud.callFunction({ name: 'login', data: {} })
    if (res.result && res.result.success) {
      const { userId, userInfo } = res.result
      wx.setStorageSync(STORAGE_KEY_USER_ID, userId)
      wx.setStorageSync(STORAGE_KEY_USER_INFO, userInfo)
      return userId
    }
    throw new Error(res.result ? res.result.error : '登录失败')
  } catch (err) {
    console.error('登录失败:', err)
    throw err
  }
}

/**
 * 获取当前用户ID
 * @returns {string|null}
 */
function getCurrentUserId() {
  return wx.getStorageSync(STORAGE_KEY_USER_ID) || null
}

/**
 * 获取当前用户信息
 * @returns {object|null}
 */
function getCurrentUserInfo() {
  return wx.getStorageSync(STORAGE_KEY_USER_INFO) || null
}

/**
 * 更新用户信息
 * @param {object} userInfo
 */
async function updateUserInfo(userInfo) {
  try {
    const res = await wx.cloud.callFunction({
      name: 'login',
      data: {
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      }
    })
    if (res.result && res.result.success) {
      wx.setStorageSync(STORAGE_KEY_USER_INFO, res.result.userInfo)
      return res.result.userInfo
    }
    throw new Error('更新失败')
  } catch (err) {
    console.error('更新用户信息失败:', err)
    throw err
  }
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!wx.getStorageSync(STORAGE_KEY_USER_ID)
}

/**
 * 退出登录
 */
function logout() {
  wx.removeStorageSync(STORAGE_KEY_USER_ID)
  wx.removeStorageSync(STORAGE_KEY_USER_INFO)
}

module.exports = {
  autoLogin,
  getCurrentUserId,
  getCurrentUserInfo,
  updateUserInfo,
  isLoggedIn,
  logout
}
