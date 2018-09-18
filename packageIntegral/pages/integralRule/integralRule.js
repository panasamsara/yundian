const app = getApp()
Page({
  data: {
    dataJson:{
      merchantId:"",
    },
    list: []
  },
  onLoad: function (options) {
    var merchantId = wx.getStorageSync('shop').merchantId;
    var dataMerchantId='dataJson.merchantId'
    this.setData({
      [dataMerchantId]: merchantId
    })
  },
  onReady: function () {
  
  },
  onShow: function () {
    this.getList();
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/selectCreditsrules', this.data.dataJson).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          list: res.data.data
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '',
        icon: 'none'
      })
    })
  },
})