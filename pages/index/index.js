//js
//获取应用实例
import util from '../../utils/util.js';
const app = getApp()

Page({
   data: {
      userInfo: {},
      shopInformation: {}, // 店铺信息
      goodsInfos: [],  // 店铺活动
      hasUserInfo: false,
      couponInfo: {},
      couponGoods: [],
      hotCommoditiesList: [],
      hasHotCommodities: false,
      showModal: false, //大礼包模态框
      showCoupnBox: false, // 礼包GIF
      showCouponGetBox: false, 
      showCouponDetail: false, // 礼包详情
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
      couponType4:'',
      animationData: {},
      outQrCodeParam:{},
      shopHasCoupon: false,
      share:false
      

   },
   onReady() {
   },
  onLoad: function (e) {
    //  debugger
     var _this =this
     console.log('进入onload---------------------------------------开始测试')
    console.log(e)
     if (e && e.q){
        var uri = decodeURIComponent(e.q)
        var p = util.getParams(uri)
        let shopId = p.shopId
        wx.setStorageSync('shopId', shopId);
        this.setData({
          shopId: shopId,
          share:true
          
        })
     }else{
       if (e && e.shopId) {
         wx.setStorageSync('shopId', e.shopId);
         this.setData({
           shopId: e.shopId,
           share: false
         })
       }
     }
     

   },
   // 每次显示做个判断，本地没有店铺就扫码，当前没有店铺就请求数据
   onShow: function () {
    //  this.onLoad();
    var _this = this
     
     util.checkWxLogin().then((loginRes) => {
       console.log('检测是否登录---------------------loginRes', loginRes)
       //  debugger
       if (loginRes.status === 0) {

         if (this.data.share) {
           wx.redirectTo({
             url: '../scan/scan?share=' + this.data.share
           })
         } else {
           wx.redirectTo({
             url: '../scan/scan?loginType=1'
           })
         }
       } else {

         var shopId = this.data.shopId
         if (!shopId) {
           shopId = wx.getStorageSync('shopId');
         }
         var shop = wx.getStorageSync('shop')
         if (!shop) {
           if (!shopId) {
             wx.redirectTo({
               url: '../scan/scan'
             })
           } else {
             util.getShop(loginRes.id, shopId).then(function (res) {

               _this.setData({
                 shopInformation: res.data.data,
                 goodsInfos: res.data.data.goodsInfos
               })
               //shop存入storage
               wx.setStorageSync('shop', res.data.data.shopInfo);
               //活动
               wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
               // 所有信息
               wx.setStorageSync('shopInformation', res.data.data);
               if (res.data.data.shopInfo.shopHomeConfig) {
                 if (res.data.data.shopInfo.shopHomeConfig.videoPathList.length != 0) {
                   let videoInfo = {}
                   videoInfo.url = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].filePath
                   videoInfo.cover = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
                   wx.setStorageSync('videoInfo', videoInfo)
                 }
               }
               _this.getShopInfo(res.data.data)
               _this.getIndexAllInfo(res.data.data.shopInfo.id)
               _this.checkCoupon()
             })
           }
         } else {
           if (shopId == undefined || shopId == '' || shopId == null) {
             if (shop.shopHomeConfig) {
               if (shop.shopHomeConfig.videoPathList.length != 0) {
                 let videoInfo = {}
                 videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
                 videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
                 wx.setStorageSync('videoInfo', videoInfo)
               }
             }
             let shopInformation = wx.getStorageSync('shopInformation')
             let goodsInfos = wx.getStorageSync('goodsInfos')

             _this.setData({
               shopInformation: shopInformation,
               goodsInfos: _this.changeStartEndTime(goodsInfos)
             })
             _this.getShopInfo(shopInformation)
             _this.getIndexAllInfo(shop.id)
             _this.checkCoupon()
           } else {
             if (shopId == shop.id) {
               if (shop.shopHomeConfig) {
                 if (shop.shopHomeConfig.videoPathList.length != 0) {
                   let videoInfo = {}
                   videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
                   videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
                   wx.setStorageSync('videoInfo', videoInfo)
                 }
               }
               let shopInformation = wx.getStorageSync('shopInformation')
               let goodsInfos = wx.getStorageSync('goodsInfos')
               console.log(wx.getStorageSync('shopInformation'))
               _this.setData({
                 shopInformation: shopInformation,
                 goodsInfos: _this.changeStartEndTime(goodsInfos)
               })
               _this.getShopInfo(shopInformation)
               _this.getIndexAllInfo(shop.id)
               _this.checkCoupon()
             } else {
               wx.removeStorageSync('shop')
               wx.removeStorageSync('goodsInfos')
               wx.removeStorageSync('shopInformation')
               util.getShop(loginRes.id, shopId).then(function (res) {
                 _this.setData({
                   shopInformation: res.data.data,
                   goodsInfos: _this.changeStartEndTime(res.data.data.goodsInfos)
                 })
                 //shop存入storage
                 wx.setStorageSync('shop', res.data.data.shopInfo);
                 //活动
                 wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
                 // 所有信息
                 wx.setStorageSync('shopInformation', res.data.data);
                 if (res.data.data.shopInfo.shopHomeConfig) {
                   if (res.data.data.shopInfo.shopHomeConfig.videoPathList.length != 0) {
                     let videoInfo = {}
                     videoInfo.url = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].filePath
                     videoInfo.cover = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
                     wx.setStorageSync('videoInfo', videoInfo)
                   }
                 }
                 _this.getShopInfo(res.data.data)
                 _this.getIndexAllInfo(res.data.data.shopInfo.id)
                 _this.checkCoupon()

               })
             }
           }
         }
          wx.removeStorageSync('shopId');
       }


     })
     console.log('进入onshow-------------------------------')
     
     
    
     
   },
   // 格式化 开始结束时间
  changeStartEndTime(goodsInfos){
    for (let i = 0; i < goodsInfos.length; i++) {
      goodsInfos[i].startTime = goodsInfos[i].startTime.substring(0, 10)
      goodsInfos[i].endTime = goodsInfos[i].endTime.substring(0, 10)
      goodsInfos[i].startTime = goodsInfos[i].startTime.replace(/\-/g, '.')
      goodsInfos[i].endTime = goodsInfos[i].endTime.replace(/\-/g, '.')
    }
    return goodsInfos
  },
  // 获取店铺活动
  getShopHomeGoods(shopId){
    let _this = this
    util.reqAsync('shop/getShopHomeGoods', {
      shopId: shopId,
      pageNo: 1,
      pageSize: 100
    }).then((res) => {
      console.log('店铺活动------------' ,res.data.data)
      wx.setStorageSync('goodsInfos', res.data.data);
      _this.setData({
        goodsInfos: _this.changeStartEndTime(res.data.data)
      })
    }).catch((err) => {
      console.log(err)
    })
  },
   // 获取店铺信息
  getShopInfo: function (resData) {
    //  var resData = res.data.data
     var shop = resData.shopInfo;

    //  shop.fansCounter = resData.fansCounter
     if (shop.shopHomeConfig.imagePathList.length != 0) {
       let imagePath = resData.shopInfo.shopHomeConfig.imagePathList[0]
       if (imagePath != undefined){
         var index_of_query = imagePath.indexOf('?')
         if (index_of_query >= 0) {
           resData.bgImageLong = imagePath.substr(0, index_of_query)
         } else {
           resData.bgImageLong = imagePath
         }
       }else{
         resData.bgImageLong = '../../images/bg1.jpg'
       }
 
     } else {
       resData.bgImageLong = '../../images/bg1.jpg'
     }
     if (resData.shopInfo.shopHomeConfig.videoPathList.length != 0) {
       let videoInfo = {}
       videoInfo.url = resData.shopInfo.shopHomeConfig.videoPathList[0].filePath
       videoInfo.cover = resData.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
       wx.setStorageSync('videoInfo', videoInfo)

       let videoPath = resData.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
       let index_of_video = videoPath.indexOf('?')
       if (index_of_video >= 0) {
         resData.videoImagecover = videoPath.substr(0, index_of_video)
       } else {
         resData.videoImagecover = videoPath
       }
     } else {
       resData.videoImagecover = '../../images/bg1.jpg'
     }
     // 设置二维码入参 offline：0-线上，1-线下; 
     shop.offline = this.data.outQrCodeParam.offline;
     shop.facilityId = this.data.outQrCodeParam.facilityId;
     wx.setStorageSync('shop', shop);
     app.util.setHistories(shop)

     this.setData({ shopInformation: resData });
    if (shop.configFirstSee == 1){
        this.setData({
          showVideo: true,
          showImg: false
        })
     }else{
        this.setData({
          showVideo: false,
          showImg: true
        })
     }
    //  if (shop.shopHomeConfig.openServiceList[0] && shop.shopHomeConfig.openServiceList[4] == false) {
    //    this.setData({
    //      showVideo: true,
    //      showImg: false
    //    })
    //  } else if (shop.shopHomeConfig.openServiceList[4]) {
    //    this.setData({
    //      showVideo: false,
    //      showImg: true
    //    })
    //  }
     // 判断是否有720全景地址
     if (shop.shopHomeConfig.fullView720Path.length == 0) {
       this.setData({ has720: false });
     } else {
       this.setData({ has720: true });
     }
     // 设置当前页面标题
     wx.setNavigationBarTitle({
       title: shop.shopName,
     })
     
   },
   // 获取首页 页面数据相关接口 （在获取到店铺信息之后调用）
   getIndexAllInfo: function(shopId){
     this.getHotList() //精品推荐
     this.getPhotoNum(shopId, 0) //图片数
     this.getPhotoNum(shopId, 1) //视频数

     // 获取秒杀
     this.getSecKillData()
     // 获取拼团
     this.getGroupBuyData()
     // 获取优惠券
     this.getCouponList()
     // 获取店铺活动
     this.getShopHomeGoods(wx.getStorageSync('shop').id)
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
   // 获取店铺信息，用于上拉刷新重新 获取店铺信息并缓存
   reloadShopInfo(){
     let _this = this
     let user = wx.getStorageSync('scSysUser')

     util.getShop(user.id, wx.getStorageSync('shop').id ).then(function (res) {
       wx.stopPullDownRefresh()
       _this.setData({
         shopInformation: res.data.data,
         goodsInfos: _this.changeStartEndTime(res.data.data.goodsInfos)
       })
       //shop存入storage
       wx.setStorageSync('shop', res.data.data.shopInfo);
       //活动
       wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
       // 所有信息
       wx.setStorageSync('shopInformation', res.data.data);
       if (res.data.data.shopInfo.shopHomeConfig) {
         if (res.data.data.shopInfo.shopHomeConfig.videoPathList.length != 0) {
           let videoInfo = {}
           videoInfo.url = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].filePath
           videoInfo.cover = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
           wx.setStorageSync('videoInfo', videoInfo)
         }
       }
       _this.getShopInfo(res.data.data)
       _this.getIndexAllInfo(res.data.data.shopInfo.id)
       _this.checkCoupon()
     })
   },
   goPhotos: function(){
     wx.navigateTo({
       url: '../../packageIndex/pages/photos/photos',
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
       url: '../../packageIndex/pages/videoLists/videoLists',
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
       url: '../../packageIndex/pages/video/video',
     })
   },
   goQrCode: function(){
     wx.navigateTo({
       url: '../store/code/code?shopId=' + wx.getStorageSync('shop').id,
     })
   },
   clickScrollTop: function(){
    //  var animation = wx.createAnimation({
    //    duration: 1000,
    //    timingFunction: 'ease',
    //  })
    //  this.animation = animation
    //  animation.height('1rpx').scaleY(0.01).step()
    //  this.setData({
    //    animationData: animation.export()
    //  })
     this.setData({
       showIndex: false,
       showIndexTopBar: true
     })
   },
   clickShowIndex: function () {
    //  var animation = wx.createAnimation({
    //    duration: 1000,
    //    timingFunction: 'ease',
    //  })
    //  this.animation = animation
    //  animation.height('100%').scaleY(1).step()

    //  this.setData({
    //    animationData: animation.export()
    //  })
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
  //  goLive: function(){
  //    var shop = wx.getStorageSync('shop');
  //    wx.setStorageSync('videoUrl', shop.shopHomeConfig.livePath)
  //   // 直播组件要用live-player重写
  //    wx.navigateTo({
  //      url: '../video/video',
  //    })
  //  },
   goSecKill: function(){
     wx.navigateTo({
       url: '../../packageIndex/pages/secKill/secKill',
     })
   },
   goGroupBuy: function(){
     wx.navigateTo({
       url: '../../packageIndex/pages/groupBuy/groupBuy',
     })
   },
   goAppointment: function(){
     util.checkWxLogin().then((res) => {
       var user = wx.getStorageSync('scSysUser');
       wx.navigateTo({
         url: '../../packageIndex/pages/appointment/appointment?name=' + user.username + '&phone=' + user.phone,
       })
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
   // 关闭礼包弹框
   closeModal: function () {
     this.setData({
       showModal: false,
       showCoupnBox: true,
       showCouponGetBox: false,
       showCouponDetail: false
     })
   },
  closeDetailModal: function(){
    this.setData({
      showModal: false,
      showCouponDetail: false
    })
  },
   //是否能领取新人礼包
   checkCoupon: function(){
     util.checkWxLogin().then((res) => {
       util.reqAsync('shop/getCouponUseStatusDetail', {
         customerId: wx.getStorageSync('scSysUser').id,
         shopId: wx.getStorageSync('shop').id
       }).then((res) => {
         if (JSON.stringify(res.data.data.coupon) == "{}" ){
           this.setData({
             showModal: false,
             showCoupnBox: false,
             showCouponGetBox: false,
             showCouponDetail: false
           })
         }else{
           var couponGoods = []
           couponGoods = res.data.data.coupon.goodsName.split("|&")
           couponGoods = couponGoods.slice(0, couponGoods.length - 1)
           for (let i = 0; i < couponGoods.length; i++) {
             if (couponGoods[i].length > 8) {
               couponGoods[i] = couponGoods[i].substring(0, 8) + '...'
             }
           }
           this.setData({
             couponInfo: res.data.data,
             couponGoods: couponGoods
           })
           if (res.data.data.receiveStatu == true && res.data.data.useStatu == false) {
             this.setData({
               showModal: true,
               showCoupnBox: true,
               showCouponGetBox: true,
               showCouponDetail: true
             })
           } else {
             this.setData({
               showModal: false,
               showCoupnBox: false,
               showCouponGetBox: false,
               showCouponDetail: false
             })
           }
         }
         
       }).catch((err) => {
         console.log(err)
       })
     })
     
   },
   //领取新人礼包
   getCoupon: function(){
     let _this = this
     util.reqAsync('shop/takeCoupon', {
       customerId: wx.getStorageSync('scSysUser').id,
       shopId: wx.getStorageSync('shop').id,
       couponId: this.data.couponInfo.coupon.couponId,//优惠券ID
       promGoodsType: this.data.couponInfo.coupon.promGoodsType,
       number: 1
     }).then((res) => {
       if(res.data.code == 9){
         wx.showToast({
           title: res.data.msg,
           icon: 'none'
         })
         // 重新刷新首页
         _this.onPullDownRefresh()
       }else{
         this.setData({
           couponLogId: res.data.data.couponLogId
         })
         // 领取成功后没有回调
         wx.showToast({
           title: '领取成功',
           icon: 'success'
         })
         this.setData({
           showModal: true,
           showCoupnBox: false,
           showCouponGetBox: false,
           showCouponDetail: true
         })
       }
       
     }).catch((err) => {

     })
   },
   openCouponBag: function () {
     this.setData({
       showModal: true,
       showCoupnBox: true,
       showCouponGetBox: true,
       showCouponDetail: true
     })
   },
   // 进入我的优惠券
  goMyCoupon: function(){
    this.setData({
      showModal: false,
      showCouponDetail: false
    })
    wx.navigateTo({
      url: '../myHome/discounts/discountDetail/discountDetail?couponLogId=' + this.data.couponLogId + '&couponType=06' + "&share=0" + "&shopId=" + wx.getStorageSync('shop').id,
      success: function (res) {
        // success
      }
    })
  },
  goStore: function(){
    wx.navigateTo({
      url: '../store/store',
      success: function (res) {
        // success
      }
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
   goToSec: function(e){
     var goodsid = e.currentTarget.dataset['goodsid'];
     var shopId = this.data.shopInformation.shopInfo.id
     wx.navigateTo({
       url: '../goodsDetial/goodsDetial?goodsId=' + goodsid + '&shopId=' + shopId + '&status=2',
       success: function (res) {
         // success
       }
     })
   },
   goToGroupBuy: function(e){
     var goodsid = e.currentTarget.dataset['goodsid']
     var groupId = e.currentTarget.dataset['groupid']
     var shopId = this.data.shopInformation.shopInfo.id
     util.checkWxLogin().then((res) => {
       var user = wx.getStorageSync('scSysUser')
       wx.navigateTo({
         url: '../goodsDetial/goodsDetial?goodsId=' + goodsid + '&shopId=' + shopId + '&status=1' + '&cUser=' + user.id + '&groupBuyingId=' + groupId,
         success: function (res) {
           // success
         }
       })
     })
    
   },
   goToActivityDetail: function(e){
    let user = wx.getStorageSync('scSysUser');
    var shopId = this.data.shopInformation.shopInfo.id
    var goodsId = e.currentTarget.dataset.activityid
    var activityType = e.currentTarget.dataset.type
    var actionId = e.currentTarget.dataset.activityid
    var signType = e.currentTarget.dataset.signtype
    if (activityType ==0){
      wx.navigateTo({
        url: '../store/activityInfo/activityInfo?shopId=' + shopId + '&goodsId=' + goodsId + '&actionId=' + actionId + '&signType=' + signType,
        success: function (res) {
          // success
        }
      })
    }else{
      wx.navigateTo({
        url: '../store/posterActivity/posterActivity?shopId=' + shopId + '&goodsId=' + goodsId + '&customerId=' + user.id + '&actionId=' + actionId + '&signType=' + signType,
        success: function (res) {
          // success
        }
      })
    }
    
   },
   goTo720: function(){
     var dataSrc = this.data.shopInformation.shopInfo.shopHomeConfig.fullView720Path
     wx.navigateTo({
       url: '../../packageIndex/pages/720/720?dataSrc=' + dataSrc,
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
     let _this = this
     
     app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
       if (res.data) {
         this.setData({
           nowTime: res.data.data
         })
       }
       clearInterval(_this.data.timer)
       _this.data.timer = setInterval(function () { _this.count() }, 1000)

     }).catch((err) => {
       console.log(err)
     })
     app.util.reqAsync('shopSecondskilActivity/selectPageList', {
       pageNo: 1,
       pageSize: 2,
       shopId: wx.getStorageSync('shop').id,
       merchantId: wx.getStorageSync('shop').merchantId,
       statusList: "0,1" 
     }).then((res) => {
       if (res.data.data.list.length>0) {
         let list = res.data.data.list,
           newData = list
         for (let i = 0; i < list.length; i++) {
           list[i].nowTime = Date.parse(app.util.formatIOS(this.data.nowTime));
           list[i].activityStartTime = Date.parse(app.util.formatIOS(list[i].activityStartTime));
           list[i].activityEndTime = Date.parse(app.util.formatIOS(list[i].activityEndTime));
           if (list[i].nowTime - list[i].activityStartTime < 0) {//活动未开始
             list[i].count = list[i].activityStartTime - list[i].nowTime;
             list[i].status = 0
           } else {//活动已开始
             list[i].count = list[i].activityEndTime - list[i].nowTime;
             list[i].status = 1
           }
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
      if (leftTime <= 0) {
        leftTime = 0;
      }
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
        h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
        m = Math.floor(leftTime / 1000 / 60 % 60),
        s = Math.floor(leftTime / 1000 % 60),
        count = "list[" + i + "].count",
        dCount = "list[" + i + "].d",
        hCount = "list[" + i + "].h",
        mCount = "list[" + i + "].m",
        sCount = "list[" + i + "].s";
      if (h < 10) {
        h = "0" + h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        [count]: leftTime,
        [dCount]: d,
        [hCount]: h,
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
         let newData = res.data.data
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
       let typeArr = []
       if (res.data.data) {
         console.log('优惠券--------------------------',res)
         let list=res.data.data;
         for(let i=0;i<list.length;i++){
           list[i].beginTime = app.util.formatActivityDate(list[i].beginTime);
           list[i].endTime = app.util.formatActivityDate(list[i].endTime)
           typeArr.push(list[i].couponType)
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
               couponType3: list[i],
             })
           }
         }
         if (typeArr.includes('01') || typeArr.includes('02') || typeArr.includes('03')){
           this.setData({
             shopHasCoupon: true
           })
         }else{
           this.setData({
             shopHasCoupon: false
           })
         }
       }
     }).catch((err) => {
       console.log(err)
     })
   },
   showQuanBox:function(){
     // 跳转领券中心
     wx.navigateTo({
       url: '../../packageMyHome/pages/discountCenter/discountCenter'
     })
    //  this.setData({
    //    showQuanBox: true
    //  })
   },
   get:function(e){
     let datas={
       shopId: wx.getStorageSync('shop').id,
       customerId: wx.getStorageSync('scSysUser').id,
       number: 1,
       couponId: e.currentTarget.dataset.id
     }
     app.util.reqAsync('shop/takeCoupon',datas).then((res) => {
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
   },
  onShareAppMessage: function () {
    return {
      title: wx.getStorageSync('shop').shopName,
      path: "pages/index/index?shopId=" + wx.getStorageSync('shop').id ,
    }
  },
  // 下拉刷新
  onPullDownRefresh(){
    this.reloadShopInfo()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // this.reloadShopInfo() // 重新获取店铺信息 (之后会 再获取拼团 秒杀 等)
    // this.getHotList() // 获取精选商品
    // this.getSecKillData() // 获取秒杀
    // this.getGroupBuyData() // 获取拼团
    // this.getShopHomeGoods(wx.getStorageSync('shop').id ) // 获取店铺活动
  },
})

