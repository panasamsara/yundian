var app = getApp();
Page({
  data: {
    cardList:[]
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })

    app.util.reqAsync('member/getFinaceDetail', { "memberId": wx.getStorageSync("shopMemberId") }).then((res) => {
      var data = res.data.data;
      for (var i = 0; i < data.length; i++) {
        data[i].changeMoney = app.util.formatMoney(data[i].changeMoney, 2);
      }
      this.setData({ cardList: res.data.data });
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  onShareAppMessage: function () {
  }
})