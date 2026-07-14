const { api } = require('../../../utils/api')
const { TRIP_STATUS } = require('../../../utils/constants')
const { isExpired } = require('../../../utils/date')

Page({
  data: {
    activeTrips: [],
    archivedTrips: [],
    loading: true,
    isEmpty: false,
    showWelcome: false
  },

  async onLoad() {
    // 等待登录完成再加载数据
    const app = getApp()
    await app.getUserId()
    this.loadTrips()

    // 首次使用，显示欢迎引导
    if (!wx.getStorageSync('yqz_welcome_done')) {
      this.setData({ showWelcome: true })
    }
  },

  onWelcomeDone() {
    this.setData({ showWelcome: false })
  },

  onShow() {
    if (!this.data.loading) {
      this.loadTrips()
    }
  },

  onPullDownRefresh() {
    this.loadTrips().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadTrips() {
    try {
      this.setData({ loading: true })
      const res = await api.listTrips()
      const trips = res.trips || []

      const activeTrips = []
      const archivedTrips = []

      trips.forEach(trip => {
        if (trip.status === TRIP_STATUS.ARCHIVED || (trip.endDate && isExpired(trip.endDate))) {
          archivedTrips.push(trip)
        } else {
          activeTrips.push(trip)
        }
      })

      this.setData({
        activeTrips,
        archivedTrips,
        loading: false,
        isEmpty: trips.length === 0
      })
    } catch (err) {
      console.error('加载行程失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onCreateTrip() {
    wx.navigateTo({ url: '/pages/trips/create/index' })
  },

  onTripTap(e) {
    const { trip } = e.detail
    wx.navigateTo({ url: `/pages/trips/detail/index?id=${trip._id}` })
  },

  onTripLongPress(e) {
    const { trip } = e.detail
    const app = getApp()
    const isCreator = trip.creatorId === app.globalData.userId

    const items = isCreator ? ['归档行程', '删除行程'] : ['退出行程']

    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        if (isCreator) {
          if (res.tapIndex === 0) this.archiveTrip(trip._id)
          if (res.tapIndex === 1) this.deleteTrip(trip._id)
        }
      }
    })
  },

  async archiveTrip(tripId) {
    try {
      await api.archiveTrip(tripId)
      wx.showToast({ title: '已归档', icon: 'success' })
      this.loadTrips()
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async deleteTrip(tripId) {
    wx.showModal({
      title: '确认删除',
      content: '删除后行程和所有待办将无法恢复',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteTrip(tripId)
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadTrips()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  onJoinByCode() {
    wx.showModal({
      title: '加入行程',
      placeholderText: '请输入邀请码',
      editable: true,
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            await api.joinByCode(res.content.trim().toUpperCase())
            wx.showToast({ title: '加入成功', icon: 'success' })
            this.loadTrips()
          } catch (err) {
            wx.showToast({ title: err.message || '加入失败', icon: 'none' })
          }
        }
      }
    })
  }
})
