const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { goodsId, toId, rating, content } = event

  if (!rating || rating < 1 || rating > 5) {
    return { code: -1, message: '评分必须在1-5之间' }
  }

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const fromId = user.data[0]._id

    await db.collection('reviews').add({
      data: {
        goodsId,
        fromId,
        toId,
        rating,
        content: content || '',
        createTime: db.serverDate()
      }
    })

    const reviews = await db.collection('reviews')
      .where({ toId })
      .get()

    const avg = reviews.data.reduce((sum, r) => sum + r.rating, 0) / reviews.data.length
    const creditScore = Math.round(avg * 20)

    await db.collection('users').doc(toId).update({
      data: { creditScore }
    })

    return { code: 0, data: { creditScore } }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
