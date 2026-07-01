Page({
  data: {
    keyword: '',
    categoryId: '',
    categoryName: '全部分类',
    priceMin: '',
    priceMax: '',
    campus: '',
    condition: '',
    sort: 'time',
    results: [],
    loading: false,
    showFilter: false,
    histories: [],
    categories: [],
    conditions: ['', '全新', '几乎全新', '良好', '一般']
  },
  onLoad(options) {
    this.setData({
      histories: wx.getStorageSync('searchHistory') || []
    })
    this.loadCategories()
    if (options.categoryId) {
      this.setData({
        categoryId: options.categoryId,
        categoryName: options.categoryName || '全部分类'
      })
      this.search()
    }
  },
  loadCategories() {
    wx.cloud.callFunction({
      name: 'getCategories'
    }).then(res => {
      this.setData({ categories: res.result.data || [] })
    }).catch(() => {})
  },
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value })
  },
  onSearch() {
    const keyword = this.data.keyword
    if (!keyword && !this.data.categoryId) {
      wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    if (keyword) this.saveHistory(keyword)
    this.search()
  },
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword })
    this.search()
  },
  clearHistories() {
    wx.removeStorageSync('searchHistory')
    this.setData({ histories: [] })
  },
  saveHistory(keyword) {
    if (!keyword.trim()) return
    let histories = wx.getStorageSync('searchHistory') || []
    histories = histories.filter(h => h !== keyword)
    histories.unshift(keyword)
    if (histories.length > 10) histories = histories.slice(0, 10)
    wx.setStorageSync('searchHistory', histories)
    this.setData({ histories })
  },
  search() {
    this.setData({ loading: true, showFilter: false })
    wx.cloud.callFunction({
      name: 'searchGoods',
      data: {
        keyword: this.data.keyword,
        categoryId: this.data.categoryId,
        priceMin: this.data.priceMin ? parseFloat(this.data.priceMin) : undefined,
        priceMax: this.data.priceMax ? parseFloat(this.data.priceMax) : undefined,
        campus: this.data.campus || undefined,
        condition: this.data.condition ? parseInt(this.data.condition) : undefined,
        sort: this.data.sort
      }
    }).then(res => {
      this.setData({
        results: res.result.data || [],
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },
  onCategorySelect(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({ categoryId: id, categoryName: name })
    this.search()
  },
  onSortChange(e) {
    const sort = e.currentTarget.dataset.sort
    this.setData({ sort })
    this.search()
  },
  resetFilter() {
    this.setData({
      categoryId: '', categoryName: '全部分类',
      priceMin: '', priceMax: '',
      campus: '', condition: ''
    })
  },
  onPriceMinInput(e) { this.setData({ priceMin: e.detail.value }) },
  onPriceMaxInput(e) { this.setData({ priceMax: e.detail.value }) },
  onCampusInput(e) { this.setData({ campus: e.detail.value }) },
  onConditionChange(e) { this.setData({ condition: e.detail.value }) },
  applyFilter() {
    this.search()
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` })
  },
  clearSearch() {
    this.setData({
      keyword: '', categoryId: '', categoryName: '全部分类',
      priceMin: '', priceMax: '', campus: '', condition: '',
      results: [], showFilter: false
    })
  }
})
