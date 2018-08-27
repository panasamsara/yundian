var app = getApp();
Page({
  data: {
    items:{},
    list:[],
    shopName:"",
    show:""
  },
  onLoad: function (options) {
    var items = JSON.parse(options.item);
    items.purchasePrice = app.util.formatMoney(items.purchasePrice, 2);
    if (options.loseKa == 2) {
      wx.setNavigationBarTitle({
        title: "留店商品详情",
      })
    }
    this.setData({ items: items, shopName: items.shopName, show: options.loseKa})
    wx.showLoading({
      title: '加载中',
    })
    //留店商品详情接口不同options.loseKa==2为留店
    // 1 次数 2 时长 5终身
    if (options.loseKa == 0 || options.loseKa==1){
      app.util.reqAsync('member/getCardConsume', { "purchaseId": items.purchaseId, "serviceId": items.serviceId }).then((res) => {
        this.setData({ list: res.data.data });
        wx.hideLoading();
      }).catch((err) => {
        wx.hideLoading()
      })
    } else if (options.loseKa == 2){
      app.util.reqAsync('member/accRecordDetail', { "id": items.id}).then((res) => {
        this.setData({ list: res.data.data });
        console.log("list",this.data.list)
        wx.hideLoading();
      }).catch((err) => {
        wx.hideLoading()
      })
    }
    
  },
  onReady: function () {
    
  },

  onShow: function () {
  
  },

  onShareAppMessage: function () {
  
  }
})