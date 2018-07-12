//js
//获取应用实例
import util from '../../utils/util.js';
const app = getApp()

Page({
   data: {
      userInfo: {},
      shopInformation: {},
      hasUserInfo: false,
      couponInfo: {},
      hotCommoditiesList: [],
      hasHotCommodities: false,
      showModal: false,
      showImg: true,
      showVideo: false,
      has720: false,

      indicatorDots: true,
      vertical: false,
      autoplay: false,
      interval: 2000,
      duration: 500,

      detail: [],
      curIndex: 0,
      isScroll: false,
      toView: 'top',
   },
   onReady() {
     var self = this;
   },
   onLoad: function (e) {
     // 【扫码进入】，获取店铺ID，存入本地，请求店铺数据
     var isScanCode = e.scancode_time;
     if (isScanCode) {
        var path = encodeURI(e.q);
        var shopId = path.match(/\d+$/g)[0];
        wx.setStorageSync('shop', { id: shopId});
     }
    // 若无店铺及店铺ID，则跳转到扫码界面
     if (!util.hasShop()) return;

     //是否能领取新人礼包
    //  util.reqAsync('shop/getCouponUseStatusDetail', {
    //    customerId: 32,
    //    shopId: 14
    //  }).then((res) => {
    //    this.setData({
    //      couponInfo: res.data.data
    //    })
    //    if (res.data.data.receiveStatu == true && res.data.data.useStatu == true){
    //      this.setData({
    //        showModal: true
    //      })
    //    }
    //  }).catch((err) => {
    //    wx.showToast({
    //      title: '失败……',
    //      icon: 'none'
    //    })
    //  })
     
   },
   // 每次显示做个判断，本地没有店铺就扫码，当前没有店铺就请求数据
   onShow: function () {
     if (!util.hasShop()) {
       wx.navigateTo({ url: '/pages/scan/scan' });
       return
     }
     if (!this.data.shopInformation.shopInfo) this.getShopInfo()
     util.checkWxLogin();
   },
   // 获取店铺信息
   getShopInfo: function () {
     util.reqAsync('shop/getShopHomePageInfo', {
       customerId: wx.getStorageSync('scSysUser').id,
       shopId: wx.getStorageSync('shop').id,
     }).then((res) => {
       var shop = res.data.data.shopInfo;
       wx.setStorageSync('shop', shop);
       app.util.setHistories(shop)
       this.setData({ shopInformation: res.data.data });
       // 判断是否有720全景地址
       if (shop.shopHomeConfig.fullView720Path.length == 0){
         this.setData({ has720: false });
       }else{
         this.setData({ has720: true });
       }
       // 设置当前页面标题
       wx.setNavigationBarTitle({
         title: shop.shopName,
       })
       this.getHotList()
     })
   },
   //精选商品推荐列表,获取店铺信息后调用此方法
   getHotList: function(){
     util.reqAsync('shop/selectShopHotCommoditiesList', {
       shopId: wx.getStorageSync('shop').id,
       pagination: {
         page: 1,
         rows: 10
       }
     }).then((res) => {
       if (res.data.data.sListMap[0].hotCommoditiesList) {
         this.setData({
           hotCommoditiesList: res.data.data.sListMap[0].hotCommoditiesList,
         })
       }
     })
   },
   goPhotos: function(){
     wx.navigateTo({
       url: '../photos/photos',
     })
    //  this.setData({
    //    showImg: true,
    //    showVideo: false
    //  })
   },
   goVideoLists: function () {
    //  var shop = wx.getStorageSync('shop');
    //  wx.setStorageSync('videoUrl', shop.shopHomeConfig.videoPathList[0].filePath)
     wx.navigateTo({
       url: '../videoLists/videoLists',
     })

   },
   goLive: function(){
     var shop = wx.getStorageSync('shop');
     wx.setStorageSync('videoUrl', shop.shopHomeConfig.livePath)
    // 直播组件要用live-player重写
     wx.navigateTo({
       url: '../video/video',
     })
   },
   //模态框
   submit: function () {
     this.setData({
       showModal: true
     })
   },
   preventTouchMove: function () {

   },
   closeModal: function () {
     this.setData({
       showModal: false
     })
   },
   //领取新人礼包
   getCoupon: function(){
     util.reqAsync('shop/takeCoupon', {
       customerId: 32,
       shopId: 14,
       couponId: 1,//优惠券ID
       number: 1
     }).then((res) => {
       console.log(1111)
       console.log(res.data.data)
       this.setData({
        //  couponInfo: res.data.data
       })
     }).catch((err) => {
       wx.showToast({
         title: '失败……',
         icon: 'none'
       })
     })
   },
   goToDetail: function(e){
     var goodsid = e.currentTarget.dataset['goodsid'];
     var shopId = this.data.shopInformation.shopInfo.id
     wx.navigateTo({
       url: '../goodsDetial/goodsDetial?goodsId=' + goodsid + '&shopId=' + shopId,
       success: function (res) {
         // success
       },
       fail: function () {
         // fail
       },
       complete: function () {
         // complete
       }
     })
   },
   goToActivityDetail: function(e){
      var shopId = this.data.shopInformation.shopInfo.id
      var goodsId = e.currentTarget.dataset['activityid'];
      wx.navigateTo({
        url: '../store/activityInfo/activityInfo?shopId=' + shopId + '&goodsId=' + goodsId,
        success: function (res) {
          // success
        },
        fail: function () {
          // fail
        },
        complete: function () {
          // complete
        }
      })
   },
   goTo720: function(){
     var dataSrc = this.data.shopInformation.shopInfo.shopHomeConfig.fullView720Path
     wx.navigateTo({
       url: '../720/720?dataSrc=' + dataSrc,
       success: function (res) {
         // success
       },
       fail: function () {
         // fail
       },
       complete: function () {
         // complete
       }
     })
   }
})