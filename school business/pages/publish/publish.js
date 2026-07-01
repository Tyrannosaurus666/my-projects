const app = getApp()

Page({
  data: {
    images: [],
    title: '',
    description: '',
    price: '',
    originalPrice: '',
    categoryIndex: 0,
    categories: [],
    conditionIndex: 0,
    conditions: ['全新', '几乎全新', '良好', '一般'],
    campus: '',
    submitting: false
  },
  onLoad() {
    this.loadCategories()
  },
  onShow() {
    if (!app.globalData.userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再发布商品',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/user/user' })
          }
        }
      })
    }
  },
  loadCategories() {
    wx.cloud.callFunction({
      name: 'getCategories'
    }).then(res => {
      this.setData({ categories: res.result.data || [] })
    }).catch(() => {})
  },
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      this.setData({ images: [...this.data.images, ...res.tempFilePaths] })
    })
  },
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ images: this.data.images.filter((_, i) => i !== index) })
  },
  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  onPriceInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 2) return
    this.setData({ price: val })
  },
  onOriginalPriceInput(e) {
    let val = e.detail.value
    if (val.includes('.') && val.split('.')[1].length > 2) return
    this.setData({ originalPrice: val })
  },
  onCampusInput(e) { this.setData({ campus: e.detail.value }) },
  onCategoryChange(e) { this.setData({ categoryIndex: e.detail.value }) },
  onConditionChange(e) { this.setData({ conditionIndex: e.detail.value }) },
  validate() {
    const { title, price, description, images } = this.data
    if (!title.trim()) return '请输入商品标题'
    if (title.length > 50) return '标题不能超过50个字'
    if (!description.trim()) return '请输入商品描述'
    if (description.length > 1000) return '描述不能超过1000个字'
    if (!price || isNaN(price) || parseFloat(price) <= 0) return '请输入有效的价格'
    if (parseFloat(price) > 99999) return '价格不能超过99999'
    if (this.data.originalPrice && (isNaN(this.data.originalPrice) || parseFloat(this.data.originalPrice) <= 0)) {
      return '请输入有效的原价'
    }
    if (images.length === 0) return '请至少上传一张商品图片'
    return ''
  },
  submit() {
    if (!app.globalData.userInfo) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    const error = this.validate()
    if (error) {
      wx.showToast({ title: error, icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })
    const uploadTasks = this.data.images.map((path, i) => {
      const ext = path.match(/\.\w+$/)?.[0] || '.jpg'
      return wx.cloud.uploadFile({
        cloudPath: `goods/${Date.now()}_${i}${ext}`,
        filePath: path
      }).then(res => res.fileID)
    })
    Promise.all(uploadTasks).then(fileIDs => {
      const category = this.data.categories[this.data.categoryIndex]
      return wx.cloud.callFunction({
        name: 'createGoods',
        data: {
          title: this.data.title.trim(),
          description: this.data.description.trim(),
          price: parseFloat(this.data.price),
          originalPrice: parseFloat(this.data.originalPrice) || 0,
          categoryId: category ? category._id : '',
          condition: this.data.conditionIndex + 1,
          campus: this.data.campus,
          images: fileIDs
        }
      })
    }).then(res => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功', icon: 'success' })
      this.setData({
        images: [], title: '', description: '', price: '',
        originalPrice: '', categoryIndex: 0, conditionIndex: 0, campus: ''
      })
      setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1000)
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({ title: '发布失败，请重试', icon: 'none' })
      this.setData({ submitting: false })
    })
  }
})
