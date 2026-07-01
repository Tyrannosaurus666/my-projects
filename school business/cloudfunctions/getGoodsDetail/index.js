const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { goodsId } = event

  try {
    const goodsRes = await db.collection('goods').doc(goodsId).get()
    const goods = goodsRes.data

    const sellerRes = await db.collection('users').doc(goods.userId).get()
    const seller = sellerRes.data

    await db.collection('goods').doc(goodsId).update({
      data: { viewCount: cloud.database().command.inc(1) }
    })

    return {
      code: 0,
      goods,
      seller: {
        _id: seller._id,
        nickname: seller.nickname,
        avatarUrl: seller.avatarUrl,
        creditScore: seller.creditScore,
        school: seller.school
      }
    }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
