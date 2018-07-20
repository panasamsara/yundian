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
      showCoupnBox: true,
      showImg: true,
      showVideo: false,
      has720: false,
      photoNum: 0,
      videoNum: 0,
      showIndex: true,
      showIndexTopBar: false,

      indicatorDots: true,
      vertical: false,
      autoplay: false,
      interval: 2000,
      duration: 500,

      detail: [],
      curIndex: 0,
      isScroll: false,
      toView: 'top',
      list: [], // 秒杀数组 
      groupBuyList: [], // 拼团数组
      showQuanBox: false,
      showBtnList: true,
      hideBtnList: false,
      couponType1:'',
      couponType2:'',
      couponType3:'',
      couponType4:''
   },
   onReady() {
     var self = this;
   },
   onLoad: function (e) {
     console.log(e);
     // 【扫码进入】，获取店铺ID，存入本地，请求店铺数据
     var isScanCode = e.scancode_time;
     if (isScanCode) {
       console.log(1111);
        var path = encodeURI(e.q);
        console.log(path);
        var shopId = path.match(/\d+$/g)[0];
        wx.setStorageSync('shop', { id: shopId});
     }
     if (e.shopId){
       wx.setStorageSync('shop', { id: e.shopId });
     }
    // 若无店铺及店铺ID，则跳转到扫码界面
     if (!util.hasShop()) return;
    // 获取秒杀
     this.getSecKillData()
     let _this = this
     var timer = setInterval(function () { _this.count() }, 1000)
     // 获取拼团
     this.getGroupBuyData()
    // 查看新人礼包
     this.checkCoupon()
     this.getCouponList()
   },
   // 每次显示做个判断，本地没有店铺就扫码，当前没有店铺就请求数据
   onShow: function () {
     if (!util.hasShop()) {
       wx.navigateTo({ url: '/pages/scan/scan' });
       return
     }
     if (!this.data.shopInformation.shopInfo) this.getShopInfo()
     util.checkWxLogin();

     var shop = wx.getStorageSync('shop');
     if (shop ){
       if (shop.shopHomeConfig){
         if (shop.shopHomeConfig.videoPathList.length != 0) {
           wx.setStorageSync('videoUrl', shop.shopHomeConfig.videoPathList[0].filePath)
         }
       }
     }

   },
   // 获取店铺信息
   getShopInfo: function () {
     util.reqAsync('shop/getShopHomePageInfo', {
       customerId: wx.getStorageSync('scSysUser').id,
       shopId: wx.getStorageSync('shop').id,
     }).then((res) => {

       var shop = res.data.data.shopInfo;
       shop.fansCounter = res.data.data.fansCounter
       if (res.data.data.shopInfo.shopHomeConfig.imagePathList.length != 0){
         let imagePath = res.data.data.shopInfo.shopHomeConfig.imagePathList[0]
         let index_of_query = imagePath.indexOf('?')
         if (index_of_query >=0){
           res.data.data.bgImageLong = imagePath.substr(0, index_of_query)
         }else{
           res.data.data.bgImageLong = imagePath
         }
       } else {
         res.data.data.bgImageLong = '../../images/bg1.jpg'
       }
       if (res.data.data.shopInfo.shopHomeConfig.videoPathList.length !=0){
         wx.setStorageSync('videoUrl', res.data.data.shopInfo.shopHomeConfig.videoPathList[0].filePath)
         let videoPath = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
          let index_of_video = videoPath.indexOf('?')
          if (index_of_video >= 0) {
            res.data.data.videoImagecover = videoPath.substr(0, index_of_video)
          } else {
            res.data.data.videoImagecover = videoPath
          }
       } else {
         res.data.data.videoImagecover = '../../images/bg1.jpg'
       }
       
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
       this.getPhotoNum(shop.id, 0) //图片数
       this.getPhotoNum(shop.id, 1) //视频数
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
       if (res.data.data){
         if (res.data.data.sListMap.length != 0) {
           if (res.data.data.sListMap[0].hotCommoditiesList) {
             this.setData({
               hotCommoditiesList: res.data.data.sListMap[0],
             })
           }
         }
       }
       
       
     })
   },
   goPhotos: function(){
     wx.navigateTo({
       url: '../photos/photos',
     })
   },
   showPotos: function(){
      this.setData({
        showImg: true,
        showVideo: false
      })
   },
   goVideoLists: function () {
     wx.navigateTo({
       url: '../videoLists/videoLists',
     })

   },
   showVideo: function(){
     this.setData({
       showImg: false,
       showVideo: true
     })
   },
   goIndexVideo: function(){
     wx.navigateTo({
       url: '../video/video',
     })
   },
   clickScrollTop: function(){
     this.setData({
       showIndex: false,
       showIndexTopBar: true
     })
   },
   clickShowIndex: function () {
     this.setData({
       showIndex: true,
       showIndexTopBar: false
     })
   },
   getPhotoNum: function (id, contentType){
     util.reqAsync('cloudshop/getShopPhotoNum', {
       shopId: id,
       contentType: contentType
     }).then((res) => {
       if (contentType == 0){
         this.setData({
           photoNum: res.data.data.photoNum
         })
       }else{
         this.setData({
           videoNum: res.data.data.photoNum
         })
       }
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
   goSecKill: function(){
     wx.navigateTo({
       url: '../secKill/secKill',
     })
   },
   goGroupBuy: function(){
     wx.navigateTo({
       url: '../groupBuy/groupBuy',
     })
   },
   goAppointment: function(){
     var user = wx.getStorageSync('scSysUser');
     console.log(user)
     wx.navigateTo({
       url: '../appointment/appointment?name=' + user.username + '&phone=' + user.phone,
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
       showModal: false,
       showCoupnBox: true
     })
   },
   //是否能领取新人礼包
   checkCoupon: function(){
     util.reqAsync('shop/getCouponUseStatusDetail', {
       customerId: wx.getStorageSync('scSysUser').id,
       shopId: wx.getStorageSync('shop').id
     }).then((res) => {
       this.setData({
         couponInfo: res.data.data
       })
       if (res.data.data.receiveStatu == true && res.data.data.useStatu == false) {
         this.setData({
           showModal: true,
           showCoupnBox: true
         })
       }else{
         this.setData({
           showModal: false,
           showCoupnBox: false
         })
       }
     }).catch((err) => {
       wx.showToast({
         title: '失败……',
         icon: 'none'
       })
     })
   },
   //领取新人礼包
   getCoupon: function(){
     util.reqAsync('shop/takeCoupon', {
       customerId: wx.getStorageSync('scSysUser').id,
       shopId: wx.getStorageSync('shop').id,
       couponId: this.data.couponInfo.coupon.couponId,//优惠券ID
       number: 1
     }).then((res) => {
       // 领取成功后没有回调
       wx.showToast({
         title: '领取成功',
         icon: 'success'
       })
       this.setData({
         showModal: false,
         showCoupnBox: false
       })
     }).catch((err) => {
       wx.showToast({
         title: '失败……',
         icon: 'none'
       })
     })
   },
   openCouponBag: function () {
     this.setData({
       showModal: true,
       showCoupnBox: true
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
   },
   // 获取秒杀
   getSecKillData: function (data) {
     let oldData = this.data.list
     app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
       if (res.data) {
         this.setData({
           nowTime: res.data.data
         })
       }
     }).catch((err) => {
       console.log(err)
     })
     app.util.reqAsync('shopSecondskilActivity/selectPageList', {
       pageNo: 1,
       pageSize: 2,
       shopId: wx.getStorageSync('shop').id,
       status: 1  
     }).then((res) => {
       if (res.data.data.list.length>0) {
         let list = res.data.data.list,
           newData = oldData.concat(list);
         for (let i = 0; i < list.length; i++) {
           list[i].activityStartTime = Date.parse(this.data.nowTime);
           list[i].activityEndTime = Date.parse(list[i].activityEndTime);
           list[i].count = list[i].activityEndTime - list[i].activityStartTime;
         }
         this.setData({
           list: newData
         })
       }
     }).catch((err) => {
       console.log(err)
     })
   },
   // 倒计时
   count: function () {
     let _this = this;
     for (let i = 0; i < this.data.list.length; i++) {
       let leftTime = this.data.list[i].count;
       leftTime -= 1000;
       if (leftTime<=0){
         leftTime = 0
       }
       let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
         h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
         m = Math.floor(leftTime / 1000 / 60 % 60),
         s = Math.floor(leftTime / 1000 % 60),
         rh = d * 24 + h,
         count = "list[" + i + "].count",

         rhCount = "list[" + i + "].rh",
         mCount = "list[" + i + "].m",
         sCount = "list[" + i + "].s";
       if (rh < 10) {
         rh = "0" + rh;
       }
       if (m < 10) {
         m = "0" + m;
       }
       if (s < 10) {
         s = "0" + s;
       }
       this.setData({
         [count]: leftTime,
         [rhCount]: rh,
         [mCount]: m,
         [sCount]: s
       })
     }
   },
   // 获取拼团
   getGroupBuyData: function () {
     let oldData = []
     app.util.reqAsync('shop/getGroupBuyingList', {
       pageNo: 1,
       shopId: wx.getStorageSync('shop').id,
       pageSize: 2
     }).then((res) => {
       
       if (res.data.data) {
         let newData = oldData.concat(res.data.data)
         this.setData({
           groupBuyList: newData
         })
       }
     }).catch((err) => {
       console.log(err)
     })
   },
   getCouponList: function(){
     let datas={
      shopId: wx.getStorageSync('shop').id
     }
     app.util.reqAsync('shop/getCouponList',datas).then((res) => {
       if (res.data.data) {
         let list=res.data.data;
         for(let i=0;i<list.length;i++){
           list[i].beginTime = app.util.formatActivityDate(list[i].beginTime);
           list[i].endTime = app.util.formatActivityDate(list[i].endTime)
           if (list[i].couponType=='01'){//优惠券
             this.setData({
               couponType1:list[i]
             })
           } else if (list[i].couponType == '02'){//代金券
             this.setData({
               couponType2: list[i]
             })
           } else if (list[i].couponType == '03'){//包邮
             this.setData({
               couponType3: list[i]
             })
           }
         }
       }
     }).catch((err) => {
       console.log(err)
     })
   },
   showQuanBox:function(){
     this.setData({
       showQuanBox: true
     })
   },
   get:function(e){
     console.log(e)
     let datas={
       shopId: wx.getStorageSync('shop').id,
       customerId: wx.getStorageSync('scSysUser').id,
       number: 1,
       couponId: e.currentTarget.dataset.id
     }
     app.util.reqAsync('shop/takeCoupon',datas).then((res) => {
       console.log(res.data.msg)
       wx.showToast({
         title: res.data.msg,
         icon:'none'
       })
     }).catch((err) => {
       console.log(err)
     })
   },
   closeQuanBox :function(){
     this.setData({
      showQuanBox: false
     })
   },
   hideBtnList: function(){
     this.setData({
       showBtnList: false,
       hideBtnList: true
     })
   },
   showBtnList: function(){
     this.setData({
       showBtnList: true,
       hideBtnList: false
     })
   }
})