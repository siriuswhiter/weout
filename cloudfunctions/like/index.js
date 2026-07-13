// 云函数入口: like
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
      case 'like':
        return await likeTemplate(userId, event)
      case 'unlike':
        return await unlikeTemplate(userId, event)
      case 'check':
        return await checkLiked(userId, event)
      default:
        return { success: false, error: '未知操作' }
    }
  } catch (err) {
    console.error(`[like] ${action} 失败:`, err)
    return { success: false, error: err.message }
  }
}

async function likeTemplate(userId, event) {
  const { templateId } = event
  const existRes = await db.collection('likes').where({ templateId, userId }).get()
  if (existRes.data.length > 0) {
    return { success: true, message: '已点赞' }
  }

  await db.collection('likes').add({
    data: { templateId, userId, createdAt: db.serverDate() }
  })
  await db.collection('templates').doc(templateId).update({
    data: { likeCount: _.inc(1) }
  })
  return { success: true }
}

async function unlikeTemplate(userId, event) {
  const { templateId } = event
  const likeRes = await db.collection('likes').where({ templateId, userId }).get()
  if (likeRes.data.length === 0) {
    return { success: true }
  }

  await db.collection('likes').doc(likeRes.data[0]._id).remove()
  await db.collection('templates').doc(templateId).update({
    data: { likeCount: _.inc(-1) }
  })
  return { success: true }
}

async function checkLiked(userId, event) {
  const { templateId } = event
  const likeRes = await db.collection('likes').where({ templateId, userId }).get()
  return { success: true, isLiked: likeRes.data.length > 0 }
}
