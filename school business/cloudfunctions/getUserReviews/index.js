const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { userId } = event

  try {
    const res = await db.collection('reviews')
      .where({ toId: userId })
      .orderBy('createTime', 'desc')
      .get()

    const userIds = [...new Set(res.data.map(r => r.fromId))]
    const users = userIds.length > 0
      ? await db.collection('users')
          .where({ _id: db.command.in(userIds) })
          .get()
      : { data: [] }

    const userMap = {}
    users.data.forEach(u => { userMap[u._id] = u })

    const list = res.data.map(r => ({
      ...r,
      fromUser: {
        nickname: userMap[r.fromId]?.nickname || '用户',
        avatarUrl: userMap[r.fromId]?.avatarUrl || ''
      }
    }))

    return { code: 0, data: list }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
