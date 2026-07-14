const { getAvatarColor, getAvatarText } = require('../../utils/constants')
const { formatDate, isDueSoon, isExpired } = require('../../utils/date')

Component({
  properties: {
    todo: {
      type: Object,
      value: {}
    },
    members: {
      type: Array,
      value: []
    }
  },

  data: {
    assigneeInfo: [],
    tagLabels: [],
    dueDateText: '',
    dueDateClass: ''
  },

  observers: {
    'todo, members': function(todo, members) {
      if (!todo || !todo._id) return

      // 处理指派人信息
      let assigneeInfo = []
      if (todo.assignType === 'all') {
        assigneeInfo = [{ text: '所有人', isAll: true }]
      } else if (todo.assigneeIds && todo.assigneeIds.length > 0) {
        assigneeInfo = todo.assigneeIds.map(id => {
          const member = members.find(m => m._id === id)
          return member ? {
            text: getAvatarText(member.nickName),
            color: getAvatarColor(member._id),
            avatarUrl: member.avatarUrl || '',
            nickName: member.nickName
          } : { text: '?', color: '#ccc', avatarUrl: '' }
        })
      }

      // 处理截止时间
      let dueDateText = ''
      let dueDateClass = ''
      if (todo.dueDate) {
        dueDateText = formatDate(todo.dueDate, 'MM/DD')
        if (isExpired(todo.dueDate) && !todo.completed) {
          dueDateClass = 'overdue'
        } else if (isDueSoon(todo.dueDate) && !todo.completed) {
          dueDateClass = 'due-soon'
        }
      }

      // 处理标签（兼容旧 tag 字符串和新 tags 数组）
      let tagLabels = todo.tags || []
      if (tagLabels.length === 0 && todo.tag) {
        tagLabels = [todo.tag]
      }

      this.setData({ assigneeInfo, tagLabels, dueDateText, dueDateClass })
    }
  },

  methods: {
    onToggle() {
      this.triggerEvent('toggle', { todo: this.properties.todo })
    },

    onDelete() {
      this.triggerEvent('delete', { todo: this.properties.todo })
    },

    onLongPress() {
      wx.vibrateShort({ type: 'medium' })
      this.triggerEvent('edit', { todo: this.properties.todo })
    },

    // 左滑删除相关
    touchStartX: 0,
    touchStartY: 0,

    onTouchStart(e) {
      this.touchStartX = e.touches[0].clientX
      this.touchStartY = e.touches[0].clientY
    },

    onTouchEnd(e) {
      const deltaX = e.changedTouches[0].clientX - this.touchStartX
      const deltaY = e.changedTouches[0].clientY - this.touchStartY

      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -60) {
        this.onDelete()
      }
    }
  }
})
