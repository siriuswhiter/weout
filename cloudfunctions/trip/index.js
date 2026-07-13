// 云函数入口: trip
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { action } = event

  // 获取用户ID
  const userRes = await db.collection('users').where({ openId }).get()
  if (userRes.data.length === 0) {
    return { success: false, error: '用户未登录' }
  }
  const userId = userRes.data[0]._id

  try {
    switch (action) {
      case 'create':
        return await createTrip(userId, event)
      case 'get':
        return await getTrip(userId, event)
      case 'list':
        return await listTrips(userId)
      case 'update':
        return await updateTrip(userId, event)
      case 'delete':
        return await deleteTrip(userId, event)
      case 'archive':
        return await archiveTrip(userId, event)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error(`[trip] ${action} 失败:`, err)
    return { success: false, error: err.message }
  }
}

// 创建行程
async function createTrip(userId, event) {
  const { name, destination, startDate, endDate } = event

  if (!name) {
    return { success: false, error: '行程名称不能为空' }
  }

  // 生成邀请码
  const inviteCode = generateInviteCode()

  const tripData = {
    name,
    destination: destination || '',
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    creatorId: userId,
    memberIds: [userId],
    inviteCode,
    status: 'active',
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }

  const res = await db.collection('trips').add({ data: tripData })
  return {
    success: true,
    tripId: res._id,
    trip: { _id: res._id, ...tripData }
  }
}

// 获取行程详情
async function getTrip(userId, event) {
  const { tripId } = event
  const tripRes = await db.collection('trips').doc(tripId).get()
  const trip = tripRes.data

  // 检查是否是成员
  if (!trip.memberIds.includes(userId)) {
    return { success: false, error: '无权访问该行程' }
  }

  // 获取成员信息
  const membersRes = await db.collection('users').where({
    _id: _.in(trip.memberIds)
  }).get()

  // 获取 Todo 统计
  const todosRes = await db.collection('todos').where({ tripId }).get()
  const totalTodos = todosRes.data.length
  const completedTodos = todosRes.data.filter(t => t.completed).length

  return {
    success: true,
    trip: {
      ...trip,
      members: membersRes.data,
      todoStats: { total: totalTodos, completed: completedTodos }
    }
  }
}

// 获取用户行程列表
async function listTrips(userId) {
  const tripsRes = await db.collection('trips').where({
    memberIds: userId
  }).orderBy('updatedAt', 'desc').get()

  const trips = tripsRes.data

  // 批量获取 Todo 统计
  const tripIds = trips.map(t => t._id)
  let todosData = []
  if (tripIds.length > 0) {
    const todosRes = await db.collection('todos').where({
      tripId: _.in(tripIds)
    }).get()
    todosData = todosRes.data
  }

  // 批量获取成员信息
  const allMemberIds = [...new Set(trips.flatMap(t => t.memberIds))]
  let membersData = []
  if (allMemberIds.length > 0) {
    const membersRes = await db.collection('users').where({
      _id: _.in(allMemberIds)
    }).get()
    membersData = membersRes.data
  }

  const membersMap = {}
  membersData.forEach(m => { membersMap[m._id] = m })

  // 组装数据
  const enrichedTrips = trips.map(trip => {
    const tripTodos = todosData.filter(t => t.tripId === trip._id)
    const members = trip.memberIds.map(id => membersMap[id]).filter(Boolean)
    return {
      ...trip,
      members,
      todoStats: {
        total: tripTodos.length,
        completed: tripTodos.filter(t => t.completed).length
      }
    }
  })

  return { success: true, trips: enrichedTrips }
}

// 更新行程
async function updateTrip(userId, event) {
  const { tripId, name, destination, startDate, endDate } = event

  const tripRes = await db.collection('trips').doc(tripId).get()
  if (tripRes.data.creatorId !== userId) {
    return { success: false, error: '只有创建者可以编辑行程' }
  }

  const updateData = { updatedAt: db.serverDate() }
  if (name !== undefined) updateData.name = name
  if (destination !== undefined) updateData.destination = destination
  if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null

  await db.collection('trips').doc(tripId).update({ data: updateData })
  return { success: true }
}

// 删除行程
async function deleteTrip(userId, event) {
  const { tripId } = event

  const tripRes = await db.collection('trips').doc(tripId).get()
  if (tripRes.data.creatorId !== userId) {
    return { success: false, error: '只有创建者可以删除行程' }
  }

  // 删除行程下的所有 Todo
  await db.collection('todos').where({ tripId }).remove()
  // 删除行程
  await db.collection('trips').doc(tripId).remove()

  return { success: true }
}

// 归档行程
async function archiveTrip(userId, event) {
  const { tripId } = event

  const tripRes = await db.collection('trips').doc(tripId).get()
  if (tripRes.data.creatorId !== userId) {
    return { success: false, error: '只有创建者可以归档行程' }
  }

  await db.collection('trips').doc(tripId).update({
    data: { status: 'archived', updatedAt: db.serverDate() }
  })

  return { success: true }
}

// 生成邀请码
function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
