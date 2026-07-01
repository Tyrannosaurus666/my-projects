const { formatRelativeTime } = require('../../utils/util')

Page({
  data: {
    conversations: [],
    loading: true
  },
  onShow() {
    this.loadConversations()
    this.startPolling()
  },
  onHide() {
    this.stopPolling()
  },
  onUnload() {
    this.stopPolling()
  },
  startPolling() {
    this._timer = setInterval(() => {
      this.loadConversations(true)
    }, 5000)
  },
  stopPolling() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },
  loadConversations(silent) {
    if (!silent) this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getConversationList'
    }).then(res => {
      const list = (res.result.data || []).map(c => ({
        ...c,
        lastTimeStr: formatRelativeTime(c.lastTime)
      }))
      const unreadTotal = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
      this.setData({
        conversations: list,
        loading: false
      })
      if (unreadTotal > 0) {
        wx.setTabBarBadge({ index: 3, text: `${unreadTotal}` })
      } else {
        wx.removeTabBarBadge({ index: 3 })
      }
    }).catch(() => {
      this.setData({ loading: false })
    })
  },
  goChat(e) {
    const { id, otherid } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/chat/detail?sellerId=${otherid}&conversationId=${id}` })
  }
})
