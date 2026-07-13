// 云函数入口: invite
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
      case 'generateCode':
        return await generateCode(userId, event)
      case 'joinByCode':
        return await joinByCode(userId, event)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error(`[invite] ${action} 失败:`, err)
    return { success: false, error: err.message }
  }
}

// 获取邀请码（行程创建时已生成）
async function generateCode(userId, event) {
  const { tripId } = event
  const tripRes = await db.collection('trips').doc(tripId).get()
  const trip = tripRes.data

  if (!trip.memberIds.includes(userId)) {
    return { success: false, error: '你不是该行程的成员' }
  }

  return {
    success: true,
    inviteCode: trip.inviteCode,
    tripName: trip.name
  }
}

// 通过邀请码加入行程
async function joinByCode(userId, event) {
  const { code } = event

  if (!code || code.length !== 6) {
    return { success: false, error: '邀请码格式不正确' }
  }

  const tripRes = await db.collection('trips').where({
    inviteCode: code.toUpperCase(),
    status: 'active'
  }).get()

  if (tripRes.data.length === 0) {
    return { success: false, error: '邀请码无效或行程已结束' }
  }

  const trip = tripRes.data[0]

  // 检查是否已是成员
  if (trip.memberIds.includes(userId)) {
    return { success: false, error: '你已经在该行程中' }
  }

  // 添加成员
  await db.collection('trips').doc(trip._id).update({
    data: {
      memberIds: _.push(userId),
      updatedAt: db.serverDate()
    }
  })

  return {
    success: true,
    tripId: trip._id,
    tripName: trip.name
  }
}
