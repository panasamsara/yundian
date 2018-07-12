var app = getApp();
var userId = wx.getStorageSync('scSysUser').id;
Page({
  data: {
    activeIndex: "0",
    orderList: [],
    total: "",
    listData: {
      deliverStatus: 0,
      pageSize: 10,
      userId: userId,
      pageNo: 1
    }
  },
  onLoad: function (options) {
    this.getList();
  },
  onPullDownRefresh: function () {
    //票判断不为0,点击tab为空的时候不可以下拉;
    if (this.data.orderList.length != 0) {
      wx.showLoading({
        title: '加载中',
      });
      // 下拉每次清空数组
      this.data.orderList.length = 0;
      var newpage = Math.ceil(this.data.total / this.data.listData.pageSize);
      if (this.data.listData.pageNo <= newpage) {
        this.getList();
      } else {
        wx.showToast({
          title: '到底了哦',
          icon: "none"
        })
      }
      wx.stopPullDownRefresh();
    }
  },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.listData.pageSize);
    if (this.data.listData.pageNo <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.getList();
    } else {
      wx.showToast({
        title: '到底了哦',
        icon: "none"
      })
    }
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getShopOrderListNew', this.data.listData).then((res) => {
      var orderListOld = this.data.orderList;
      var data = res.data.data;
      // 格式化金额
      for (var i = 0; i < data.length; i++) {
        data[i].shouldPay = app.util.formatMoney(data[i].shouldPay,2);
        for (var j = 0; j < data[i].shopOrderInfo.length;j++){
          data[i].shopOrderInfo[j].goodsPrice = app.util.formatMoney(data[i].shopOrderInfo[j].goodsPrice, 2);
        }
        orderListOld.push(data[i]);
      }
      var desc = ++this.data.listData.pageNo;
      var page = "listData.pageNo";
      this.setData({
        orderList: orderListOld,
        total: res.data.total,
        [page]: desc
      });
      wx.hideLoading();
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
    if (index == 0) {
      this.data.activeIndex = 0
    } else {
      this.data.activeIndex = 1;
    }
    var desc = "listData.deliverStatus";
    var page = "listData.pageNo";
    this.data.orderList.length = 0;
    this.setData({
      activeIndex: this.data.activeIndex,
      [desc]: this.data.activeIndex,
      [page]: 1
    });
  
    this.getList();
  },
  skip: function (e) {
    var newArr = [];
    var index = e.currentTarget.dataset.index;
    var arr = this.data.orderList[index];
    var newArr = JSON.stringify(arr);
    wx.navigateTo({
      url: "/pages/myHome/shopOrder/orderDetail/orderDetail?arr=" + newArr + "&activeIndex=" + this.data.activeIndex
    });
  }
})