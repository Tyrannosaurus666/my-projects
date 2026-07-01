App({
  onLaunch() {
    wx.cloud.init({
      env: 'cloudbase',
      traceUser: true
    })
    this.globalData.systemInfo = {
      windowWidth: wx.getWindowInfo().windowWidth,
      windowHeight: wx.getWindowInfo().windowHeight,
      pixelRatio: wx.getDeviceInfo().pixelRatio,
      platform: wx.getDeviceInfo().platform,
      language: wx.getAppBaseInfo().language,
      SDKVersion: wx.getAppBaseInfo().SDKVersion
    }
    const cache = wx.getStorageSync('userCache')
    if (cache) {
      this.globalData.openid = cache.openid
      this.globalData.userInfo = cache.userInfo
    }
  },
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          wx.cloud.callFunction({
            name: 'login',
            data: { code: res.code }
          }).then(resp => {
            const { openid, userInfo } = resp.result
            this.globalData.openid = openid
            this.globalData.userInfo = userInfo
            wx.setStorageSync('userCache', { openid, userInfo })
            resolve(userInfo)
          }).catch(reject)
        },
        fail: reject
      })
    })
  },
  globalData: {
    systemInfo: null,
    openid: null,
    userInfo: null
  }
})
