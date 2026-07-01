const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { goodsId } = event

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const userId = user.data[0]._id
    const existing = await db.collection('favorites')
      .where({ userId, goodsId })
      .get()

    if (existing.data.length > 0) {
      await db.collection('favorites').doc(existing.data[0]._id).remove()
      await db.collection('goods').doc(goodsId).update({
        data: { likeCount: cloud.database().command.inc(-1) }
      })
      return { code: 0, data: { favorited: false } }
    } else {
      await db.collection('favorites').add({
        data: { userId, goodsId, createTime: db.serverDate() }
      })
      await db.collection('goods').doc(goodsId).update({
        data: { likeCount: cloud.database().command.inc(1) }
      })
      return { code: 0, data: { favorited: true } }
    }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
