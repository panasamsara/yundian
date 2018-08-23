var app=getApp();
Page({
  data: {
    discounts:[],
    userId:"",
    shopId:""
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;
    this.setData({ userId: userId, shopId: shopId});
    this.getList();
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
    wx.stopPullDownRefresh();
  },
  getList:function(){
    wx.showLoading({
      title: '加载中',
    })
    var arr=[];
    app.util.reqAsync('shop/getMyCouponList', {
      customerId: this.data.userId,
    }).then((res) => { 
      var data = res.data.data;
      // 筛选出本店的优惠券
      for (var i = 0; i < data.length;i++){
        if (data[i].shopId == this.data.shopId){
          arr.push(data[i]);
        }
      }
      console.log(arr);
      wx.hideLoading();
      this.setData({ discounts: arr});
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
    var couponLogId = e.currentTarget.dataset.couponlogid;
    var couponType = e.currentTarget.dataset.coupontype;
    var canLimitGoods = e.currentTarget.dataset.canlimitgoods;
    var couponShare = e.currentTarget.dataset.couponshare;
    console.log(couponShare);
    wx.navigateTo({ url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + id + "&couponLogId=" + couponLogId + "&couponType=" + couponType + "&canLimitGoods=" + canLimitGoods + "&couponShare=" + couponShare+"&share=" +"0"});
  }
})