const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const users = db.collection('users')

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  let user = await users.where({ openid: OPENID }).get()

  if (user.data.length === 0) {
    await users.add({
      data: {
        openid: OPENID,
        nickname: '用户',
        avatarUrl: '',
        school: '',
        campus: '',
        phone: '',
        creditScore: 100,
        createTime: db.serverDate()
      }
    })
    user = await users.where({ openid: OPENID }).get()
  }

  return {
    code: 0,
    openid: OPENID,
    userInfo: user.data[0]
  }
}
