const call = (name, data = {}) => {
  return wx.cloud.callFunction({ name, data }).then(res => res.result)
}

module.exports = {
  // 用户
  login: code => call('login', { code }),
  updateUser: data => call('updateUser', data),

  // 商品
  getGoodsList: params => call('getGoodsList', params),
  getGoodsDetail: goodsId => call('getGoodsDetail', { goodsId }),
  createGoods: data => call('createGoods', data),
  getMyGoods: () => call('getMyGoods'),
  searchGoods: params => call('searchGoods', params),
  markAsSold: goodsId => call('markAsSold', { goodsId }),

  // 分类
  getCategories: () => call('getCategories'),

  // 收藏
  toggleFavorite: goodsId => call('toggleFavorite', { goodsId }),
  getFavoriteList: () => call('getFavoriteList'),

  // 聊天
  sendMessage: data => call('sendMessage', data),
  getMessages: data => call('getMessages', data),
  getConversationList: () => call('getConversationList'),

  // 评价
  submitReview: data => call('submitReview', data),

  // 状态管理
  updateGoodsStatus: data => call('updateGoodsStatus', data),

  // 举报
  reportGoods: data => call('reportGoods', data)
}
