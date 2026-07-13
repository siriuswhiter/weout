// 云函数入口: login
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { nickName, avatarUrl } = event

  try {
    // 查找用户是否已存在
    const userRes = await db.collection('users').where({ openId }).get()

    if (userRes.data.length > 0) {
      // 用户已存在，更新信息
      const user = userRes.data[0]
      if (nickName || avatarUrl) {
        const updateData = {}
        if (nickName) updateData.nickName = nickName
        if (avatarUrl) updateData.avatarUrl = avatarUrl
        await db.collection('users').doc(user._id).update({ data: updateData })
      }
      return {
        success: true,
        userId: user._id,
        userInfo: {
          ...user,
          nickName: nickName || user.nickName,
          avatarUrl: avatarUrl || user.avatarUrl
        }
      }
    } else {
      // 新用户，创建记录
      const newUser = {
        openId,
        nickName: nickName || '旅行者',
        avatarUrl: avatarUrl || '',
        createdAt: db.serverDate()
      }
      const addRes = await db.collection('users').add({ data: newUser })
      return {
        success: true,
        userId: addRes._id,
        userInfo: { _id: addRes._id, ...newUser }
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return { success: false, error: err.message }
  }
}
