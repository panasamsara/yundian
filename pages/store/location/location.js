// pages/store/location/location.js
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
    let latitude = wx.getStorageSync('shop').latitude,
        longitude = wx.getStorageSync('shop').longitude,
        shopName = wx.getStorageSync('shop').shopName,
        address = wx.getStorageSync('shop').address
    this.setData({
      latitude: latitude,
      longitude: longitude,
      markers: [{
        latitude: latitude,
        longitude: longitude,
        iconPath: 'images/location.png',
        label:{
          content: shopName+"&#10"+address,
          borderRadius: 10,
          bgColor:'#ffffff',
          padding: 6,
          textAlign: 'left'
        }
      }]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})