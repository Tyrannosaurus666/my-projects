const app = getApp()

Page({
  data: {
    messages: [],
    inputValue: '',
    goodsId: null,
    sellerId: null,
    conversationKey: null,
    myId: null,
    goodsInfo: null,
    scrollTop: ''
  },
  onLoad(options) {
    const myInfo = app.globalData.userInfo
    this.setData({
      goodsId: options.goodsId || null,
      sellerId: options.sellerId || null,
      myId: myInfo?._id || null
    })
    this.loadGoodsInfo()
    this.loadMessages()
    this.startPolling()
  },
  onUnload() {
    this.stopPolling()
  },
  startPolling() {
    this._timer = setInterval(() => {
      this.loadMessages(true)
    }, 5000)
  },
  stopPolling() {
    if (this._timer) {
      clearInterval(this._timer)
      this._timer = null
    }
  },
  loadGoodsInfo() {
    if (!this.data.goodsId) return
    wx.cloud.callFunction({
      name: 'getGoodsDetail',
      data: { goodsId: this.data.goodsId }
    }).then(res => {
      this.setData({ goodsInfo: res.result.goods })
    }).catch(() => {})
  },
  loadMessages(silent) {
    wx.cloud.callFunction({
      name: 'getMessages',
      data: {
        goodsId: this.data.goodsId,
        sellerId: this.data.sellerId
      }
    }).then(res => {
      const msgs = res.result.data || []
      if (msgs.length !== this.data.messages.length) {
        this.setData({ messages: msgs })
        this.scrollToBottom()
      }
    }).catch(() => {})
  },
  scrollToBottom() {
    const msgs = this.data.messages
    if (msgs.length > 0) {
      this.setData({ scrollTop: `msg-${msgs[msgs.length - 1]._id || msgs.length}` })
    }
  },
  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  sendMessage() {
    const content = this.data.inputValue.trim()
    if (!content) return
    wx.cloud.callFunction({
      name: 'sendMessage',
      data: {
        toId: this.data.sellerId,
        goodsId: this.data.goodsId || '',
        content,
        type: 1
      }
    }).then(() => {
      this.setData({ inputValue: '' })
      this.loadMessages()
    })
  },
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      wx.showLoading({ title: '发送中...' })
      const ext = res.tempFilePaths[0].match(/\.\w+$/)?.[0] || '.jpg'
      wx.cloud.uploadFile({
        cloudPath: `chat/${Date.now()}${ext}`,
        filePath: res.tempFilePaths[0]
      }).then(uploadRes => {
        return wx.cloud.callFunction({
          name: 'sendMessage',
          data: {
            toId: this.data.sellerId,
            goodsId: this.data.goodsId || '',
            content: uploadRes.fileID,
            type: 2
          }
        })
      }).then(() => {
        wx.hideLoading()
        this.loadMessages()
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '发送失败', icon: 'none' })
      })
    })
  }
})
