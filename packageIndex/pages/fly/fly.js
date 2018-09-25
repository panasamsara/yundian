// packageIndex/pages/fly/fly.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    path: ''
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
    let userId = wx.getStorageSync('scSysUser').id;
    let isAdmin = wx.getStorageSync('scSysUser').isadmin;
    let merchantId = wx.getStorageSync('shop').merchantId;

    let path = isAdmin ? `userId=${userId}&merchantId=${merchantId}` : `userId=${userId}`;
    let url = app.util.SHARE_URL + '/commonpage/homepage/feiyuetixi.html?';

    this.setData({
      path: url + path
    })
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