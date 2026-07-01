const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const userId = user.data[0]._id
    const msgs = await db.collection('messages')
      .where({ $or: [{ fromId: userId }, { toId: userId }] })
      .orderBy('createTime', 'desc')
      .limit(200)
      .get()

    const conversationMap = {}
    for (const msg of msgs.data) {
      const key = msg.conversationKey
      if (!conversationMap[key]) {
        const otherId = msg.fromId === userId ? msg.toId : msg.fromId
        conversationMap[key] = {
          _id: key,
          otherId,
          lastMessage: msg.content,
          lastTime: msg.createTime,
          unreadCount: msg.toId === userId && !msg.isRead ? 1 : 0
        }
      } else if (msg.toId === userId && !msg.isRead) {
        conversationMap[key].unreadCount++
      }
    }

    const list = Object.values(conversationMap)
    const userIds = list.map(c => c.otherId)
    const users = userIds.length > 0
      ? await db.collection('users')
          .where({ _id: db.command.in(userIds) })
          .get()
      : { data: [] }

    const userMap = {}
    users.data.forEach(u => { userMap[u._id] = u })

    const conversations = list.map(c => ({
      ...c,
      nickname: userMap[c.otherId]?.nickname || '用户',
      avatar: userMap[c.otherId]?.avatarUrl || ''
    }))

    conversations.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))

    return { code: 0, data: conversations }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
