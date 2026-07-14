const auth = require('../../utils/auth')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    nickName: '',
    avatarUrl: ''
  },

  methods: {
    // 微信头像选择回调
    onChooseAvatar(e) {
      this.setData({ avatarUrl: e.detail.avatarUrl })
    },

    // 微信昵称输入回调
    onNicknameInput(e) {
      this.setData({ nickName: e.detail.value })
    },

    // 跳过，使用默认信息
    onSkip() {
      wx.setStorageSync('yqz_welcome_done', true)
      this.triggerEvent('done')
    },

    // 确认，保存用户信息
    async onConfirm() {
      const { nickName, avatarUrl } = this.data
      const updateData = {}

      if (nickName && nickName.trim()) {
        updateData.nickName = nickName.trim()
      }
      if (avatarUrl) {
        updateData.avatarUrl = avatarUrl
      }

      if (Object.keys(updateData).length > 0) {
        try {
          await auth.updateUserInfo(updateData)
        } catch (err) {
          console.error('更新用户信息失败:', err)
        }
      }

      wx.setStorageSync('yqz_welcome_done', true)
      this.triggerEvent('done')
    },

    // 阻止冒泡
    preventBubble() {}
  }
})
