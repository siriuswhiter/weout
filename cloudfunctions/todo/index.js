// 云函数入口: todo
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { action } = event

  const userRes = await db.collection('users').where({ openId }).get()
  if (userRes.data.length === 0) {
    return { success: false, error: '用户未登录' }
  }
  const userId = userRes.data[0]._id

  try {
    switch (action) {
      case 'create':
        return await createTodo(userId, event)
      case 'list':
        return await listTodos(userId, event)
      case 'update':
        return await updateTodo(userId, event)
      case 'delete':
        return await deleteTodo(userId, event)
      case 'complete':
        return await completeTodo(userId, event)
      case 'uncomplete':
        return await uncompleteTodo(userId, event)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error(`[todo] ${action} 失败:`, err)
    return { success: false, error: err.message }
  }
}

// 创建 Todo
async function createTodo(userId, event) {
  const { tripId, content, assignType, assigneeIds, dueDate, note, tags, tag, priority } = event

  if (!tripId || !content) {
    return { success: false, error: '参数不完整' }
  }

  // 验证用户是行程成员
  const tripRes = await db.collection('trips').doc(tripId).get()
  if (!tripRes.data.memberIds.includes(userId)) {
    return { success: false, error: '你不是该行程的成员' }
  }

  const todoData = {
    tripId,
    content: content.trim(),
    tags: tags || (tag ? [tag] : []),
    priority: priority || 'normal', // normal | high | urgent
    assignType: assignType || 'all',
    assigneeIds: assignType === 'specific' ? (assigneeIds || []) : [],
    dueDate: dueDate ? new Date(dueDate) : null,
    note: note || '',
    completed: false,
    completedBy: null,
    completedAt: null,
    creatorId: userId,
    createdAt: db.serverDate()
  }

  const res = await db.collection('todos').add({ data: todoData })

  // 更新行程的 updatedAt
  await db.collection('trips').doc(tripId).update({
    data: { updatedAt: db.serverDate() }
  })

  return { success: true, todoId: res._id, todo: { _id: res._id, ...todoData } }
}

// 获取行程的 Todo 列表
async function listTodos(userId, event) {
  const { tripId } = event

  // 验证用户是行程成员
  const tripRes = await db.collection('trips').doc(tripId).get()
  if (!tripRes.data.memberIds.includes(userId)) {
    return { success: false, error: '你不是该行程的成员' }
  }

  const todosRes = await db.collection('todos')
    .where({ tripId })
    .orderBy('createdAt', 'asc')
    .get()

  return { success: true, todos: todosRes.data }
}

// 更新 Todo
async function updateTodo(userId, event) {
  const { todoId, content, assignType, assigneeIds, dueDate, note, tags, priority } = event

  const updateData = {}
  if (content !== undefined) updateData.content = content.trim()
  if (tags !== undefined) updateData.tags = tags
  if (priority !== undefined) updateData.priority = priority
  if (assignType !== undefined) updateData.assignType = assignType
  if (assigneeIds !== undefined) updateData.assigneeIds = assigneeIds
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  if (note !== undefined) updateData.note = note

  await db.collection('todos').doc(todoId).update({ data: updateData })
  return { success: true }
}

// 删除 Todo
async function deleteTodo(userId, event) {
  const { todoId } = event
  await db.collection('todos').doc(todoId).remove()
  return { success: true }
}

// 完成 Todo
async function completeTodo(userId, event) {
  const { todoId } = event
  await db.collection('todos').doc(todoId).update({
    data: {
      completed: true,
      completedBy: userId,
      completedAt: db.serverDate()
    }
  })
  return { success: true }
}

// 取消完成 Todo
async function uncompleteTodo(userId, event) {
  const { todoId } = event
  await db.collection('todos').doc(todoId).update({
    data: {
      completed: false,
      completedBy: null,
      completedAt: null
    }
  })
  return { success: true }
}
