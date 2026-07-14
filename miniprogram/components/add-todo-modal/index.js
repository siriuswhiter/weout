const { getToday } = require('../../utils/date')
const { TODO_PRIORITIES } = require('../../utils/constants')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    members: {
      type: Array,
      value: []
    },
    existingTags: {
      type: Array,
      value: []
    }
  },

  data: {
    content: '',
    tags: [],
    tagInput: '',
    priority: 'normal',
    todoPriorities: TODO_PRIORITIES,
    assignType: 'all',
    selectedIds: [],
    dueDate: '',
    note: '',
    today: '',
    isEdit: false,
    _editTodoId: ''  // 内部保存编辑中的 todo ID
  },

  lifetimes: {
    attached() {
      this.setData({ today: getToday() })
    }
  },

  // 不再使用 observer，改用父组件直接调用方法

  methods: {
    /**
     * 父组件调用：设置编辑数据并打开弹窗
     * 彻底避免 observer 时序问题
     */
    setEditData(todo) {
      let dueDate = ''
      if (todo.dueDate) {
        const d = new Date(todo.dueDate)
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        dueDate = `${y}-${m}-${day}`
      }
      // 兼容旧数据：tag 字符串 → tags 数组
      let tags = todo.tags || []
      if (tags.length === 0 && todo.tag) {
        tags = [todo.tag]
      }
      this.setData({
        isEdit: true,
        _editTodoId: todo._id,
        content: todo.content || '',
        tags,
        tagInput: '',
        priority: todo.priority || 'normal',
        assignType: todo.assignType || 'all',
        selectedIds: todo.assigneeIds || [],
        dueDate,
        note: todo.note || ''
      })
    },

    onContentInput(e) {
      this.setData({ content: e.detail.value })
    },

    onTagInput(e) {
      this.setData({ tagInput: e.detail.value })
    },

    onTagConfirm(e) {
      const value = (e.detail.value || '').trim()
      if (!value) return
      const { tags } = this.data
      if (tags.includes(value)) {
        wx.showToast({ title: '标签已存在', icon: 'none' })
        this.setData({ tagInput: '' })
        return
      }
      this.setData({
        tags: [...tags, value],
        tagInput: ''
      })
    },

    onRemoveTag(e) {
      const idx = e.currentTarget.dataset.index
      const tags = this.data.tags.filter((_, i) => i !== idx)
      this.setData({ tags })
    },

    // 点击已有标签：已选中则移除，未选中则添加
    onSelectExistingTag(e) {
      const tag = e.currentTarget.dataset.tag
      if (!tag) return
      const { tags } = this.data
      if (tags.includes(tag)) {
        this.setData({ tags: tags.filter(t => t !== tag) })
      } else {
        this.setData({ tags: [...tags, tag] })
      }
    },

    onPriorityTap(e) {
      const value = e.currentTarget.dataset.value
      this.setData({ priority: value })
    },

    onNoteInput(e) {
      this.setData({ note: e.detail.value })
    },

    onMemberChange(e) {
      const { assignType, selectedIds } = e.detail
      this.setData({ assignType, selectedIds })
    },

    onDueDateChange(e) {
      this.setData({ dueDate: e.detail.value })
    },

    onClearDueDate() {
      this.setData({ dueDate: '' })
    },

    onConfirm() {
      const { content, tags, tagInput, assignType, selectedIds, dueDate, note, isEdit, _editTodoId } = this.data

      if (!content.trim()) {
        wx.showToast({ title: '请输入待办内容', icon: 'none' })
        return
      }

      // 如果输入框还有未确认的标签，自动加入
      const finalTags = [...tags]
      if (tagInput.trim() && !finalTags.includes(tagInput.trim())) {
        finalTags.push(tagInput.trim())
      }

      const detail = {
        content: content.trim(),
        tags: finalTags,
        priority: this.data.priority,
        assignType,
        assigneeIds: assignType === 'specific' ? selectedIds : [],
        dueDate: dueDate || null,
        note: note.trim()
      }

      if (isEdit && _editTodoId) {
        detail.todoId = _editTodoId
      }

      this.triggerEvent('confirm', detail)
    },

    onClose() {
      this.triggerEvent('close')
    },

    resetForm() {
      this.setData({
        content: '',
        tags: [],
        tagInput: '',
        priority: 'normal',
        assignType: 'all',
        selectedIds: [],
        dueDate: '',
        note: '',
        isEdit: false,
        _editTodoId: ''
      })
    },

    preventBubble() {
      // 阻止冒泡
    }
  }
})
