import util from '../../utils/util.js';
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
  scanCode: function () {
    wx.scanCode({
      success: (res) => {
       
        wx.showLoading({
          title: '加载中',
        })
        var path = res.result;
        // 获取二维码链接中的参数
        let params = util.getParams(path)
        let shopId = params.shopId
        // var shopId = path.match(/\d+$/g)[0]
        wx.setStorageSync('shop', { id: shopId });
        util.setHistories({ id: shopId })
        setTimeout(function(){
          wx.reLaunch({
            url: '/pages/index/index'
          })
          wx.hideLoading()
        },1000)
      }
    })
  },
  // 跳转到对应商铺
  toShop: function (e) {
    var index = e.currentTarget.dataset.index;
    wx.setStorageSync('shop', this.data.histories[index]);
    wx.reLaunch({
      url: '/pages/index/index'
    })
  }
})