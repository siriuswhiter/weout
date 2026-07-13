// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      // TODO: 替换为你的云开发环境 ID，在云开发控制台获取
      // env: 'your-env-id',
      traceUser: true
    })

    // 自动登录
    this.autoLogin()
  },

  globalData: {
    userInfo: null,
    userId: null,
    isLoggedIn: false
  },

  async autoLogin() {
    const auth = require('./utils/auth')
    try {
      const userId = await auth.autoLogin()
      this.globalData.userId = userId
      this.globalData.isLoggedIn = true
    } catch (err) {
      console.error('自动登录失败:', err)
    }
  },

  // 获取用户ID，如果未登录则等待登录完成
  getUserId() {
    return new Promise((resolve, reject) => {
      if (this.globalData.userId) {
        resolve(this.globalData.userId)
        return
      }
      // 等待登录完成
      let retries = 0
      const timer = setInterval(() => {
        if (this.globalData.userId) {
          clearInterval(timer)
          resolve(this.globalData.userId)
        } else if (retries > 20) {
          clearInterval(timer)
          reject(new Error('登录超时'))
        }
        retries++
      }, 500)
    })
  }
})
