const { api } = require('../../../utils/api')
const { getToday } = require('../../../utils/date')

Page({
  data: {
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    today: '',
    submitting: false
  },

  onLoad() {
    this.setData({ today: getToday() })
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onDestinationInput(e) {
    this.setData({ destination: e.detail.value })
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value })
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value })
  },

  async onSubmit() {
    const { name, destination, startDate, endDate } = this.data

    if (!name.trim()) {
      wx.showToast({ title: '请输入行程名称', icon: 'none' })
      return
    }

    if (this.data.submitting) return
    this.setData({ submitting: true })

    try {
      const res = await api.createTrip({
        name: name.trim(),
        destination: destination.trim(),
        startDate: startDate || null,
        endDate: endDate || null
      })

      wx.showToast({ title: '创建成功', icon: 'success' })

      // 跳转到行程详情
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/trips/detail/index?id=${res.tripId}` })
      }, 500)
    } catch (err) {
      wx.showToast({ title: '创建失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})
