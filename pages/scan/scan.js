import util from '../../utils/util.js';

// pages/scan/scan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    histories: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 若已有shopId，则跳转到首页
    var shop = wx.getStorageSync('shop');
    if(shop && shop.id) {
      wx.redirectTo({ 
        url: '/pages/index/index'
      })
      return;
    }
    // 否则检查并列出历史纪录
    var histories = wx.getStorageSync('histories');
    this.setData({
      histories: histories
    })
    if (!histories || histories.length == 0) return;
    // 获取上一次的本地shopId
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
  // ------------- 以下为自定义方法 --------------

  /**
   * 扫码，根据shopId跳转
   */
  scanCode: function () {
    wx.scanCode({
      success: (res) => {
        var path = res.result;
        var shopId = path.match(/\d+$/g)[0]
        wx.setStorageSync('shop', { id: shopId });
        util.setHistories({ id: shopId })
        wx.navigateBack()
      }
    })
  },
  // 跳转到对应商铺
  toShop: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.setStorageSync('shop', this.data.histories[index]);
    wx.navigateBack()
  }
})