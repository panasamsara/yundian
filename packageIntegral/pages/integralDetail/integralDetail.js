var app = getApp();
Page({
  data: {
    dataJson: {
      "pageNo": 1,
      "shopId": "",
      "userId": "",
      "pageSize": 10,
      "merchantId": ""
    },
    userInfo:"",
    dataList:{
      "userId": "",
      "merchantId": ""
    },
    list:[]
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;
    var merchantId = wx.getStorageSync('shop').merchantId;
    var dataListuserId = 'dataList.userId';
    var dataListmerchantId = 'dataList.merchantId';
    var dataJsonshopId = 'dataJson.shopId';
    var dataJsonmerchantId = 'dataJson.merchantId';
    var dataJsonuserId = 'dataJson.userId';

    this.setData({
      [dataListuserId]: userId,
      [dataListmerchantId]: merchantId,
      [dataJsonshopId]: shopId,
      [dataJsonmerchantId]: merchantId,
      [dataJsonuserId]: userId,
      [userId]: userId
    })

  },
  onShow:function(){
    this.getNav();
    this.getDetail();
  },
  getNav: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/selectOrderSettleInfo', this.data.dataJson).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          userInfo: res.data.data.userCreditsInfo
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
  getDetail:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/selectCreditsLog', this.data.dataList).then((res) => {
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
  onShareAppMessage: function () {

  }
})