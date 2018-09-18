const app = getApp()
Page({
  data: {
    shopId: "",
    merchantId: "",
    integralList: [],
    dataJson: {
      "shopId": "",
      "pageNo": 1,
      "pageSize": 10,
      "merchantId": ""
    },
    flag: "true",
    flag2: "true",
    orderNo:""
  },
  onLoad: function (options) {
    var shopId = wx.getStorageSync('shop').id;
    var merchantId = wx.getStorageSync('shop').merchantId;
    var dataJsonshopId = 'dataJson.shopId';
    var dataJsonmerchantId = 'dataJson.merchantId';
    if (options.orderNo==""){
      this.setData({
        orderNo:""
      })
    }else{
      this.setData({
        orderNo: options.orderNo
      })
    }
    this.setData({
      [dataJsonshopId]: shopId,
      [dataJsonmerchantId]: merchantId,
    })
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
    var arr = [];
    app.util.reqAsync('shop/selectCreditsListV2', this.data.dataJson).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        arr = this.data.integralList;
        var data = res.data.data;
        for (var i in data) {
          data[i].memberPrice = app.util.formatMoney(data[i].memberPrice, 2);
        }
        this.setData({
          integralList: arr.concat(res.data.data)
        })
        //首次进入判断加载更多是不是显示
        if (this.data.dataJson.pageSize * this.data.dataJson.pageNo >= res.data.total) {
          this.setData({
            flag: true,
            flag2: false,
          })
        } else {
          this.setData({
            flag: false,
            flag2: true,
          })
        }
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '',
        icon: 'none'
      })
    })
  },
  addLoad: function () {
    this.data.dataJson.pageNo++;
    this.getList();
  },
  checkOrder:function(){
    wx.navigateTo({
      url: '../orderdetail/orderdetail?orderNo=' + this.data.orderNo,
    })
  },
  goIndex:function(){
    wx.switchTab({
      url: '../../../pages/index/index'
    })
  },
  goDetail: function (e) {
    var goodsId = e.currentTarget.dataset.goodsid;
    var goodsType = e.currentTarget.dataset.goodstype;
    console.log(goodsId);
    console.log(goodsType);
    wx.navigateTo({
      url: '../goodsdetail/goodsdetail?goodsId=' + goodsId + "&goodsType=" + goodsType
    })
  },
  exchange: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm?id=' + id
    })
  },
  checkAccount:function(){
    wx.navigateTo({
      url: '../../../packageMyHome/pages/myAccount/myAccount'
    })
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
})