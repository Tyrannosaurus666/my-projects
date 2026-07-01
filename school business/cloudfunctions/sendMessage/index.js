const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { toId, goodsId, content, type = 1 } = event

  if (!content) return { code: -1, message: '消息内容不能为空' }

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const fromId = user.data[0]._id
    const conversationKey = [fromId, toId].sort().join('_') + (goodsId ? `_${goodsId}` : '')

    await db.collection('messages').add({
      data: {
        conversationKey,
        fromId,
        toId,
        goodsId: goodsId || '',
        content,
        type,
        isRead: false,
        createTime: db.serverDate()
      }
    })

    return { code: 0 }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
