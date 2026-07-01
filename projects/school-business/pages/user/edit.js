const app = getApp()

Page({
  data: {
    nickname: '',
    school: '',
    campus: '',
    phone: '',
    avatarUrl: '',
    saving: false
  },
  onLoad() {
    const user = app.globalData.userInfo
    if (user) {
      this.setData({
        nickname: user.nickname || '',
        school: user.school || '',
        campus: user.campus || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
      })
    }
  },
  onNicknameInput(e) { this.setData({ nickname: e.detail.value }) },
  onSchoolInput(e) { this.setData({ school: e.detail.value }) },
  onCampusInput(e) { this.setData({ campus: e.detail.value }) },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }) },
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
        this.setData({ avatarUrl: uploadRes.fileID })
        wx.hideLoading()
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '上传失败', icon: 'none' })
      })
    })
  },
  save() {
    if (!this.data.nickname) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    this.setData({ saving: true })
    wx.showLoading({ title: '保存中...' })
    wx.cloud.callFunction({
      name: 'updateUser',
      data: {
        nickname: this.data.nickname,
        school: this.data.school,
        campus: this.data.campus,
        phone: this.data.phone,
        avatarUrl: this.data.avatarUrl
      }
    }).then(res => {
      app.globalData.userInfo = res.result.data
      wx.setStorageSync('userCache', {
        openid: app.globalData.openid,
        userInfo: res.result.data
      })
      wx.hideLoading()
      wx.showToast({ title: '保存成功' })
      setTimeout(() => wx.navigateBack(), 1500)
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'none' })
      this.setData({ saving: false })
    })
  }
})
