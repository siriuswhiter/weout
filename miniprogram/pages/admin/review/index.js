const { api } = require('../../../utils/api')

Page({
  data: {
    tab: 'pending',              // pending | all
    templates: [],              // 待审核列表
    allTemplates: [],           // 全部模板列表
    pendingCount: 0,
    loading: true,
    seeding: false,
    keyword: '',
    statusFilter: '',           // '' | pending | approved | rejected
    statusFilters: [
      { label: '全部', value: '' },
      { label: '已通过', value: 'approved' },
      { label: '待审核', value: 'pending' },
      { label: '已拒绝', value: 'rejected' }
    ]
  },

  onShow() {
    // 每次进入刷新当前 tab；待审核数量始终刷新用于角标
    this.refreshPendingCount()
    if (this.data.tab === 'pending') {
      this.loadPendingTemplates()
    } else {
      this.loadAllTemplates()
    }
  },

  // 切换 Tab
  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab
    if (tab === this.data.tab) return
    this.setData({ tab })
    if (tab === 'pending') {
      this.loadPendingTemplates()
    } else {
      this.loadAllTemplates()
    }
  },

  // 刷新待审核数量（用于角标）
  async refreshPendingCount() {
    try {
      const res = await api.listPendingTemplates()
      this.setData({ pendingCount: (res.templates || []).length })
    } catch (err) {
      // 忽略角标错误
    }
  },

  async loadPendingTemplates() {
    this.setData({ loading: true })
    try {
      const res = await api.listPendingTemplates()
      const list = res.templates || []
      this.setData({
        templates: list,
        pendingCount: list.length,
        loading: false
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  async loadAllTemplates() {
    this.setData({ loading: true })
    try {
      const res = await api.adminListTemplates({
        status: this.data.statusFilter,
        keyword: this.data.keyword.trim()
      })
      this.setData({
        allTemplates: res.templates || [],
        loading: false
      })
    } catch (err) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' })
      this.setData({ loading: false })
    }
  },

  // 搜索输入
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadAllTemplates()
  },

  // 状态筛选
  onStatusFilterChange(e) {
    const value = e.currentTarget.dataset.value
    this.setData({ statusFilter: value })
    this.loadAllTemplates()
  },

  onTemplateTap(e) {
    const { template } = e.detail
    wx.navigateTo({ url: `/pages/square/detail/index?id=${template._id}` })
  },

  // 一键初始化预置官方模板（幂等，已存在的会跳过）
  onSeedPresets() {
    wx.showModal({
      title: '初始化预置模板',
      content: '将写入官方预置模板（如泰国出行、徒步登山等），已存在的会自动跳过。是否继续？',
      success: async (res) => {
        if (!res.confirm) return
        await this.doSeed(false)
      }
    })
  },

  // 强制更新预置模板（覆盖已存在的内容，用于同步最新标签/优先级）
  onForceSeedPresets() {
    wx.showModal({
      title: '更新预置模板',
      content: '将用最新内容覆盖已存在的官方预置模板（保留点赞与使用次数）。是否继续？',
      success: async (res) => {
        if (!res.confirm) return
        await this.doSeed(true)
      }
    })
  },

  async doSeed(force) {
    this.setData({ seeding: true })
    try {
      const result = await api.seedPresetTemplates(force)
      wx.showModal({
        title: force ? '更新完成' : '初始化完成',
        content: `共 ${result.total} 个模板：新增 ${result.created} 个，更新 ${result.updated || 0} 个，跳过 ${result.skipped} 个。`,
        showCancel: false
      })
      // 刷新当前视图
      if (this.data.tab === 'all') this.loadAllTemplates()
      this.refreshPendingCount()
    } catch (err) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' })
    } finally {
      this.setData({ seeding: false })
    }
  },

  async onApprove(e) {
    const { template } = e.detail
    wx.showModal({
      title: '确认通过',
      content: `通过模板「${template.name}」？通过后将展示在广场。`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.reviewTemplate(template._id, 'approved')
            wx.showToast({ title: '已通过', icon: 'success' })
            this.loadPendingTemplates()
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  async onReject(e) {
    const { template } = e.detail
    // 弹出输入框让管理员填写拒绝原因
    wx.showModal({
      title: '拒绝模板',
      content: '请确认拒绝该模板',
      editable: true,
      placeholderText: '拒绝原因（选填）',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.reviewTemplate(template._id, 'rejected', res.content || '')
            wx.showToast({ title: '已拒绝', icon: 'success' })
            this.loadPendingTemplates()
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 管理：上架（改为 approved）
  async onPublish(e) {
    const { template } = e.detail
    wx.showModal({
      title: '上架模板',
      content: `将「${template.name}」上架到广场？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.reviewTemplate(template._id, 'approved')
            wx.showToast({ title: '已上架', icon: 'success' })
            this.loadAllTemplates()
            this.refreshPendingCount()
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 管理：下线（改为 rejected，从广场移除）
  async onUnpublish(e) {
    const { template } = e.detail
    wx.showModal({
      title: '下线模板',
      content: `将「${template.name}」从广场下线？下线后用户将无法在广场看到。`,
      editable: true,
      placeholderText: '下线原因（选填）',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.reviewTemplate(template._id, 'rejected', res.content || '管理员下线')
            wx.showToast({ title: '已下线', icon: 'success' })
            this.loadAllTemplates()
            this.refreshPendingCount()
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 管理：删除任意模板
  async onManageDelete(e) {
    const { template } = e.detail
    wx.showModal({
      title: '删除模板',
      content: `确认永久删除「${template.name}」？此操作不可恢复。`,
      confirmColor: '#FF6B6B',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.adminDeleteTemplate(template._id)
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadAllTemplates()
            this.refreshPendingCount()
          } catch (err) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
