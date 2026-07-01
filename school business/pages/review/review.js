Page({
  data: {
    goodsId: '',
    sellerId: '',
    rating: 5,
    content: '',
    submitting: false
  },
  onLoad(options) {
    this.setData({
      goodsId: options.goodsId || '',
      sellerId: options.sellerId || ''
    })
  },
  onRatingChange(e) {
    this.setData({ rating: e.currentTarget.dataset.value })
  },
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },
  submit() {
    this.setData({ submitting: true })
    wx.cloud.callFunction({
      name: 'submitReview',
      data: {
        goodsId: this.data.goodsId,
        toId: this.data.sellerId,
        rating: this.data.rating,
        content: this.data.content
      }
    }).then(() => {
      wx.showToast({ title: '评价成功' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(() => {
      wx.showToast({ title: '评价失败', icon: 'none' })
      this.setData({ submitting: false })
    })
  }
})
