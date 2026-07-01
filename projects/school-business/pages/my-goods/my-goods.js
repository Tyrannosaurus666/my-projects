Page({
  data: {
    goodsList: [],
    filteredList: [],
    loading: true,
    tab: 'all'
  },
  onShow() {
    this.loadMyGoods()
  },
  loadMyGoods() {
    wx.cloud.callFunction({
      name: 'getMyGoods'
    }).then(res => {
      const list = res.result.data || []
      this.setData({
        goodsList: list,
        filteredList: this.filterList(list, this.data.tab),
        loading: false
      })
    }).catch(() => {
      this.setData({ loading: false })
    })
  },
  filterList(list, tab) {
    if (tab === 'all') return list
    return list.filter(g => g.status === parseInt(tab))
  },
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      tab,
      filteredList: this.filterList(this.data.goodsList, tab)
    })
  },
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods/detail?id=${id}` })
  },
  markAsSold(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '标记已售',
      content: '确认该商品已交易成功？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'markAsSold',
            data: { goodsId: id }
          }).then(() => {
            wx.showToast({ title: '已标记为已售出' })
            this.loadMyGoods()
          }).catch(() => {
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  },
  updateStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const titles = { '1': '重新上架', '3': '下架商品' }
    const contents = {
      '1': '确认将该商品重新上架？',
      '3': '确认将该商品下架？下架后买家将无法看到'
    }
    wx.showModal({
      title: titles[status],
      content: contents[status],
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'updateGoodsStatus',
            data: { goodsId: id, status: parseInt(status) }
          }).then(() => {
            wx.showToast({ title: '操作成功' })
            this.loadMyGoods()
          }).catch(() => {
            wx.showToast({ title: '操作失败', icon: 'none' })
          })
        }
      }
    })
  }
})
