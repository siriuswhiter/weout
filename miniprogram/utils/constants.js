// utils/constants.js - 常量定义

// 模板标签
const TEMPLATE_TAGS = ['海边', '露营', '滑雪', '出国', '自驾', '登山', '城市', '亲子']

// 可见度选项
const VISIBILITY_OPTIONS = [
  { label: '公开', value: 'public', desc: '所有人可在广场看到' },
  { label: '链接可见', value: 'link', desc: '仅通过链接可访问' },
  { label: '私有', value: 'private', desc: '仅自己可见' }
]

// 模板审核状态
const TEMPLATE_STATUS = {
  PENDING: 'pending',     // 待审核
  APPROVED: 'approved',   // 已通过
  REJECTED: 'rejected'    // 已拒绝
}

// 审核状态显示配置
const TEMPLATE_STATUS_MAP = {
  pending: { label: '待审核', color: '#FF9F0A' },
  approved: { label: '已通过', color: '#34C759' },
  rejected: { label: '已拒绝', color: '#FF6B6B' }
}

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

// Todo 优先级
const TODO_PRIORITIES = [
  { label: '普通', value: 'normal', color: '' },
  { label: '重要', value: 'high', color: '#FF9F0A' },
  { label: '紧急', value: 'urgent', color: '#FF6B6B' }
]

// 轮询间隔（毫秒）
const POLLING_INTERVAL = 15000

// 缓存过期时间（毫秒）
const CACHE_EXPIRY = 3600000

// 邀请码长度
const INVITE_CODE_LENGTH = 6

// 头像颜色列表
const AVATAR_COLORS = [
  '#4F6EF7', '#FF6B6B', '#FF9F0A', '#8B5CF6',
  '#34C759', '#F97316', '#EC4899', '#6B8AFF',
  '#14B8A6', '#F472B6'
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
  TEMPLATE_STATUS,
  TEMPLATE_STATUS_MAP,
  TRIP_STATUS,
  ASSIGN_TYPE,
  TODO_PRIORITIES,
  POLLING_INTERVAL,
  CACHE_EXPIRY,
  INVITE_CODE_LENGTH,
  AVATAR_COLORS,
  getAvatarColor,
  getAvatarText
}
