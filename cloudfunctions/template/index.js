// 云函数入口: template
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const { PRESET_TEMPLATES } = require('./presets')

// 官方账号标识（用于预置模板的创建者）
const OFFICIAL_OPEN_ID = 'official_weout_system'
const OFFICIAL_NICKNAME = '一起走官方'

// 管理员 openId 列表（MVP 阶段硬编码，后续可改为数据库配置）
const ADMIN_OPEN_IDS = [
  // 在这里添加管理员的 openId
  // 'oXXXXXXXXXXXXXXXXXXXXXXXXXX'
]

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { action } = event

  const userRes = await db.collection('users').where({ openId }).get()
  if (userRes.data.length === 0) {
    return { success: false, error: '用户未登录' }
  }
  const userId = userRes.data[0]._id
  const isAdmin = ADMIN_OPEN_IDS.includes(openId) || userRes.data[0].role === 'admin'

  try {
    switch (action) {
      case 'create':
        return await createTemplate(userId, event)
      case 'get':
        return await getTemplate(userId, event, isAdmin)
      case 'list':
        return await listTemplates(userId, event)
      case 'use':
        return await useTemplate(userId, event)
      case 'delete':
        return await deleteTemplate(userId, event)
      case 'myTemplates':
        return await myTemplates(userId)
      case 'review':
        return await reviewTemplate(userId, event, isAdmin)
      case 'pendingList':
        return await pendingList(userId, isAdmin)
      case 'checkAdmin':
        return { success: true, isAdmin }
      case 'popularTags':
        return await getPopularTags()
      case 'seedPresets':
        return await seedPresets(userId, isAdmin, event)
      case 'adminList':
        return await adminListTemplates(isAdmin, event)
      case 'adminDelete':
        return await adminDeleteTemplate(isAdmin, event)
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
  const { name, tags, items, visibility, tripId, description } = event

  if (!name || !items || items.length === 0) {
    return { success: false, error: '模板名称和内容不能为空' }
  }

  // 根据可见度决定审核状态：
  // - 公开模板需要审核
  // - 链接可见和私有模板直接通过
  const needReview = visibility === 'public'

  const templateData = {
    name: name.trim(),
    description: (description || '').trim(),
    tags: tags || [],
    items: items.map(item => ({
      content: item.content,
      assignType: item.assignType || 'all',
      tags: item.tags || (item.tag ? [item.tag] : []),
      priority: item.priority || 'normal'
    })),
    visibility: visibility || 'public',
    status: needReview ? 'pending' : 'approved',
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
    needReview,
    template: {
      _id: res._id,
      ...templateData,
      creator: creatorRes.data
    }
  }
}

// 获取模板详情
async function getTemplate(userId, event, isAdmin) {
  const { templateId } = event

  const templateRes = await db.collection('templates').doc(templateId).get()
  const template = templateRes.data

  // 检查可见度权限
  if (template.visibility === 'private' && template.creatorId !== userId) {
    return { success: false, error: '无权访问该模板' }
  }

  // 非创建者、非管理员不能查看待审核/已拒绝的公开模板
  if (template.status !== 'approved' && template.creatorId !== userId && !isAdmin) {
    return { success: false, error: '该模板正在审核中' }
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

// 获取模板列表（广场）- 仅展示已审核通过的公开模板
async function listTemplates(userId, event) {
  const { tag, keyword, page = 0, pageSize = 20 } = event

  const query = {
    visibility: 'public',
    status: 'approved'
  }

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
    tags: item.tags || (item.tag ? [item.tag] : []),
    priority: item.priority || 'normal',
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

// 审核模板（管理员操作）
async function reviewTemplate(userId, event, isAdmin) {
  if (!isAdmin) {
    return { success: false, error: '无权操作，仅管理员可审核' }
  }

  const { templateId, status, reviewNote } = event

  if (!['approved', 'rejected'].includes(status)) {
    return { success: false, error: '无效的审核状态' }
  }

  const templateRes = await db.collection('templates').doc(templateId).get()
  if (!templateRes.data) {
    return { success: false, error: '模板不存在' }
  }

  await db.collection('templates').doc(templateId).update({
    data: {
      status,
      reviewNote: reviewNote || '',
      reviewedBy: userId,
      reviewedAt: db.serverDate()
    }
  })

  return { success: true }
}

// 获取待审核模板列表（管理员操作）
async function pendingList(userId, isAdmin) {
  if (!isAdmin) {
    return { success: false, error: '无权操作，仅管理员可查看' }
  }

  const templatesRes = await db.collection('templates')
    .where({ status: 'pending', visibility: 'public' })
    .orderBy('createdAt', 'asc')
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

  return { success: true, templates }
}

// 管理员：获取全部模板（可按状态筛选、关键词搜索），用于模板管理
async function adminListTemplates(isAdmin, event) {
  if (!isAdmin) {
    return { success: false, error: '无权操作，仅管理员可查看' }
  }

  const { status, keyword, page = 0, pageSize = 50 } = event

  const query = {}
  // status 可为 'pending' | 'approved' | 'rejected'，不传则查全部
  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    query.status = status
  }

  let dbQuery
  if (keyword) {
    dbQuery = db.collection('templates').where({
      ...query,
      name: db.RegExp({ regexp: keyword, options: 'i' })
    })
  } else {
    dbQuery = db.collection('templates').where(query)
  }

  const templatesRes = await dbQuery
    .orderBy('createdAt', 'desc')
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

// 管理员：删除任意模板（含关联点赞）
async function adminDeleteTemplate(isAdmin, event) {
  if (!isAdmin) {
    return { success: false, error: '无权操作，仅管理员可删除' }
  }

  const { templateId } = event
  if (!templateId) {
    return { success: false, error: '缺少模板 ID' }
  }

  const templateRes = await db.collection('templates').doc(templateId).get()
  if (!templateRes.data) {
    return { success: false, error: '模板不存在' }
  }

  // 删除相关点赞
  await db.collection('likes').where({ templateId }).remove()
  // 删除模板
  await db.collection('templates').doc(templateId).remove()

  return { success: true }
}

// 获取热门标签（按使用次数排序）
async function getPopularTags() {
  // 获取所有已通过的公开模板的标签
  const templatesRes = await db.collection('templates')
    .where({ status: 'approved', visibility: 'public' })
    .field({ tags: true })
    .get()

  // 统计每个标签出现的次数
  const tagCount = {}
  templatesRes.data.forEach(t => {
    (t.tags || []).forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1
    })
  })

  // 按使用次数降序排列，取前 10 个
  const popularTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }))

  return { success: true, popularTags }
}

// 获取或创建官方账号（用于预置模板的创建者）
async function getOrCreateOfficialUser() {
  const res = await db.collection('users').where({ openId: OFFICIAL_OPEN_ID }).get()
  if (res.data.length > 0) {
    return res.data[0]._id
  }
  const addRes = await db.collection('users').add({
    data: {
      openId: OFFICIAL_OPEN_ID,
      nickName: OFFICIAL_NICKNAME,
      avatarUrl: '',
      role: 'official',
      createdAt: db.serverDate()
    }
  })
  return addRes._id
}

// 写入预置官方模板（仅管理员可执行，幂等）
// 通过 presetKey 字段去重，已存在的模板会跳过；传入 force=true 可覆盖更新内容
async function seedPresets(userId, isAdmin, event) {
  if (!isAdmin) {
    return { success: false, error: '无权操作，仅管理员可初始化预置模板' }
  }

  const force = event && event.force === true
  const officialUserId = await getOrCreateOfficialUser()

  let created = 0
  let updated = 0
  let skipped = 0
  const details = []

  for (const preset of PRESET_TEMPLATES) {
    const templateData = {
      presetKey: preset.key,
      name: preset.name,
      description: preset.description || '',
      tags: preset.tags || [],
      items: (preset.items || []).map(item => ({
        content: item.content,
        assignType: item.assignType || 'all',
        tags: item.tags || [],
        priority: item.priority || 'normal'
      })),
      visibility: 'public',
      status: 'approved',
      creatorId: officialUserId,
      isPreset: true
    }

    // 幂等：按 presetKey 查询是否已存在
    const existRes = await db.collection('templates').where({ presetKey: preset.key }).get()

    if (existRes.data.length > 0) {
      if (force) {
        // 覆盖更新（保留原有的点赞/使用计数与创建时间）
        await db.collection('templates').doc(existRes.data[0]._id).update({
          data: {
            name: templateData.name,
            description: templateData.description,
            tags: templateData.tags,
            items: templateData.items,
            visibility: templateData.visibility,
            status: templateData.status,
            creatorId: templateData.creatorId,
            isPreset: true
          }
        })
        updated++
        details.push({ key: preset.key, action: 'updated' })
      } else {
        skipped++
        details.push({ key: preset.key, action: 'skipped' })
      }
      continue
    }

    // 新增
    await db.collection('templates').add({
      data: {
        ...templateData,
        likeCount: 0,
        useCount: 0,
        createdAt: db.serverDate()
      }
    })
    created++
    details.push({ key: preset.key, action: 'created' })
  }

  return {
    success: true,
    officialUserId,
    total: PRESET_TEMPLATES.length,
    created,
    updated,
    skipped,
    details
  }
}
