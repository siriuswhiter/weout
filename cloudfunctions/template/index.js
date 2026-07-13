// 云函数入口: template
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
        return await createTemplate(userId, event)
      case 'get':
        return await getTemplate(userId, event)
      case 'list':
        return await listTemplates(userId, event)
      case 'use':
        return await useTemplate(userId, event)
      case 'delete':
        return await deleteTemplate(userId, event)
      case 'myTemplates':
        return await myTemplates(userId)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error(`[template] ${action} 失败:`, err)
    return { success: false, error: err.message }
  }
}

// 创建模板
async function createTemplate(userId, event) {
  const { name, tags, items, visibility, tripId } = event

  if (!name || !items || items.length === 0) {
    return { success: false, error: '模板名称和内容不能为空' }
  }

  const templateData = {
    name: name.trim(),
    tags: tags || [],
    items: items.map(item => ({
      content: item.content,
      assignType: item.assignType || 'all'
    })),
    visibility: visibility || 'public',
    creatorId: userId,
    likeCount: 0,
    useCount: 0,
    createdAt: db.serverDate()
  }

  const res = await db.collection('templates').add({ data: templateData })

  // 获取创建者信息
  const creatorRes = await db.collection('users').doc(userId).get()

  return {
    success: true,
    templateId: res._id,
    template: {
      _id: res._id,
      ...templateData,
      creator: creatorRes.data
    }
  }
}

// 获取模板详情
async function getTemplate(userId, event) {
  const { templateId } = event

  const templateRes = await db.collection('templates').doc(templateId).get()
  const template = templateRes.data

  // 检查可见度权限
  if (template.visibility === 'private' && template.creatorId !== userId) {
    return { success: false, error: '无权访问该模板' }
  }

  // 获取创建者信息
  const creatorRes = await db.collection('users').doc(template.creatorId).get()

  // 检查当前用户是否已点赞
  const likeRes = await db.collection('likes').where({
    templateId,
    userId
  }).get()

  return {
    success: true,
    template: {
      ...template,
      creator: creatorRes.data,
      isLiked: likeRes.data.length > 0
    }
  }
}

// 获取模板列表（广场）
async function listTemplates(userId, event) {
  const { tag, keyword, page = 0, pageSize = 20 } = event

  const query = { visibility: 'public' }

  if (tag) {
    query.tags = tag
  }

  let dbQuery = db.collection('templates').where(query)

  if (keyword) {
    // 简单的关键词搜索（云数据库不支持全文搜索，用正则模拟）
    dbQuery = db.collection('templates').where({
      ...query,
      name: db.RegExp({ regexp: keyword, options: 'i' })
    })
  }

  const templatesRes = await dbQuery
    .orderBy('useCount', 'desc')
    .skip(page * pageSize)
    .limit(pageSize)
    .get()

  // 批量获取创建者信息
  const creatorIds = [...new Set(templatesRes.data.map(t => t.creatorId))]
  let creatorsData = []
  if (creatorIds.length > 0) {
    const creatorsRes = await db.collection('users').where({
      _id: _.in(creatorIds)
    }).get()
    creatorsData = creatorsRes.data
  }

  const creatorsMap = {}
  creatorsData.forEach(c => { creatorsMap[c._id] = c })

  const templates = templatesRes.data.map(t => ({
    ...t,
    creator: creatorsMap[t.creatorId] || null
  }))

  return {
    success: true,
    templates,
    hasMore: templates.length === pageSize
  }
}

// 使用模板（复制 Todo 到行程）
async function useTemplate(userId, event) {
  const { templateId, tripId } = event

  // 获取模板
  const templateRes = await db.collection('templates').doc(templateId).get()
  const template = templateRes.data

  // 验证用户是行程成员
  const tripRes = await db.collection('trips').doc(tripId).get()
  if (!tripRes.data.memberIds.includes(userId)) {
    return { success: false, error: '你不是该行程的成员' }
  }

  // 批量创建 Todo
  const todos = template.items.map(item => ({
    tripId,
    content: item.content,
    assignType: item.assignType || 'all',
    assigneeIds: [],
    dueDate: null,
    note: '',
    completed: false,
    completedBy: null,
    completedAt: null,
    creatorId: userId,
    createdAt: db.serverDate()
  }))

  // 逐条添加（云数据库不支持批量 add）
  for (const todo of todos) {
    await db.collection('todos').add({ data: todo })
  }

  // 更新模板使用次数
  await db.collection('templates').doc(templateId).update({
    data: { useCount: _.inc(1) }
  })

  // 更新行程 updatedAt
  await db.collection('trips').doc(tripId).update({
    data: { updatedAt: db.serverDate() }
  })

  return { success: true, count: todos.length }
}

// 删除模板
async function deleteTemplate(userId, event) {
  const { templateId } = event

  const templateRes = await db.collection('templates').doc(templateId).get()
  if (templateRes.data.creatorId !== userId) {
    return { success: false, error: '只有创建者可以删除模板' }
  }

  // 删除相关点赞
  await db.collection('likes').where({ templateId }).remove()
  // 删除模板
  await db.collection('templates').doc(templateId).remove()

  return { success: true }
}

// 获取我的模板
async function myTemplates(userId) {
  const templatesRes = await db.collection('templates')
    .where({ creatorId: userId })
    .orderBy('createdAt', 'desc')
    .get()

  return { success: true, templates: templatesRes.data }
}
