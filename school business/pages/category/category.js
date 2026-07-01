Page({
  data: {
    categories: [],
    loading: true
  },
  onLoad() {
    this.loadCategories()
  },
  loadCategories() {
    wx.cloud.callFunction({
      name: 'getCategories'
    }).then(res => {
      this.setData({
        categories: res.result.data || [],
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },
  goCategory(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/search/search?categoryId=${id}&categoryName=${name}`
    })
  }
})
