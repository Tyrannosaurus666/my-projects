const app = getApp()
const { addBrowseHistory } = require('../../utils/util')

Page({
  data: {
    goods: null,
    seller: null,
    loading: true,
    isFavorite: false,
    isMyGoods: false
  },
  onLoad(options) {
    if (options.id) {
      this.loadDetail(options.id)
      this.checkFavorite(options.id)
    }
  },
  loadDetail(id) {
    wx.cloud.callFunction({
      name: 'getGoodsDetail',
      data: { goodsId: id }
    }).then(res => {
      const goods = res.result.goods
      const seller = res.result.seller
      const myId = app.globalData.userInfo?._id
      this.setData({
        goods, seller, loading: false,
        isMyGoods: myId === goods.userId
      })
      addBrowseHistory(goods)
    }).catch(() => {
      this.setData({ loading: false })
    })
  },
  checkFavorite(goodsId) {
    if (!app.globalData.userInfo) return
    wx.cloud.callFunction({
      name: 'getFavoriteList'
    }).then(res => {
      const ids = (res.result.data || []).map(f => f.goodsId)
      this.setData({ isFavorite: ids.includes(goodsId) })
    }).catch(() => {})
  },
  toggleFavorite() {
    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.cloud.callFunction({
      name: 'toggleFavorite',
      data: { goodsId: this.data.goods._id }
    }).then(() => {
      this.setData({ isFavorite: !this.data.isFavorite })
      wx.showToast({
        title: this.data.isFavorite ? '已收藏' : '已取消',
        icon: 'success'
      })
    })
  },
  contactSeller() {
    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    const { goods } = this.data
    wx.navigateTo({
      url: `/pages/chat/detail?goodsId=${goods._id}&sellerId=${goods.userId}`
    })
  },
  markAsSold() {
    wx.showModal({
      title: '标记已售',
      content: '确认该商品已交易成功？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'markAsSold',
            data: { goodsId: this.data.goods._id }
          }).then(() => {
            wx.showToast({ title: '已标记售出' })
            this.setData({ 'goods.status': 2 })
          })
        }
      }
    })
  },
  updateStatus(e) {
    const status = parseInt(e.currentTarget.dataset.status)
    const titles = { 3: '下架商品', 1: '重新上架' }
    const contents = {
      3: '下架后买家将无法看到该商品',
      1: '确认重新上架该商品？'
    }
    wx.showModal({
      title: titles[status],
      content: contents[status],
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'updateGoodsStatus',
            data: { goodsId: this.data.goods._id, status }
          }).then(() => {
            wx.showToast({ title: '操作成功' })
            this.setData({ 'goods.status': status })
          })
        }
      }
    })
  },
  onShareAppMessage() {
    const { goods } = this.data
    return {
      title: goods?.title || '校园二手好物推荐',
      path: `/pages/goods/detail?id=${goods?._id}`,
      imageUrl: goods?.images?.[0] || ''
    }
  },
  onShareTimeline() {
    const { goods } = this.data
    return {
      title: goods?.title || '校园二手好物推荐',
      query: `id=${goods?._id}`,
      imageUrl: goods?.images?.[0] || ''
    }
  },
  goReview() {
    wx.navigateTo({
      url: `/pages/review/review?goodsId=${this.data.goods._id}&sellerId=${this.data.goods.userId}`
    })
  },
  reportGoods() {
    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    wx.showActionSheet({
      itemList: ['商品已卖出', '商品信息不符', '违规内容', '其他'],
      success: (res) => {
        wx.cloud.callFunction({
          name: 'reportGoods',
          data: {
            goodsId: this.data.goods._id,
            reason: res.tapIndex
          }
        }).then(() => {
          wx.showToast({ title: '举报已提交', icon: 'success' })
        }).catch(() => {
          wx.showToast({ title: '提交失败', icon: 'none' })
        })
      }
    })
  }
})
