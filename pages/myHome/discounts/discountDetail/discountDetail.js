var QR = require("../../../../utils/qrcode.js");
import util from '../../../../utils/util.js';
var app = getApp();
Page({
  data: {
    discounts: [],
    id: "",
    couponLogId: "",
    discountsNew: [],
    couponType: "",
    canLimitGoods: "",
    imagePath: '',
    imagePath2:"",
    canvasHidden: false,
    shopId:"",
    limitGoods:[],
    couponCode:"",
    userId:"",
    getUserId:"",//分享领取人的id
    scale: '',
    descArr:[],
    share:"",
    promGoodsTypeShare:"",
    showMa:"0"
    },
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中',
    })
    console.log("share",options.share)
    var that=this;
    //options.share=0 说明从详情页进来 =1 说明是分享进来的
    wx.showShareMenu({
      withShareTicket: true,
    })
 

    console.log('options',options)
    if (options && options.list) { 
      
      this.setData({
        id: options.id,
        couponLogId: options.couponLogId,
        couponType: options.couponType,
        canLimitGoods: options.canLimitGoods,
        // userId: userId,
        share: options.share
      })
    }else{
      this.setData({
        couponLogId: options.couponLogId,
        couponType: options.couponType,
        // userId: userId,
        share: options.share
      })
    }
    this.setCanvasSize()  //适配不同屏幕大小的canvas


    if (options && options.q) {
      var uri = decodeURIComponent(options.q)
      var p = util.getParams(uri)
      let shopId = p.shopId
      wx.setStorageSync('shopId', shopId);
      this.setData({
        shopId: shopId
      })
    } else {
      if (options && options.shopId) {
        wx.setStorageSync('shopId', options.shopId);
        this.setData({
          shopId: options.shopId
        })
      }
    }
    

    if (options.share == 1 || options.share == 2){
      this.setData({
        shareFlag: 1
      })
    } else if (options.share==0){
      var userId = wx.getStorageSync('scSysUser').id;
      this.setData({
        userId: userId
      })
    }


  },
  onShow: function () { //缓存店铺信息（分享切店铺）
    console.log("show canLimitGoods", this.data.canLimitGoods);
    console.log("show id", this.data.id);
    console.log("show promGoodsTypeShare", this.data.promGoodsType)
    let _this = this
    var shopId = this.data.shopId
    if (!shopId) {
      shopId = wx.getStorageSync('shopId');
    }
    var shop = wx.getStorageSync('shop')
    util.checkWxLoginShare().then((loginRes) => {
      if (_this.data.shareFlag == 1){
        _this.setData({
          getUserId: loginRes.id
        })
        console.log('check login -------------------------------------------------------')
        console.log(loginRes.id)
      } 
      _this.getList();
      
      // 判断是否有缓存店铺，没有就缓存，有就看是否需要替换
      util.cacheShop(shopId, shop, _this)

      wx.removeStorageSync('shopId');
    })
  },
  drawCanvas: function(name, detail){
    let scale = this.data.scale
    var context = wx.createCanvasContext('shareCanvas')
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 720 * scale, 568 * scale);//给画布添加背景色，无背景色真机会自动变黑
    context.drawImage('./img/zhuanfa_xinrenlibao_bg@2x.png', 0 * scale, 0 * scale, 325 * scale, 283 * scale);//绘制背景
    context.setFontSize(22 * scale);
    if (detail){
      if (detail.length > 10) {
        var string1 = detail.substring(0, 10)
        var string2 = detail.substring(10, detail.length)

        let numA1 = context.measureText(string1).width
        let a1 = (345 * scale - numA1) / 2
        context.setFillStyle('#fff');
        context.fillText(string1, a1, 108 * scale);//绘制详情
        let numA2 = context.measureText(string2).width
        let a2 = (345 * scale - numA2) / 2
        context.setFillStyle('#fff');
        context.fillText(string2, a2, 132.5 * scale);//绘制详情

      } else {
        let numA = context.measureText(detail).width
        let a = (345 * scale - numA) / 2
        context.setFillStyle('#fff');
        context.fillText(detail, a, 122.5 * scale);//绘制详情
      }
    }
   
    
    context.setFontSize(30 * scale)
    let numB = context.measureText(name).width
    let b = (345 * scale - numB) / 2
    context.fillText(name, b, 165.5 * scale);//绘制名字 

    let _that = this
    context.draw(false, setTimeout(this.saveTempCanvas, 1000) )

  },
  saveTempCanvas: function(){
    let _that = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 720,
      height: 568,
      destWidth: 720,
      destHeight: 568,
      fileType: 'jpg',
      canvasId: 'shareCanvas',
      success: function (res) {
        _that.setData({
          temp: res.tempFilePath
        })
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  getList: function() {
    let _this = this
    var person;
    if (this.data.share==0){
      person = this.data.userId;
    }else{
      person = this.data.getUserId;
    }

    var dataDatail={
      userId: person,
      couponLogId: this.data.couponLogId
    }
    console.log("dataDatail------------", dataDatail);
    // 判断新客礼包和满减的礼包不同
    if (this.data.couponType == "06") {
      app.util.reqAsync('coupon/selectScCouponDetail', dataDatail).then((res) => {
       //promGoodsType为0，1 0选择商品,1手动输入
        var data = res.data.data;
        console.log(data);
        if (data.promGoodsType==1){
          var descArr = data.promGoodsDesc.split("|&");
          _this.setData({ descArr: descArr});
       }else{
          var couponGoodsName = data.couponGoodsName.split("|&");
          this.setData({ quanDetail: couponGoodsName})
       }
        _this.setData({
          discountsNew: data,
          discountData: data,
          shopId: data.shopId,
          quanName: data.couponInstruction,
          promGoodsTypeShare: data.promGoodsType,
          couponId: data.couponId
        });
        console.log("discountsNew-------------------------------", this.data.discountsNew)
        _this.setData({
          storeUrl:data.couponCode
        })
        wx.hideLoading();
        // 页面初始化 options为页面跳转所带来的参数
        var size = _this.setCanvasSize();//动态设置画布大小
        var initUrl = _this.data.storeUrl;
        _this.createQrCode(initUrl, "mycanvas", size.w, size.h);
        _this.drawCanvas(res.data.data.couponInstruction, res.data.data.couponGoodsName  )
        
      }).catch((err) => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败,请稍后再试',
          icon: 'none'
        })
      })
    } else {
      app.util.reqAsync('shop/getCloudCouponDetail', {
        couponId: this.data.id,
      }).then((res) => {
        wx.hideLoading();
        if (res.data.data.limitGoods){
          res.data.data.limitGoods.forEach(function(item,index){
            res.data.data.limitGoods[index].goodsPrice = app.util.formatMoney(res.data.data.limitGoods[index].goodsPrice, 2);
          });
          this.setData({
            limitGoods: res.data.data.limitGoods
          });
          console.log(this.data.limitGoods);
        }
        console.log('优惠券信息---------------',res.data.data)
        this.setData({
          discounts: res.data.data.coupon,
          discountData: res.data.data.coupon
        });
        let _this=this;
        wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
          url: this.data.discountData.shopLogoUrl,
          success: function (res) {
            console.log(res.tempFilePath)
            _this.setData({
              discountPic: res.tempFilePath
            })
            _this.discountDraw();
          }
        })
        // setTimeout(function(){
         
        // },1000)
        // this.drawCanvas(res.data.data.coupon.name, res.data.data.coupon.instruction)
      }).catch((err) => {
        wx.hideLoading();
        wx.showToast({
          title: '操作失败,请稍后再试',
          icon: 'none'
        })
      })
    }
  },
  skip: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + id
    })
  },
  call:function(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone //仅为示例，并非真实的电话号码
    })
  },
  //适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
      this.setData({
        scale: res.windowWidth / 375
      })
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 500);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        that.setData({
          imagePath: tempFilePath,
          // canvasHidden:true
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    console.log(img);
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
    })
  },
  
  onShareAppMessage: function (res) {
    var _this = this;
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log()
    // }
    // if (this.data.couponType == "06" && this.data.discountsNew.couponShare == 1){
    if (this.data.couponType == "06") {
      console.log('新人大礼包')
      return {
        title: "[新消息]" + this.data.discountData.shopName + "喊你来白拿钱，点击进入",
        path: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + _this.data.id + "&couponLogId=" + _this.data.couponLogId + "&couponType=" + _this.data.couponType + "&canLimitGoods=" + _this.data.canLimitGoods + "&promGoodsTypeShare=" + _this.data.promGoodsType +"&share=" + "1",
        imageUrl: _this.data.temp,
        success: function (res) {
          app.util.reqAsync("coupon/shareCoupon", {
            couponId: _this.data.couponId,
            couponLogId: _this.data.couponLogId,
            userId: _this.data.userId,
          }).then((res) => {
          }).catch((err) => {
            wx.hideLoading();
            wx.showToast({
              title: '操作失败,请稍后再试',
              icon: 'none'
            })
          })
        }
      }
    }else{
      console.log('优惠券')
      return{
        title: '更多好券,尽在' + this.data.discountData.shopName+',数量有限,先到先得',
        desc: this.data.goodsName,
        imageUrl: this.data.discountPath,
        path: '/packageMyHome/pages/discountCenter/discountCenter',
        success: function () {

        },
        // fail:function(){
        //   wx.showToast({
        //     title: '分享失败，请重试',
        //     icon:'none'
        //   })
        // }
      }
    }
    
  },
  goodsInfo:function(e){
    var shopId = e.currentTarget.dataset.shopid;
    var goodsId = e.currentTarget.dataset.goodsid;
    //跳转指定商品的详情
    wx.navigateTo({
      url: "/pages/goodsDetial/goodsDetial?shopId=" +shopId+"&goodsId="+goodsId,
    })
  },
  discountDraw:function(){
    let context = wx.createCanvasContext('discountCanvas'),
        scale=this.data.scale,
        _this=this,
        shopName=_this.data.discountData.shopName,
        endTime=_this.data.discountData.endTime.split(' ')[0],
        couponType,
        shopNameCut;
    if(shopName.length>6){
      shopName=shopName.substring(0,6)+'...';
    }
    console.log(_this.data)
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 480 * scale, 400 * scale);//绘制背景色
    context.drawImage('img/zhuanfa_youhuiquan_bg@2x.png', 0, 0, 240 * scale, 200 * scale);//绘制背景图
    if (_this.data.discountData.couponType=='01'){//优惠券
      couponType='优惠券'
    } else if (_this.data.discountData.couponType == '02'){//代金券
      couponType='代金券'
    } else if (_this.data.discountData.couponType == '03'){//包邮券
      couponType='包邮券'
    }
    context.setFontSize(25);
    context.fillText(couponType,13*scale,38*scale);//绘制券类型
    context.setFontSize(18*scale);
    context.setFillStyle('#ffffff');
    context.fillText(shopName,13*scale,68*scale);//绘制店铺名
    context.setFontSize(12);
    context.fillText('券详情',125*scale,58*scale);
    context.save();
    context.beginPath();
    context.arc(146 * scale, 90 * scale, 25 * scale, 0, 2 * Math.PI);//绘制圆形头像画布
    context.setFillStyle('grey')
    context.fill();
    context.clip();
    context.drawImage(_this.data.discountPic,121*scale,65*scale,50*scale,50*scale);//绘制店铺头像
    context.restore();//恢复之前保存的上下文
    context.setFontSize(11*scale);
    context.setFillStyle('#726f6a');
    let w=context.measureText(shopName).width;
    context.fillText(shopName,((280-w)/2)*scale,135*scale);//绘制店铺名
    context.fillText('有效期至:'+endTime,85*scale,185*scale);//绘制有效期
    context.setFontSize(16*scale);
    context.setFillStyle('#000000');
    context.fillText(couponType,120*scale,160*scale);
    context.draw(false,function(){
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 480,
        height: 400,
        destWidth: 480,
        destHeight: 400,
        fileType: 'jpg',
        canvasId: 'discountCanvas',
        success: function (res) {
          console.log(res.tempFilePath)
          _this.setData({
            discountPath: res.tempFilePath
          })
        }
      })
    })

  },
  goback: function () {//回到首页按钮
    wx.reLaunch({
      url: '../../../index/index?shopId=' + this.data.shopId
    })
  },
  // fun:function(){
  //   app.util.reqAsync("coupon/shareCoupon", {
  //     couponId: this.data.id,
  //     couponLogId: this.data.couponLogId,
  //     userId: this.data.userId,
  //   }).then((res) => {
  //     wx.showToast({
  //       title: '分享成功',
  //       icon: 'none'
  //     })

  //   }).catch((err) => {
  //     wx.hideLoading();
  //     wx.showToast({
  //       title: '失败……',
  //       icon: 'none'
  //     })
  //   })
  // },
  bindGet:function(){
    var _this=this;
    wx.showLoading({
      title: '加载中',
    })
    var data={
      "customerId": this.data.getUserId, 
      "shopId": this.data.shopId, 
      "couponId": this.data.couponId, 
      "promGoodsType": this.data.promGoodsTypeShare, 
      "number": 1 
    }
    console.log("data", data);
    app.util.reqAsync('shop/takeCoupon',data).then((res) => {
      //promGoodsType为0，1 0选择商品,1手动输入
      wx.redirectTo({
        url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + _this.data.id + "&couponLogId=" + _this.data.couponLogId + "&couponType=" + _this.data.couponType + "&canLimitGoods=" + _this.data.canLimitGoods + "&promGoodsTypeShare=" + _this.data.promGoodsType + "&share=" + "2",
      })
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '操作失败,请稍后再试',
        icon: 'none'
      })
    })
  },
  location:function(){
    // 从缓存中拿到店铺的经纬度
    var latitude = this.data.discountsNew.latitude;
    var longitude = this.data.discountsNew.longitude;
    var address = this.data.discountsNew.shopAddress;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: address,
      scale: 28
    })
  },
  hide:function(){
    //让提示打开，下面的二维码不隐藏
    //领取过礼包
    if (this.data.share == 1 && this.data.discountsNew.userCouponLogCount == 1){
      this.setData({ share: 4, showMa: 0 });
    } else if(this.data.share == 2 && this.data.discountsNew.userCouponLogCount == 1){
      this.setData({ share: 3, showMa: 1 });
    }
  }
})

