var app=getApp();
Page({
  data: {
    discounts:[],
    userId:""
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    this.setData({ userId: userId });
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
      customerId: this.data.userId,
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
    var couponLogId = e.currentTarget.dataset.couponlogid;
    var couponType = e.currentTarget.dataset.coupontype;
    var canLimitGoods = e.currentTarget.dataset.canlimitgoods;
    wx.navigateTo({ url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + id + "&couponLogId=" + couponLogId + "&couponType=" + couponType + "&canLimitGoods=" +canLimitGoods});
  }
})