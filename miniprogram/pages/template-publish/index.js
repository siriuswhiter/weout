const { api } = require('../../utils/api')
const { TEMPLATE_TAGS, VISIBILITY_OPTIONS } = require('../../utils/constants')

Page({
  data: {
    tripId: '',
    tripName: '',
    todos: [],
    name: '',
    selectedTags: [],
    allTags: TEMPLATE_TAGS,
    visibilityOptions: VISIBILITY_OPTIONS,
    visibilityIndex: 0,
    submitting: false
  },

  onLoad(options) {
    if (options.tripId) {
      this.setData({ tripId: options.tripId })
      this.loadTripData()
    }
  },

  async loadTripData() {
    try {
      const [tripRes, todosRes] = await Promise.all([
        api.getTrip(this.data.tripId),
        api.listTodos(this.data.tripId)
      ])

      const todos = (todosRes.todos || []).map(t => ({
        ...t,
        selected: true
      }))

      this.setData({
        tripName: tripRes.trip.name,
        name: tripRes.trip.name + ' 清单',
        todos
      })
    } catch (err) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    const { selectedTags } = this.data
    const index = selectedTags.indexOf(tag)

    if (index > -1) {
      selectedTags.splice(index, 1)
    } else {
      selectedTags.push(tag)
    }

    this.setData({ selectedTags: [...selectedTags] })
  },

  onVisibilityChange(e) {
    this.setData({ visibilityIndex: e.detail.value })
  },

  onToggleTodo(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ [`todos[${idx}].selected`]: !this.data.todos[idx].selected })
  },

  async onSubmit() {
    const { name, selectedTags, visibilityIndex, todos } = this.data

    if (!name.trim()) {
      wx.showToast({ title: '请输入模板名称', icon: 'none' })
      return
    }

    const selectedTodos = todos.filter(t => t.selected)
    if (selectedTodos.length === 0) {
      wx.showToast({ title: '请至少选择一项', icon: 'none' })
      return
    }

    if (this.data.submitting) return
    this.setData({ submitting: true })

    try {
      await api.createTemplate({
        name: name.trim(),
        tags: selectedTags,
        items: selectedTodos.map(t => ({
          content: t.content,
          assignType: t.assignType
        })),
        visibility: VISIBILITY_OPTIONS[visibilityIndex].value
      })

      wx.showToast({ title: '发布成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 500)
    } catch (err) {
      wx.showToast({ title: '发布失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})
