Page({
  data: {
    history: [],
    loading: true
  },
  onShow() {
    this.loadHistory()
  },
  loadHistory() {
    const history = wx.getStorageSync('browseHistory') || []
    this.setData({ history, loading: false })
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` })
  },
  clearHistory() {
    wx.removeStorageSync('browseHistory')
    this.setData({ history: [] })
  }
})
