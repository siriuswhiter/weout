const { api } = require('../../utils/api')
const { TEMPLATE_TAGS, VISIBILITY_OPTIONS } = require('../../utils/constants')

Page({
  data: {
    tripId: '',
    tripName: '',
    todos: [],
    name: '',
    description: '',
    selectedTags: [],
    allTags: TEMPLATE_TAGS,
    // 用对象记录选中状态，避免 WXML 中 indexOf 不可靠
    tagSelected: {},
    customTagInput: '',
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

  onDescInput(e) {
    this.setData({ description: e.detail.value })
  },

  onTagTap(e) {
    const tag = e.currentTarget.dataset.tag
    const { selectedTags, tagSelected } = this.data
    const index = selectedTags.indexOf(tag)

    if (index > -1) {
      selectedTags.splice(index, 1)
      tagSelected[tag] = false
    } else {
      selectedTags.push(tag)
      tagSelected[tag] = true
    }

    this.setData({
      selectedTags: [...selectedTags],
      tagSelected: { ...tagSelected }
    })
  },

  onCustomTagInput(e) {
    this.setData({ customTagInput: e.detail.value })
  },

  onAddCustomTag() {
    const tag = this.data.customTagInput.trim()
    if (!tag) return

    const { allTags, selectedTags, tagSelected } = this.data

    // 检查是否已存在（预设标签或已添加的自定义标签）
    if (allTags.includes(tag) || selectedTags.includes(tag)) {
      // 如果标签已存在但未选中，自动选中
      if (!selectedTags.includes(tag)) {
        tagSelected[tag] = true
        this.setData({
          selectedTags: [...selectedTags, tag],
          tagSelected: { ...tagSelected },
          customTagInput: ''
        })
      } else {
        wx.showToast({ title: '标签已存在', icon: 'none' })
        this.setData({ customTagInput: '' })
      }
      return
    }

    // 添加自定义标签并自动选中
    tagSelected[tag] = true
    this.setData({
      allTags: [...allTags, tag],
      selectedTags: [...selectedTags, tag],
      tagSelected: { ...tagSelected },
      customTagInput: ''
    })
  },

  onVisibilityChange(e) {
    this.setData({ visibilityIndex: e.detail.value })
  },

  onToggleTodo(e) {
    const idx = e.currentTarget.dataset.index
    this.setData({ [`todos[${idx}].selected`]: !this.data.todos[idx].selected })
  },

  async onSubmit() {
    const { name, description, selectedTags, visibilityIndex, todos } = this.data

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
      const res = await api.createTemplate({
        name: name.trim(),
        description: description.trim(),
        tags: selectedTags,
        items: selectedTodos.map(t => ({
          content: t.content,
          assignType: t.assignType,
          tags: t.tags || (t.tag ? [t.tag] : []),
          priority: t.priority || 'normal'
        })),
        visibility: VISIBILITY_OPTIONS[visibilityIndex].value
      })

      if (res.needReview) {
        wx.showToast({ title: '已提交，等待审核', icon: 'none' })
      } else {
        wx.showToast({ title: '发布成功', icon: 'success' })
      }
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      wx.showToast({ title: '发布失败', icon: 'none' })
      this.setData({ submitting: false })
    }
  }
})
