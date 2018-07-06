var app = getApp();
Page({
  data: {
    discounts: [],
    id:""
  },
  onLoad: function (options) {
    this.setData({ id: options.id})
    this.getList();
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('coupon/selectScCouponDetail', {
      couponLogId: this.data.id,
    }).then((res) => {
      wx.hideLoading();
      this.setData({ discounts: res.data.data });
      console.log(this.data.discounts);
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