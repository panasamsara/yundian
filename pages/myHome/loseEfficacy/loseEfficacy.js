var app = getApp();
Page({
  data: {
    getCardByUser:[]
  },
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');
    wx.setNavigationBarTitle({
      title: shop.shopName,
    })
    this.loseEfficacy();
  },
  loseEfficacy:function(){
    wx.showLoading({
      title: '加载中',
    })
    // 1 次数 2 时长 5终身
    app.util.reqAsync('member/getLoseCardByUser', { "memberId": wx.getStorageSync("shopMemberId") }).then((res) => {
      var data = res.data.data;
      // 去除后台返回值的截止
      for (var i = 0; i < data.card.length; i++) {
        if (data.card[i].remainNum.indexOf("截止") != -1) {
          data.card[i].remainNum = data.card[i].remainNum.replace("截止", "");
        }
      }
      this.setData({ getCardByUser: data.card});
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading();
    })
  },
  skip:function(e){
    var item = e.currentTarget.dataset.item;
    console.log(item)
    wx.navigateTo({
      url: '../cardDetail/cardDetail?item=' + JSON.stringify(item)+"&loseKa="+1,
    })
  },
  onShareAppMessage: function () {
  
  }
})