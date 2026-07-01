const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event) => {
  const { page = 1, pageSize = 10, status = 1, categoryId, campus, sort } = event
  const skip = (page - 1) * pageSize
  let query = { status }

  if (categoryId) query.categoryId = categoryId
  if (campus) query.campus = campus

  let orderField = 'createTime'
  let orderDir = 'desc'
  if (sort === 'price_asc') { orderField = 'price'; orderDir = 'asc' }
  if (sort === 'price_desc') { orderField = 'price'; orderDir = 'desc' }

  try {
    const result = await db.collection('goods')
      .where(query)
      .orderBy(orderField, orderDir)
      .skip(skip)
      .limit(pageSize)
      .get()

    return { code: 0, data: result.data }
  } catch (err) {
    return { code: -1, message: err.message }
  }
}
