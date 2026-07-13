const { api } = require('../../../utils/api')
const { formatDateRange } = require('../../../utils/date')
const { getAvatarColor, getAvatarText } = require('../../../utils/constants')
const { startPolling, stopPolling } = require('../../../utils/sync')

Page({
  data: {
    tripId: '',
    trip: null,
    members: [],
    todos: [],
    filteredTodos: [],
    filter: 'all', // all | mine | undone
    loading: true,
    showAddModal: false,
    dateText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ tripId: options.id })
      this.loadData()
    }
  },

  onShow() {
    if (this.data.tripId && !this.data.loading) {
      this.loadTodos()
      // 启动轮询
      startPolling(this.data.tripId, () => this.loadTodos())
    }
  },

  onHide() {
    stopPolling()
  },

  onUnload() {
    stopPolling()
  },

  async loadData() {
    try {
      this.setData({ loading: true })
      const [tripRes, todosRes] = await Promise.all([
        api.getTrip(this.data.tripId),
        api.listTodos(this.data.tripId)
      ])

      const trip = tripRes.trip
      const members = (trip.members || []).map(m => ({
        ...m,
        color: getAvatarColor(m._id),
        text: getAvatarText(m.nickName)
      }))

      const dateText = formatDateRange(trip.startDate, trip.endDate)

      wx.setNavigationBarTitle({ title: trip.name })

      const todos = todosRes.todos || []

      this.setData({
        trip,
        members,
        todos,
        dateText,
        loading: false
      })

      this.applyFilter()

      // 启动轮询
      startPolling(this.data.tripId, () => this.loadTodos())
    } catch (err) {
      console.error('加载行程失败:', err)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  async loadTodos() {
    try {
      const res = await api.listTodos(this.data.tripId)
      this.setData({ todos: res.todos || [] })
      this.applyFilter()
    } catch (err) {
      console.error('加载待办失败:', err)
    }
  },

  // 筛选
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filter })
    this.applyFilter()
  },

  applyFilter() {
    const { todos, filter } = this.data
    const app = getApp()
    const userId = app.globalData.userId

    let filtered = todos
    switch (filter) {
      case 'mine':
        filtered = todos.filter(t =>
          t.assignType === 'all' || (t.assigneeIds && t.assigneeIds.includes(userId))
        )
        break
      case 'undone':
        filtered = todos.filter(t => !t.completed)
        break
    }

    this.setData({ filteredTodos: filtered })
  },

  // 添加 Todo
  onShowAddModal() {
    this.setData({ showAddModal: true })
  },

  onCloseAddModal() {
    this.setData({ showAddModal: false })
  },

  async onAddTodo(e) {
    const todoData = e.detail
    try {
      await api.createTodo({
        tripId: this.data.tripId,
        ...todoData
      })
      this.setData({ showAddModal: false })
      wx.showToast({ title: '添加成功', icon: 'success' })
      this.loadTodos()
    } catch (err) {
      wx.showToast({ title: '添加失败', icon: 'none' })
    }
  },

  // 完成/取消完成 Todo
  async onToggleTodo(e) {
    const { todo } = e.detail
    try {
      if (todo.completed) {
        await api.uncompleteTodo(todo._id)
      } else {
        await api.completeTodo(todo._id)
      }
      this.loadTodos()
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 删除 Todo
  async onDeleteTodo(e) {
    const { todo } = e.detail
    wx.showModal({
      title: '确认删除',
      content: `删除"${todo.content}"？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteTodo(todo._id)
            wx.showToast({ title: '已删除', icon: 'success' })
            this.loadTodos()
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 邀请成员
  onInvite() {
    wx.navigateTo({ url: `/pages/trips/invite/index?id=${this.data.tripId}` })
  },

  // 使用模板
  onUseTemplate() {
    wx.navigateTo({ url: `/pages/square/index/index?tripId=${this.data.tripId}&selectMode=true` })
  },

  // 分享
  onShareAppMessage() {
    const { trip } = this.data
    return {
      title: `来加入「${trip.name}」，一起准备出发吧！`,
      path: `/pages/trips/invite/index?id=${this.data.tripId}&code=${trip.inviteCode}`
    }
  }
})
