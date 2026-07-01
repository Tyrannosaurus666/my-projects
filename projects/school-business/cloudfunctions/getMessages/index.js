const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { conversationId, goodsId, sellerId } = event

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const userId = user.data[0]._id

    if (sellerId) {
      const sorted = [userId, sellerId].sort()
      const key = `${sorted[0]}_${sorted[1]}${goodsId ? `_${goodsId}` : ''}`
      const res = await db.collection('messages')
        .where({ conversationKey: key })
        .orderBy('createTime', 'asc')
        .limit(100)
        .get()
      return { code: 0, data: res.data }
    }

    let query = {}
    if (conversationId) {
      query.conversationKey = conversationId
    } else {
      query.$or = [{ fromId: userId }, { toId: userId }]
      if (goodsId) query.goodsId = goodsId
    }

    const res = await db.collection('messages')
      .where(query)
      .orderBy('createTime', 'asc')
      .limit(100)
      .get()

    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
