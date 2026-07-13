const { formatDateRange } = require('../../utils/date')
const { getAvatarColor, getAvatarText } = require('../../utils/constants')

Component({
  properties: {
    trip: {
      type: Object,
      value: {}
    },
    archived: {
      type: Boolean,
      value: false
    }
  },

  computed: {},

  data: {
    dateText: '',
    memberList: [],
    progressText: '',
    progressColor: ''
  },

  observers: {
    'trip': function(trip) {
      if (!trip || !trip._id) return

      const dateText = formatDateRange(trip.startDate, trip.endDate)

      const members = (trip.members || []).slice(0, 4).map(m => ({
        ...m,
        color: getAvatarColor(m._id),
        text: getAvatarText(m.nickName)
      }))

      const stats = trip.todoStats || { total: 0, completed: 0 }
      const progressText = stats.total > 0 ? `${stats.completed}/${stats.total} 完成` : '暂无待办'
      const progressColor = stats.total > 0 && stats.completed === stats.total ? '#52c41a' : '#007aff'

      this.setData({ dateText, memberList: members, progressText, progressColor })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('triptap', { trip: this.properties.trip })
    },

    onLongPress() {
      this.triggerEvent('triplongpress', { trip: this.properties.trip })
    }
  }
})
