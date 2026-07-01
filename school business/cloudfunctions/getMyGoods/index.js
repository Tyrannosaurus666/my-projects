const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const res = await db.collection('goods')
      .where({ userId: user.data[0]._id })
      .orderBy('createTime', 'desc')
      .get()

    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
