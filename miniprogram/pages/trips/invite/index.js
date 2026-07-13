const { api } = require('../../../utils/api')

Page({
  data: {
    tripId: '',
    inviteCode: '',
    tripName: '',
    loading: true,
    isJoining: false,
    joinCode: '' // 从分享链接进入时的邀请码
  },

  onLoad(options) {
    const { id, code } = options

    if (code && !id) {
      // 通过分享链接进入，直接加入
      this.setData({ joinCode: code, isJoining: true })
      this.joinTrip(code)
      return
    }

    if (id) {
      this.setData({ tripId: id })
      if (code) {
        // 分享链接带了行程ID和邀请码
        this.setData({ joinCode: code, isJoining: true })
        this.joinTrip(code)
      } else {
        this.loadInviteCode()
      }
    }
  },

  async loadInviteCode() {
    try {
      const res = await api.generateInviteCode(this.data.tripId)
      this.setData({
        inviteCode: res.inviteCode,
        tripName: res.tripName,
        loading: false
      })
    } catch (err) {
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async joinTrip(code) {
    try {
      const res = await api.joinByCode(code)
      wx.showToast({ title: '加入成功！', icon: 'success' })
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/trips/detail/index?id=${res.tripId}` })
      }, 1000)
    } catch (err) {
      this.setData({ isJoining: false })
      wx.showToast({ title: err.message || '加入失败', icon: 'none' })
    }
  },

  // 复制邀请码
  onCopyCode() {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: () => {
        wx.showToast({ title: '已复制', icon: 'success' })
      }
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `来加入「${this.data.tripName}」，一起准备出发吧！`,
      path: `/pages/trips/invite/index?id=${this.data.tripId}&code=${this.data.inviteCode}`
    }
  }
})
