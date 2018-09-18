const app = getApp()
Page({
  data: {
    userId:"",
    shopId:"",
    merchantId:"",
    userCreditsInfo:{},
    integralList:[],
    dataJson:{
      "pageNo": 1,
      "shopId": "",
      "userId": "",
      "pageSize": 10,
      "merchantId": ""
    },
    dataList:{
      "pageNo": 1,
      "shopId": "",
      "pageSize": 10,
      "merchantId": ""
    },
    ordeInfo:[],
    flag:"true",
    flag2:"true"
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;
    var merchantId = wx.getStorageSync('shop').merchantId;
    var dataListshopId ='dataList.shopId';
    var dataListmerchantId ='dataList.merchantId';
    var dataJsonshopId = 'dataJson.shopId';
    var dataJsonmerchantId = 'dataJson.merchantId';
    var dataJsonuserId = 'dataJson.userId';

    this.setData({
      [dataListshopId]: shopId,
      [dataListmerchantId]: merchantId,
      [dataJsonshopId]: shopId,
      [dataJsonmerchantId]: merchantId,
      [dataJsonuserId]: userId,
      [userId]: userId
    })
    this.getList();
  },
  onReady: function () {
  
  },
  onShow: function () {
    // this.data.integralList.length=0;
    // this.data.dataList.pageNo=1;
    this.getNav();
  },
  getNav:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/selectOrderSettleInfo', this.data.dataJson).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          userCreditsInfo: res.data.data.userCreditsInfo,
          ordeInfo: res.data.data.ordeInfo
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '',
        icon: 'none'
      })
    })
  },
  getList:function(){
    wx.showLoading({
      title: '加载中',
    })
    var arr=[];
    app.util.reqAsync('shop/selectCreditsList', this.data.dataList).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        arr = this.data.integralList;
        var data = res.data.data;
        for (var i in data) {
          data[i].memberPrice=app.util.formatMoney(data[i].memberPrice, 2);
        }
        this.setData({
          integralList: arr.concat(res.data.data)
        })
        //首次进入判断加载更多是不是显示
        if (this.data.dataList.pageSize * this.data.dataList.pageNo >= res.data.total) {
          this.setData({
            flag: true,
            flag2: false,
          })
        }else{
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
  addLoad:function(){
    this.data.dataList.pageNo++;
    this.getList();
  },
  integralDetail:function(){
    wx.navigateTo({
      url: '../integralDetail/integralDetail',
    })
  },
  integralRule:function(){
    wx.navigateTo({
      url: '../integralRule/integralRule',
    })
  },
  exchange: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm?id=' + id
    })
  },
  goDetail:function(e){
    var goodsId = e.currentTarget.dataset.goodsid;
    var goodsType = e.currentTarget.dataset.goodstype;
    wx.navigateTo({
      url: '../goodsdetail/goodsdetail?goodsId=' + goodsId + "&goodsType=" + goodsType
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