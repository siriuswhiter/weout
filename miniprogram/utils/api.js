// utils/api.js - API 调用封装

/**
 * 统一的云函数调用接口
 * @param {string} name 云函数名称
 * @param {object} data 参数
 * @returns {Promise<object>}
 */
async function callCloudFunction(name, data = {}) {
  try {
    const res = await wx.cloud.callFunction({ name, data })
    if (res.result && res.result.success) {
      return res.result
    }
    const errMsg = (res.result && res.result.error) || '请求失败'
    throw new Error(errMsg)
  } catch (err) {
    console.error(`[API] ${name} 调用失败:`, err)
    throw err
  }
}

const api = {
  // ========== 行程相关 ==========
  createTrip(data) {
    return callCloudFunction('trip', { action: 'create', ...data })
  },
  getTrip(tripId) {
    return callCloudFunction('trip', { action: 'get', tripId })
  },
  listTrips() {
    return callCloudFunction('trip', { action: 'list' })
  },
  updateTrip(tripId, data) {
    return callCloudFunction('trip', { action: 'update', tripId, ...data })
  },
  deleteTrip(tripId) {
    return callCloudFunction('trip', { action: 'delete', tripId })
  },
  archiveTrip(tripId) {
    return callCloudFunction('trip', { action: 'archive', tripId })
  },

  // ========== Todo 相关 ==========
  createTodo(data) {
    return callCloudFunction('todo', { action: 'create', ...data })
  },
  listTodos(tripId) {
    return callCloudFunction('todo', { action: 'list', tripId })
  },
  updateTodo(todoId, data) {
    return callCloudFunction('todo', { action: 'update', todoId, ...data })
  },
  deleteTodo(todoId) {
    return callCloudFunction('todo', { action: 'delete', todoId })
  },
  completeTodo(todoId) {
    return callCloudFunction('todo', { action: 'complete', todoId })
  },
  uncompleteTodo(todoId) {
    return callCloudFunction('todo', { action: 'uncomplete', todoId })
  },

  // ========== 邀请相关 ==========
  generateInviteCode(tripId) {
    return callCloudFunction('invite', { action: 'generateCode', tripId })
  },
  joinByCode(code) {
    return callCloudFunction('invite', { action: 'joinByCode', code })
  },

  // ========== 模板相关 ==========
  createTemplate(data) {
    return callCloudFunction('template', { action: 'create', ...data })
  },
  getTemplate(templateId) {
    return callCloudFunction('template', { action: 'get', templateId })
  },
  listTemplates(query = {}) {
    return callCloudFunction('template', { action: 'list', ...query })
  },
  useTemplate(templateId, tripId) {
    return callCloudFunction('template', { action: 'use', templateId, tripId })
  },
  deleteTemplate(templateId) {
    return callCloudFunction('template', { action: 'delete', templateId })
  },

  // ========== 点赞相关 ==========
  likeTemplate(templateId) {
    return callCloudFunction('like', { action: 'like', templateId })
  },
  unlikeTemplate(templateId) {
    return callCloudFunction('like', { action: 'unlike', templateId })
  },
  checkLiked(templateId) {
    return callCloudFunction('like', { action: 'check', templateId })
  }
}

module.exports = { api, callCloudFunction }
