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
    }
  },

  data: {
    itemPreview: ''
  },

  observers: {
    'template': function(tpl) {
      if (!tpl || !tpl.items) return
      const preview = tpl.items.slice(0, 3).map(i => i.content).join('、')
      const suffix = tpl.items.length > 3 ? `等 ${tpl.items.length} 项` : ''
      this.setData({ itemPreview: preview + suffix })
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { template: this.properties.template })
    },

    onUse(e) {
      // 阻止冒泡到卡片点击
      this.triggerEvent('use', { template: this.properties.template })
    },

    onDelete(e) {
      this.triggerEvent('delete', { template: this.properties.template })
    }
  }
})
