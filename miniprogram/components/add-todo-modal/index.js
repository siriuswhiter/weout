const { getToday } = require('../../utils/date')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    members: {
      type: Array,
      value: []
    }
  },

  data: {
    content: '',
    assignType: 'all',
    selectedIds: [],
    dueDate: '',
    note: '',
    today: ''
  },

  lifetimes: {
    attached() {
      this.setData({ today: getToday() })
    }
  },

  methods: {
    onContentInput(e) {
      this.setData({ content: e.detail.value })
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
      const { content, assignType, selectedIds, dueDate, note } = this.data

      if (!content.trim()) {
        wx.showToast({ title: '请输入待办内容', icon: 'none' })
        return
      }

      this.triggerEvent('confirm', {
        content: content.trim(),
        assignType,
        assigneeIds: assignType === 'specific' ? selectedIds : [],
        dueDate: dueDate || null,
        note: note.trim()
      })

      // 重置表单
      this.setData({
        content: '',
        assignType: 'all',
        selectedIds: [],
        dueDate: '',
        note: ''
      })
    },

    onClose() {
      this.triggerEvent('close')
    },

    preventBubble() {
      // 阻止冒泡
    }
  }
})
