var app = getApp()
// pages/reg/reg.js
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
  
  },
  getPhoneNumber: function (e) {
    wx.showLoading({ title: '登陆中，请稍候……', mask: true })
    // 根据手机号 登陆绑定/注册 智享城市app账户
    app.util.reqAsync('payBoot/wx/miniapp/phone', {
      loginToken: wx.getStorageSync('loginToken'),
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv
    })
    .then(res => {
      wx.hideLoading()
      if(res.code == 1) {
        wx.setStorageSync('scSysUser', res.data);
        wx.navigateBack()
      }
      wx.showToast({ title: res.msg, icon: 'none' })
    })
    .catch((err) => {
      wx.hideLoading()
      wx.showToast({ title: '登陆失败，请稍后再试……', icon: 'none' })
    })
  } 
})