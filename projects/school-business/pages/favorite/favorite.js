Page({
  data: {
    favorites: [],
    loading: true
  },
  onShow() {
    this.loadFavorites()
  },
  loadFavorites() {
    wx.cloud.callFunction({
      name: 'getFavoriteList'
    }).then(res => {
      this.setData({
        favorites: res.result.data || [],
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` })
  }
})
