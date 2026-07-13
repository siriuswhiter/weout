const { api } = require('../../../utils/api')
const { getAvatarColor, getAvatarText } = require('../../../utils/constants')

Page({
  data: {
    templateId: '',
    template: null,
    loading: true,
    isLiked: false,
    selectMode: false,
    tripId: '',
    creatorInfo: null
  },

  onLoad(options) {
    const { id, tripId, selectMode } = options
    this.setData({
      templateId: id,
      selectMode: selectMode === 'true',
      tripId: tripId || ''
    })
    this.loadTemplate()
  },

  async loadTemplate() {
    try {
      const res = await api.getTemplate(this.data.templateId)
      const template = res.template

      const creatorInfo = template.creator ? {
        ...template.creator,
        color: getAvatarColor(template.creator._id),
        text: getAvatarText(template.creator.nickName)
      } : null

      wx.setNavigationBarTitle({ title: template.name })

      this.setData({
        template,
        isLiked: template.isLiked,
        creatorInfo,
        loading: false
      })
    } catch (err) {
      console.error('加载模板失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async onToggleLike() {
    const { templateId, isLiked, template } = this.data
    try {
      if (isLiked) {
        await api.unlikeTemplate(templateId)
        this.setData({
          isLiked: false,
          'template.likeCount': Math.max(0, template.likeCount - 1)
        })
      } else {
        await api.likeTemplate(templateId)
        this.setData({
          isLiked: true,
          'template.likeCount': template.likeCount + 1
        })
      }
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async onUseTemplate() {
    const { templateId, tripId, selectMode, template } = this.data

    if (selectMode && tripId) {
      // 从行程详情页进入，直接使用
      wx.showModal({
        title: '使用模板',
        content: `将 ${template.items.length} 项添加到行程中？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await api.useTemplate(templateId, tripId)
              wx.showToast({ title: '添加成功', icon: 'success' })
              setTimeout(() => {
                wx.navigateBack({ delta: 2 })
              }, 500)
            } catch (err) {
              wx.showToast({ title: '添加失败', icon: 'none' })
            }
          }
        }
      })
    } else {
      // 从广场进入，需要选择行程
      try {
        const tripsRes = await api.listTrips()
        const activeTrips = (tripsRes.trips || []).filter(t => t.status === 'active')

        if (activeTrips.length === 0) {
          wx.showToast({ title: '请先创建一个行程', icon: 'none' })
          return
        }

        wx.showActionSheet({
          itemList: activeTrips.map(t => t.name),
          success: async (res) => {
            const selectedTrip = activeTrips[res.tapIndex]
            try {
              await api.useTemplate(templateId, selectedTrip._id)
              wx.showToast({ title: '添加成功', icon: 'success' })
            } catch (err) {
              wx.showToast({ title: '添加失败', icon: 'none' })
            }
          }
        })
      } catch (err) {
        wx.showToast({ title: '获取行程失败', icon: 'none' })
      }
    }
  }
})
