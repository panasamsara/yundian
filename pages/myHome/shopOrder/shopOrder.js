var app = getApp();
Page({
  data: {
    activeIndex:"0",
    orderList:[],
  },
  onLoad: function (options) {
    this.getList();
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onPullDownRefresh: function () {
  },
  onReachBottom: function () {
  
  },
  getList:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getShopOrderListNew',{
      "deliverStatus": this.data.activeIndex,
      "pageSize": 1,
      "userId": 1870,
      "pageNo": 1
    }).then((res) => {
      wx.hideLoading();
      this.setData({ orderList: res.data.data });
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  typeTop: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0){
      this.data.activeIndex = 0
    }else{
      this.data.activeIndex = 1;
    }

    this.setData({ activeIndex: this.data.activeIndex});
    this.getList();
  },
  skip: function (e) {
    var newArr =[];
    var index = e.currentTarget.dataset.index;
    var arr = this.data.orderList[index];
    var newArr = JSON.stringify(arr);
    wx.navigateTo({ url: "/pages/myHome/shopOrder/orderDetail/orderDetail?arr=" + newArr + "&activeIndex=" + this.data.activeIndex});
  }
})