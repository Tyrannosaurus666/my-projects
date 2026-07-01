const app = getApp()

Page({
  data: {
    userInfo: null,
    isLogin: false
  },
  onShow() {
    const userInfo = app.globalData.userInfo
    this.setData({
      userInfo,
      isLogin: !!userInfo
    })
  },
  login() {
    wx.showLoading({ title: '登录中...' })
    app.login().then(userInfo => {
      wx.hideLoading()
      this.setData({ userInfo, isLogin: true })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '登录失败，请重试', icon: 'none' })
    })
  },
  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      wx.showLoading({ title: '上传中...' })
      const ext = res.tempFilePaths[0].match(/\.\w+$/)?.[0] || '.jpg'
      wx.cloud.uploadFile({
        cloudPath: `avatars/${Date.now()}${ext}`,
        filePath: res.tempFilePaths[0]
      }).then(uploadRes => {
        wx.cloud.callFunction({
          name: 'updateUser',
          data: { avatarUrl: uploadRes.fileID }
        }).then(() => {
          app.globalData.userInfo = { ...app.globalData.userInfo, avatarUrl: uploadRes.fileID }
          this.setData({ userInfo: app.globalData.userInfo })
          wx.hideLoading()
        })
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
      })
    })
  },
  goPage(e) {
    const { page } = e.currentTarget.dataset
    wx.navigateTo({ url: page })
  },
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.globalData.openid = null
          app.globalData.userInfo = null
          wx.removeStorageSync('userCache')
          this.setData({ userInfo: null, isLogin: false })
        }
      }
    })
  }
})
