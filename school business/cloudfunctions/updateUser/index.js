const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { nickname, avatarUrl, school, campus, phone } = event

  try {
    const user = await db.collection('users').where({ openid: OPENID }).get()
    if (user.data.length === 0) return { code: -1, message: '用户未登录' }

    const updateData = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (school !== undefined) updateData.school = school
    if (campus !== undefined) updateData.campus = campus
    if (phone !== undefined) updateData.phone = phone

    await db.collection('users').doc(user.data[0]._id).update({
      data: updateData
    })

    const updated = await db.collection('users').doc(user.data[0]._id).get()

    return { code: 0, data: updated.data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
