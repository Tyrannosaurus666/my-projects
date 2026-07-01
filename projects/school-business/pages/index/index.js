Page({
  data: {
    banners: [
      { id: 1, imageUrl: '', text: '校园二手 · 绿色交易' },
      { id: 2, imageUrl: '', text: '闲置变现 · 轻松一卖' },
      { id: 3, imageUrl: '', text: '毕业季 · 批量处理' }
    ],
    categories: [],
    goodsList: [],
    loading: true,
    page: 1,
    hasMore: true
  },
  onLoad() {
    this.loadCategories()
    this.loadGoods()
  },
  onPullDownRefresh() {
    this.setData({ page: 1, goodsList: [], hasMore: true })
    this.loadCategories()
    this.loadGoods(() => wx.stopPullDownRefresh())
  },
  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadGoods()
    }
  },
  loadCategories() {
    wx.cloud.callFunction({
      name: 'getCategories'
    }).then(res => {
      this.setData({ categories: (res.result.data || []).slice(0, 8) })
    }).catch(() => {})
  },
  loadGoods(callback) {
    const { page } = this.data
    wx.cloud.callFunction({
      name: 'getGoodsList',
      data: { page, pageSize: 10, status: 1 }
    }).then(res => {
      const list = res.result.data || []
      this.setData({
        goodsList: page === 1 ? list : [...this.data.goodsList, ...list],
        hasMore: list.length === 10,
        loading: false
      })
      if (callback) callback()
    }).catch(() => {
      this.setData({ loading: false })
      if (callback) callback()
    })
  },
  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },
  goCategory(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/search/search?categoryId=${id}&categoryName=${name}`
    })
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` })
  }
})
