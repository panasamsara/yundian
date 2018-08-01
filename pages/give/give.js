// pages/give/give.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imageList: wx.getStorageSync('imageList'),
      data:options
    })
  }
})