const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { title, description, price, originalPrice, categoryId, condition, campus, images } = event

  if (!title || !price || !description) {
    return { code: -1, message: '必填项不能为空' }
  }

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const res = await db.collection('goods').add({
      data: {
        userId: user.data[0]._id,
        title,
        description,
        price,
        originalPrice: originalPrice || 0,
        categoryId: categoryId || '',
        condition: condition || 1,
        campus: campus || '',
        images: images || [],
        status: 1,
        viewCount: 0,
        likeCount: 0,
        createTime: db.serverDate(),
        updateTime: db.serverDate()
      }
    })

    return { code: 0, data: { id: res._id } }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
