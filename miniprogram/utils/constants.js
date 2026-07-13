// utils/constants.js - 常量定义

// 模板标签
const TEMPLATE_TAGS = ['海边', '露营', '滑雪', '出国', '自驾', '登山', '城市', '亲子']

// 可见度选项
const VISIBILITY_OPTIONS = [
  { label: '公开', value: 'public', desc: '所有人可在广场看到' },
  { label: '链接可见', value: 'link', desc: '仅通过链接可访问' },
  { label: '私有', value: 'private', desc: '仅自己可见' }
]

// 行程状态
const TRIP_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived'
}

// Todo 指派类型
const ASSIGN_TYPE = {
  ALL: 'all',
  SPECIFIC: 'specific'
}

// 轮询间隔（毫秒）
const POLLING_INTERVAL = 15000

// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 3600000

// 邀请码长度
const INVITE_CODE_LENGTH = 6

// 头像颜色列表
const AVATAR_COLORS = [
  '#007aff', '#ff6b6b', '#ffa94d', '#845ef7',
  '#20c997', '#fd7e14', '#e64980', '#5c7cfa',
  '#12b886', '#f06595'
]

/**
 * 根据用户ID获取头像颜色
 */
function getAvatarColor(userId) {
  if (!userId) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/**
 * 获取用户昵称首字
 */
function getAvatarText(nickName) {
  if (!nickName) return '?'
  return nickName.charAt(nickName.length - 1)
}

module.exports = {
  TEMPLATE_TAGS,
  VISIBILITY_OPTIONS,
  TRIP_STATUS,
  ASSIGN_TYPE,
  POLLING_INTERVAL,
  CACHE_EXPIRY,
  INVITE_CODE_LENGTH,
  AVATAR_COLORS,
  getAvatarColor,
  getAvatarText
}
