const { getAvatarColor, getAvatarText } = require('../../utils/constants')

Component({
  properties: {
    members: {
      type: Array,
      value: []
    },
    assignType: {
      type: String,
      value: 'all' // all | specific
    },
    selectedIds: {
      type: Array,
      value: []
    }
  },

  data: {
    memberList: []
  },

  observers: {
    'members, selectedIds': function(members, selectedIds) {
      const memberList = members.map(m => ({
        ...m,
        color: getAvatarColor(m._id),
        text: getAvatarText(m.nickName),
        selected: selectedIds.includes(m._id)
      }))
      this.setData({ memberList })
    }
  },

  methods: {
    onSelectAll() {
      this.triggerEvent('change', { assignType: 'all', selectedIds: [] })
    },

    onSelectMember(e) {
      const memberId = e.currentTarget.dataset.id
      const { selectedIds } = this.properties
      let newIds

      if (selectedIds.includes(memberId)) {
        newIds = selectedIds.filter(id => id !== memberId)
      } else {
        newIds = [...selectedIds, memberId]
      }

      this.triggerEvent('change', {
        assignType: newIds.length > 0 ? 'specific' : 'all',
        selectedIds: newIds
      })
    }
  }
})
