const formatTime = date => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  const hour = `${d.getHours()}`.padStart(2, '0')
  const min = `${d.getMinutes()}`.padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${min}`
}

const formatRelativeTime = date => {
  const now = Date.now()
  const diff = now - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return formatTime(date)
}

const debounce = (fn, delay = 300) => {
  let timer
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

const throttle = (fn, interval = 300) => {
  let last = 0
  return function(...args) {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn.apply(this, args)
    }
  }
}

const addBrowseHistory = goods => {
  const key = 'browseHistory'
  const history = wx.getStorageSync(key) || []
  const filtered = history.filter(item => item.id !== goods._id)
  filtered.unshift({
    id: goods._id,
    title: goods.title,
    price: goods.price,
    image: goods.images?.[0] || ''
  })
  wx.setStorageSync(key, filtered.slice(0, 50))
}

const checkNetwork = () => {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          wx.showToast({ title: '网络异常，请检查网络连接', icon: 'none' })
          resolve(false)
        } else {
          resolve(true)
        }
      },
      fail: () => resolve(true)
    })
  })
}

const safeCall = (promise) => {
  return promise.catch((err) => {
    console.error('API Error:', err)
    wx.showToast({ title: '网络繁忙，请稍后重试', icon: 'none' })
    return null
  })
}

module.exports = {
  formatTime,
  formatRelativeTime,
  debounce,
  throttle,
  addBrowseHistory,
  checkNetwork,
  safeCall
}
