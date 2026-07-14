Component({
  properties: {
    template: {
      type: Object,
      value: {}
    },
    showUseBtn: {
      type: Boolean,
      value: false
    },
    showDelete: {
      type: Boolean,
      value: false
    },
    showStatus: {
      type: Boolean,
      value: false
    },
    showReview: {
      type: Boolean,
      value: false
    },
    showManage: {
      type: Boolean,
      value: false
    }
  },

  data: {
    itemPreview: '',
    statusLabel: '',
    statusColor: ''
  },

  observers: {
    'template': function(tpl) {
      if (!tpl || !tpl.items) return
      const preview = tpl.items.slice(0, 3).map(i => i.content).join('、')
      const suffix = tpl.items.length > 3 ? `等 ${tpl.items.length} 项` : ''
      this.setData({ itemPreview: preview + suffix })

      // 审核状态映射
      const statusMap = {
        pending: { label: '待审核', color: '#FF9F0A' },
        approved: { label: '已通过', color: '#34C759' },
        rejected: { label: '已拒绝', color: '#FF6B6B' }
      }
      const statusInfo = statusMap[tpl.status] || statusMap.approved
      this.setData({
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color
      })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('templatetap', { template: this.properties.template })
    },

    onUse(e) {
      // 阻止冒泡到卡片点击
      this.triggerEvent('templateuse', { template: this.properties.template })
    },

    onDelete(e) {
      this.triggerEvent('templatedelete', { template: this.properties.template })
    },

    onApprove(e) {
      this.triggerEvent('templateapprove', { template: this.properties.template })
    },

    onReject(e) {
      this.triggerEvent('templatereject', { template: this.properties.template })
    },

    // 管理：上架（改为 approved）
    onPublish(e) {
      this.triggerEvent('templatepublish', { template: this.properties.template })
    },

    // 管理：下线（改为 rejected）
    onUnpublish(e) {
      this.triggerEvent('templateunpublish', { template: this.properties.template })
    },

    // 管理：删除（管理员删除任意模板）
    onManageDelete(e) {
      this.triggerEvent('templatemanagedelete', { template: this.properties.template })
    }
  }
})
