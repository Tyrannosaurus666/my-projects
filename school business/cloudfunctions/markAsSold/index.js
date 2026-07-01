const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { goodsId } = event

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const goods = await db.collection('goods').doc(goodsId).get()
    if (goods.data.userId !== user.data[0]._id) {
      return { code: -1, message: '无权操作' }
    }

    await db.collection('goods').doc(goodsId).update({
      data: { status: 2, updateTime: db.serverDate() }
    })

    return { code: 0 }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
