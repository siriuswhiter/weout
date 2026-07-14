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
    progressColor: '',
    progressBgColor: ''
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
      const progressText = stats.total > 0 ? `${stats.completed}/${stats.total}` : '暂无待办'
      let progressColor, progressBgColor
      if (stats.total > 0 && stats.completed === stats.total) {
        progressColor = '#16A34A'
        progressBgColor = '#E8F8ED'
      } else if (stats.total > 0) {
        progressColor = '#4F6EF7'
        progressBgColor = '#EEF1FE'
      } else {
        progressColor = '#9CA3AF'
        progressBgColor = '#F0F1F5'
      }

      this.setData({ dateText, memberList: members, progressText, progressColor, progressBgColor })
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
