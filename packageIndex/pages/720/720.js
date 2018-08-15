// pages/720/720.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataSrc: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');
    this.setData({
      dataSrc: shop.shopHomeConfig.fullView720Path
    })
    // 设置当前页面标题
    wx.setNavigationBarTitle({
      title: shop.shopName,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

})