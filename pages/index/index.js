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
  
   onLoad: function () {
     if (app.globalData.userInfo) {
       this.setData({
         userInfo: app.globalData.userInfo,
         hasUserInfo: true
       })
     } else if (this.data.canIUse) {
       // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
       // 所以此处加入 callback 以防止这种情况
       app.userInfoReadyCallback = res => {
         this.setData({
           userInfo: res.userInfo,
           hasUserInfo: true
         })
       }
     } else {
       // 在没有 open-type=getUserInfo 版本的兼容处理
       wx.getUserInfo({
         success: res => {
           app.globalData.userInfo = res.userInfo
           this.setData({
             userInfo: res.userInfo,
             hasUserInfo: true
           })
         }
       })
     }
     //获取店铺信息，globalData没数据是因为ajax还没success，success后执行回调获取success的data
     if (app.globalData.shopInfo){
       this.setData({
         shopInformation: app.globalData.shopInfo,
         hasShopInfo: true
       })
       //获取精推荐
       this.getHotList(app.globalData.shopInfo.shopInfo.id)
    }else{
       app.shopInfoCallback = res => {
         if (res != ''){
           this.setData({
             shopInformation: res,
           })
           //获取精推荐
           this.getHotList(res.shopInfo.id)
         }
       }
    }

     //是否能领取新人礼包
     util.reqAsync('shop/getCouponUseStatusDetail', {
       customerId: 32,
       shopId: 14
     }).then((res) => {
       this.setData({
         couponInfo: res.data.data
       })
       if (res.data.data.receiveStatu == true && res.data.data.useStatu == true){
         this.setData({
           showModal: true
         })
       }
     }).catch((err) => {
       wx.showToast({
         title: '失败……',
         icon: 'none'
       })
     })
     
   },
   //获取用户信息
   getUserInfo: function (e) {
     console.log(e)
     app.globalData.userInfo = e.detail.userInfo
     this.setData({
       userInfo: e.detail.userInfo,
       hasUserInfo: true
     })
   },
   //精选商品推荐列表,获取店铺信息后调用此方法
   getHotList: function(shopid){
     util.reqAsync('shop/selectShopHotCommoditiesList', {
       shopId: shopid,
       pagination: {
         page: 1,
         rows: 10
       }
     }).then((res) => {
       if (res.data.data.sListMap[0].hotCommoditiesList) {
         this.setData({
           hotCommoditiesList: res.data.data.sListMap[0].hotCommoditiesList,
           hasHotCommodities: true
         })
       } else {

       }
     }).catch((err) => {
       wx.showToast({
         title: '失败……',
         icon: 'none'
       })
     })
   },
   videoErrorCallback: function (e) {
     console.log('视频错误信息:')
     console.log(e.detail.errMsg)
   },
   showImgFuc: function(){
     this.setData({
       showImg: true,
       showVideo: false
     })
   },
   showVideoFuc: function () {
     this.setData({
       showImg: false,
       showVideo: true
     })
   },
   goAppointment: function(){
     wx.navigateTo({
       url: '../appointment/appointment',
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
      console.log('3333333跳转活动详情3333333')
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