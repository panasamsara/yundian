var app = getApp();
Page({
  data: {
    cardList:{},
    data:{
      orderId:""
    }
  },
  onLoad: function (options) {
    console.log(options.orderId);
    var orderid ="data.orderId";
    this.setData({ [orderid]: options.orderId });
    this.getList();
  },
  onReady: function () {
  
  },
  onShow: function () {
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    // 0-本金支付 1-卡项支付 2-现金支付 3-组合支付 4-微信支付 5-支付宝支付 6-信用卡支付 7-储蓄卡支付 9-云店线上支付
    app.util.reqAsync('member/getConsumeDetail',this.data.data).then((res) => {
      var data = res.data.data;
        data.actualPay = app.util.formatMoney(data.actualPay, 2);
      this.setData({ cardList: data });
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  onShareAppMessage: function () {
  
  }
})