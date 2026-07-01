const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async () => {
  try {
    const res = await db.collection('categories')
      .orderBy('sort', 'asc')
      .get()
    return { code: 0, data: res.data }
  } catch (err) {
    const defaultCategories = [
      { name: '教材书籍', icon: '', sort: 1 },
      { name: '电子产品', icon: '', sort: 2 },
      { name: '生活用品', icon: '', sort: 3 },
      { name: '服饰鞋包', icon: '', sort: 4 },
      { name: '运动户外', icon: '', sort: 5 },
      { name: '美妆护肤', icon: '', sort: 6 },
      { name: '文具办公', icon: '', sort: 7 },
      { name: '其他', icon: '', sort: 8 }
    ]
    return { code: 0, data: defaultCategories }
  }
}
