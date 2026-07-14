const auth = require('../../utils/auth')
const { api, callCloudFunction } = require('../../utils/api')
const { getAvatarColor, getAvatarText } = require('../../utils/constants')

Page({
  data: {
    userInfo: null,
    avatarColor: '',
    avatarText: '',
    myTemplates: [],
    loading: true,
    isAdmin: false,
    pendingCount: 0
  },

  async onShow() {
    // 等待登录完成再加载数据
    const app = getApp()
    await app.getUserId()
    this.loadProfile()
  },

  async loadProfile() {
    const userInfo = auth.getCurrentUserInfo()
    if (userInfo) {
      this.setData({
        userInfo,
        avatarColor: getAvatarColor(userInfo._id),
        avatarText: getAvatarText(userInfo.nickName)
      })
    }

    try {
      const [templateRes, adminRes] = await Promise.all([
        callCloudFunction('template', { action: 'myTemplates' }),
        api.checkAdmin().catch(() => ({ success: true, isAdmin: false }))
      ])

      const updateData = {
        myTemplates: templateRes.templates || [],
        loading: false,
        isAdmin: adminRes.isAdmin || false
      }

      // 如果是管理员，获取待审核数量
      if (updateData.isAdmin) {
        try {
          const pendingRes = await api.listPendingTemplates()
          updateData.pendingCount = (pendingRes.templates || []).length
        } catch (e) {
          updateData.pendingCount = 0
        }
      }

      this.setData(updateData)
    } catch (err) {
      this.setData({ loading: false })
    }
  },

  onTemplateTap(e) {
    const { template } = e.detail
    wx.navigateTo({ url: `/pages/square/detail/index?id=${template._id}` })
  },

  onDeleteTemplate(e) {
    const { template } = e.detail
    wx.showModal({
      title: '确认删除',
      content: `删除模板「${template.name}」？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteTemplate(template._id)
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadProfile()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 进入审核页面
  onGoReview() {
    wx.navigateTo({ url: '/pages/admin/review/index' })
  },

  // 更新头像
  async onChooseAvatar(e) {
    const tempUrl = e.detail.avatarUrl
    if (!tempUrl) return

    wx.showLoading({ title: '上传中...' })
    try {
      // 上传临时头像到云存储
      const ext = tempUrl.split('.').pop() || 'png'
      const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath: tempUrl
      })

      // 直接使用 fileID（cloud:// 格式），小程序 image 组件可直接加载
      const avatarUrl = uploadRes.fileID

      const userInfo = await auth.updateUserInfo({ avatarUrl })
      this.setData({ userInfo })
      wx.hideLoading()
      wx.showToast({ title: '头像已更新', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      console.error('上传头像失败:', err)
      wx.showToast({ title: '上传失败', icon: 'none' })
    }
  },

  // 更新昵称
  onNicknameChange(e) {
    const nickName = e.detail.value
    if (nickName && nickName.trim()) {
      auth.updateUserInfo({ nickName: nickName.trim() }).then(userInfo => {
        this.setData({
          userInfo,
          avatarText: getAvatarText(userInfo.nickName)
        })
      })
    }
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '退出后需要重新登录',
      success: (res) => {
        if (res.confirm) {
          auth.logout()
          wx.reLaunch({ url: '/pages/trips/list/index' })
        }
      }
    })
  }
})
