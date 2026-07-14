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
    tagFilter: '',  // 空字符串表示全部标签
    todoTags: [],   // 动态从 todos 中提取
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

  // 状态筛选
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ filter })
    this.applyFilter()
  },

  // 标签筛选
  onTagFilterChange(e) {
    const tag = e.currentTarget.dataset.tag
    // 点击已选中的标签则取消筛选
    this.setData({ tagFilter: this.data.tagFilter === tag ? '' : tag })
    this.applyFilter()
  },

  applyFilter() {
    const { todos, filter, tagFilter } = this.data
    const app = getApp()
    const userId = app.globalData.userId

    // 动态提取当前 todos 中的所有标签（去重，兼容旧 tag 和新 tags）
    const tagSet = new Set()
    todos.forEach(t => {
      if (t.tags && t.tags.length > 0) {
        t.tags.forEach(tag => tagSet.add(tag))
      } else if (t.tag) {
        tagSet.add(t.tag)
      }
    })
    const todoTags = Array.from(tagSet).sort()

    // 如果当前选中的标签已不存在于 todos 中，自动重置
    const validTagFilter = tagFilter && tagSet.has(tagFilter) ? tagFilter : ''
    if (validTagFilter !== tagFilter) {
      this.setData({ tagFilter: validTagFilter })
    }

    let filtered = todos

    // 状态筛选
    switch (filter) {
      case 'mine':
        filtered = filtered.filter(t =>
          t.assignType === 'all' || (t.assigneeIds && t.assigneeIds.includes(userId))
        )
        break
      case 'undone':
        filtered = filtered.filter(t => !t.completed)
        break
    }

    // 标签筛选（兼容旧 tag 和新 tags）
    if (validTagFilter) {
      filtered = filtered.filter(t => {
        if (t.tags && t.tags.length > 0) {
          return t.tags.includes(validTagFilter)
        }
        return t.tag === validTagFilter
      })
    }

    // 按优先级排序：紧急 > 重要 > 普通，已完成的沉底
    const priorityOrder = { urgent: 0, high: 1, normal: 2 }
    filtered = filtered.slice().sort((a, b) => {
      // 已完成的排最后
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      // 按优先级排序
      const pa = priorityOrder[a.priority] ?? 2
      const pb = priorityOrder[b.priority] ?? 2
      return pa - pb
    })

    this.setData({ filteredTodos: filtered, todoTags })
  },

  // 添加 Todo
  onShowAddModal() {
    const modal = this.selectComponent('#addTodoModal')
    if (modal) modal.resetForm()
    this.setData({ showAddModal: true })
  },

  onCloseAddModal() {
    this.setData({ showAddModal: false })
  },

  // 长按编辑 Todo
  onEditTodo(e) {
    const { todo } = e.detail
    const modal = this.selectComponent('#addTodoModal')
    if (modal) modal.setEditData(todo)
    this.setData({ showAddModal: true })
  },

  // 统一处理新增和编辑
  async onConfirmTodo(e) {
    const data = e.detail
    try {
      if (data.todoId) {
        // 编辑模式
        const { todoId, ...updateData } = data
        await api.updateTodo(todoId, updateData)
        this.setData({ showAddModal: false })
        wx.showToast({ title: '修改成功', icon: 'success' })
      } else {
        // 新增模式
        await api.createTodo({
          tripId: this.data.tripId,
          ...data
        })
        this.setData({ showAddModal: false })
        wx.showToast({ title: '添加成功', icon: 'success' })
      }
      this.loadTodos()
    } catch (err) {
      wx.showToast({ title: '操作失败', icon: 'none' })
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

  // 更多操作
  onShowMore() {
    const items = ['使用模板']
    if (this.data.todos.length > 0) {
      items.push('发布为模板')
    }
    items.push('归档行程')

    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const action = items[res.tapIndex]
        switch (action) {
          case '使用模板':
            wx.navigateTo({ url: `/pages/square/index/index?tripId=${this.data.tripId}&selectMode=true` })
            break
          case '发布为模板':
            wx.navigateTo({ url: `/pages/template-publish/index?tripId=${this.data.tripId}` })
            break
          case '归档行程':
            this.onArchiveTrip()
            break
        }
      }
    })
  },

  // 归档行程
  onArchiveTrip() {
    wx.showModal({
      title: '归档行程',
      content: '归档后行程将移至历史记录',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.archiveTrip(this.data.tripId)
            wx.showToast({ title: '已归档', icon: 'success' })
            setTimeout(() => wx.navigateBack(), 500)
          } catch (err) {
            wx.showToast({ title: '操作失败', icon: 'none' })
          }
        }
      }
    })
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
