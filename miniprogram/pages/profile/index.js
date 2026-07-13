const auth = require('../../utils/auth')
const { api, callCloudFunction } = require('../../utils/api')
const { getAvatarColor, getAvatarText } = require('../../utils/constants')

Page({
  data: {
    userInfo: null,
    avatarColor: '',
    avatarText: '',
    myTemplates: [],
    loading: true
  },

  onShow() {
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
      const res = await callCloudFunction('template', { action: 'myTemplates' })
      this.setData({
        myTemplates: res.templates || [],
        loading: false
      })
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

  // 更新头像
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    auth.updateUserInfo({ avatarUrl }).then(userInfo => {
      this.setData({ userInfo })
    })
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
