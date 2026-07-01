const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { keyword, categoryId, priceMin, priceMax, campus, condition, sort = 'time' } = event
  let query = { status: 1 }

  if (categoryId) query.categoryId = categoryId
  if (campus) query.campus = campus
  if (condition) query.condition = parseInt(condition)
  if (priceMin !== undefined || priceMax !== undefined) {
    query.price = {}
    if (priceMin !== undefined) query.price.$gte = priceMin
    if (priceMax !== undefined) query.price.$lte = priceMax
  }
  if (keyword) {
    query.title = db.RegExp({ regexp: keyword, options: 'i' })
  }

  const orderField = sort === 'price_asc' ? 'price' : sort === 'price_desc' ? 'price' : 'createTime'
  const orderDir = sort === 'price_asc' ? 'asc' : 'desc'

  try {
    const res = await db.collection('goods')
      .where(query)
      .orderBy(orderField, orderDir)
      .limit(20)
      .get()
    return { code: 0, data: res.data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
