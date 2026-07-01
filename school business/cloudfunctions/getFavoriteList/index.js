const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  const { OPENID } = cloud.getWXContext()

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const userId = user.data[0]._id
    const favs = await db.collection('favorites')
      .where({ userId })
      .orderBy('createTime', 'desc')
      .get()

    const goodsIds = favs.data.map(f => f.goodsId)
    const goods = goodsIds.length > 0
      ? await db.collection('goods')
          .where({ _id: db.command.in(goodsIds) })
          .get()
      : { data: [] }

    const list = goods.data.map(g => ({
      goodsId: g._id,
      title: g.title,
      price: g.price,
      image: g.images?.[0] || '',
      createTime: g.createTime
    }))

    return { code: 0, data: list }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
