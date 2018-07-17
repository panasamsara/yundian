var app = getApp();
Page({
  data: {
    discounts: [],
    id: "",
    couponLogId: "",
    discountsNew: [],
    couponType: "",
    canLimitGoods: ""
  },
  onLoad: function(options) {
    this.setData({
      id: options.id,
      couponLogId: options.couponLogId,
      couponType: options.couponType,
      canLimitGoods: options.canLimitGoods
    })
    this.getList();
  },
  getList: function() {
    wx.showLoading({
      title: '加载中',
    })
    // 判断新客礼包和满减的礼包不同
    if (this.data.couponType == "06") {
      app.util.reqAsync('coupon/selectScCouponDetail', {
        couponLogId: this.data.couponLogId
      }).then((res) => {
        wx.hideLoading();
        this.setData({
          discountsNew: res.data.data
        });
      }).catch((err) => {
        wx.hideLoading();
        wx.showToast({
          title: '失败……',
          icon: 'none'
        })
      })
    } else {
      app.util.reqAsync('shop/getCloudCouponDetail', {
        couponId: this.data.id,
      }).then((res) => {
        wx.hideLoading();
        this.setData({
          discounts: res.data.data.coupon
        });
      }).catch((err) => {
        wx.hideLoading();
        wx.showToast({
          title: '失败……',
          icon: 'none'
        })
      })
    }
  },
  skip: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + id
    })
  }
})