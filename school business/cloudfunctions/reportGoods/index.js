const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { goodsId, reason } = event

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    await db.collection('reports').add({
      data: {
        goodsId,
        userId: user.data[0]._id,
        reason: typeof reason === 'number' ? ['商品已卖出', '商品信息不符', '违规内容', '其他'][reason] : reason,
        createTime: db.serverDate()
      }
    })

    return { code: 0 }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
