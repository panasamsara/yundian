var app=getApp();
Page({
  data: {
    discounts:[]
  },
  onLoad: function (options) {
    this.getList();
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
    wx.stopPullDownRefresh();
  },
  getList:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyCouponList', {
      customerId: 1870,
    }).then((res) => { 
      wx.hideLoading();
      this.setData({ discounts: res.data.data});
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  skip: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + id })
  }
})