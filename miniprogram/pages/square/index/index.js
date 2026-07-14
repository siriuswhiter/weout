const { api } = require('../../../utils/api')
const { TEMPLATE_TAGS } = require('../../../utils/constants')

Page({
  data: {
    tags: ['全部'],
    activeTag: '全部',
    keyword: '',
    templates: [],
    loading: true,
    hasMore: true,
    page: 0,
    selectMode: false,
    tripId: ''
  },

  async onLoad(options) {
    if (options.selectMode === 'true' && options.tripId) {
      this.setData({
        selectMode: true,
        tripId: options.tripId
      })
      wx.setNavigationBarTitle({ title: '选择模板' })
    }
    // 等待登录完成再加载数据
    const app = getApp()
    await app.getUserId()
    this.loadPopularTags()
    this.loadTemplates()
  },

  async loadPopularTags() {
    try {
      const res = await api.getPopularTags()
      const popularTags = (res.popularTags || []).map(t => t.tag)
      // 合并热门标签和预设标签（去重），热门标签优先
      const merged = [...new Set([...popularTags, ...TEMPLATE_TAGS])]
      this.setData({ tags: ['全部', ...merged] })
    } catch (err) {
      // 降级使用预设标签
      this.setData({ tags: ['全部', ...TEMPLATE_TAGS] })
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 0, templates: [], hasMore: true })
    this.loadTemplates().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore()
    }
  },

  async loadTemplates() {
    try {
      this.setData({ loading: true })
      const query = { page: 0, pageSize: 20 }

      if (this.data.activeTag !== '全部') {
        query.tag = this.data.activeTag
      }
      if (this.data.keyword) {
        query.keyword = this.data.keyword
      }

      const res = await api.listTemplates(query)
      this.setData({
        templates: res.templates || [],
        hasMore: res.hasMore,
        page: 0,
        loading: false
      })
    } catch (err) {
      console.error('加载模板失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async loadMore() {
    const nextPage = this.data.page + 1
    try {
      this.setData({ loading: true })
      const query = { page: nextPage, pageSize: 20 }

      if (this.data.activeTag !== '全部') {
        query.tag = this.data.activeTag
      }
      if (this.data.keyword) {
        query.keyword = this.data.keyword
      }

      const res = await api.listTemplates(query)
      this.setData({
        templates: [...this.data.templates, ...(res.templates || [])],
        hasMore: res.hasMore,
        page: nextPage,
        loading: false
      })
    } catch (err) {
      this.setData({ loading: false })
    }
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    this.setData({ activeTag: tag, page: 0, templates: [], hasMore: true })
    this.loadTemplates()
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.setData({ page: 0, templates: [], hasMore: true })
    this.loadTemplates()
  },

  onTemplateTap(e) {
    const { template } = e.detail
    if (this.data.selectMode) {
      wx.navigateTo({
        url: `/pages/square/detail/index?id=${template._id}&tripId=${this.data.tripId}&selectMode=true`
      })
    } else {
      wx.navigateTo({ url: `/pages/square/detail/index?id=${template._id}` })
    }
  },

  async onTemplateUse(e) {
    const { template } = e.detail
    if (!this.data.selectMode || !this.data.tripId) {
      wx.navigateTo({ url: `/pages/square/detail/index?id=${template._id}` })
      return
    }

    wx.showModal({
      title: '使用模板',
      content: `将「${template.name}」中的 ${template.items.length} 项添加到行程中？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.useTemplate(template._id, this.data.tripId)
            wx.showToast({ title: '添加成功', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 500)
          } catch (err) {
            wx.showToast({ title: '添加失败', icon: 'none' })
          }
        }
      }
    })
  }
})
