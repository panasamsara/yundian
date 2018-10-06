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
    showMa:"0",
    shareViewShow: false,
    // 分享模板要传递的数据
    list: {
      imgUrl:'',
      name: '海底捞2',
      money: '',
      type: '新手礼包礼包礼包',
      ewmImg:"",
      buttonShow: 'true'
    },
    loginType:0,
    // 控制分享模板1是否显示
    shareShow: false, 
    scale2: '',
    oW: 0,
    oW2: 0,
    scale4: ''
    },
  onLoad: function(options) {
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
    app.util.checkWxLogin('share').then((loginRes) => {
      if(loginRes.id){
        if (_this.data.shareFlag == 1) {
          wx.showLoading({
            title: '加载中',
          })
          _this.setData({
            getUserId: loginRes.id
          })
          console.log('check login -------------------------------------------------------')
          console.log(loginRes.id)
        }
        _this.getList();

        // 判断是否有缓存店铺，没有就缓存，有就看是否需要替换
        // util.cacheShop(shopId, shop, _this)
        util.getShop(loginRes.id, shopId).then(function (res) {
          _this.setData({
            shopInformation: res.data.data
          })
          //shop存入storage
          wx.setStorageSync('shop', res.data.data.shopInfo);
          //活动
          wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
          // 所有信息
          wx.setStorageSync('shopInformation', res.data.data);

        })
        
      } else{
        // if (wx.getStorageSync('isAuth') == 'no') {
        //   this.setData({
        //     loginType: 2
        //   })
        // } else if (wx.getStorageSync('isAuth') == 'yes') {
          this.setData({
            loginType: 1
          })
        // }
      }
    })
  },
  //登录注册回调
  resmevent: function (e) {
    if (wx.getStorageSync('scSysUser')) {
      this.setData({
        loginType: 0,
        getUserId: wx.getStorageSync('scSysUser').id,
        userId: wx.getStorageSync('scSysUser').id
      })
          this.getList();
      
      app.util.getShop(wx.getStorageSync('scSysUser').id, this.data.shopId).then((res) => {
        // debugger
        if (res.data.code == 1) {
          wx.setStorageSync('shop', res.data.data.shopInfo)
          wx.setStorageSync('shop', res.data.data.shopInfo);
          //活动
          wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
          // 所有信息
          wx.setStorageSync('shopInformation', res.data.data);


        }
      })


      // this.getData(this.data.parm)
      // this.loadFn(wx.getStorageSync('scSysUser').id)
    }
  },
  //获取用户信息回调
  resusermevent: function (e) {
    // debugger
    // if (!wx.getStorageSync('scSysUser')) {
    //   this.setData({
    //     loginType: 1
    //   })

    // }
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
        console.log(data,'卷详情');
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
          promStatus: data.promStatus,
          shopId: data.shopId,
          quanName: data.couponInstruction,
          promGoodsTypeShare: data.promGoodsType,
          couponId: data.couponId,
          list: {
            name: data.shopName,
            money: data.couponValue,
            type: data.couponInstruction,
            buttonShow: true
          }
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
      console.log('我是优惠券啊')
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
          discountData: res.data.data.coupon,
          list: {
            imgUrl: res.data.data.coupon.shopLogoUrl,
            name: res.data.data.coupon.shopName,
            type: res.data.data.coupon.name,
            buttonShow: true
          }
        });
        console.log(this.data.list,'我是优惠券啊')
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
    console.log(res)
    // if (res.from === 'button') {
    //   // 来自页面内转发按钮
    //   console.log()
    // }
    // if (this.data.couponType == "06" && this.data.discountsNew.couponShare == 1){+
    // debugger
    //判断是新人礼包并且不是得到的礼包
    if (this.data.couponType == "06") {
      console.log('新人大礼包')
      return {
        title: "[新消息]" + this.data.discountData.shopName + "喊你来白拿钱，点击进入",
path: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + _this.data.id + "&couponLogId=" + _this.data.couponLogId + "&couponType=" + _this.data.couponType + "&canLimitGoods=" + _this.data.canLimitGoods + "&promGoodsTypeShare=" + _this.data.promGoodsType + "&share=" + "1" + "&shopId=" + _this.data.shopId,        imageUrl: _this.data.temp,
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
    } else{
      console.log(this.data.shopId)
      return{
        title: '更多好券,尽在' + _this.data.discountData.shopName+',数量有限,先到先得',
        desc: _this.data.goodsName,
        imageUrl: _this.data.discountPath,
        path: '/packageMyHome/pages/discountCenter/discountCenter?shopId=' + _this.data.shopId,
        success: function () {
          console.log('/packageMyHome/pages/discountCenter/discountCenter?shopId=' + this.data.shopId)

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
      if(res.data.code!=1){
        wx.showToast({
          title: res.data.msg,
          icon:'none'
        })
      }else{
        var newcouponLogId = res.data.data.couponLogId;
        wx.redirectTo({
          url: "/pages/myHome/discounts/discountDetail/discountDetail?id=" + _this.data.id + "&couponLogId=" + newcouponLogId + "&couponType=" + _this.data.couponType + "&canLimitGoods=" + _this.data.canLimitGoods + "&promGoodsTypeShare=" + _this.data.promGoodsType + "&share=" + "2&shopId=" + this.data.shopId,
        })
      }
      
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
  },
  // 点击分享后 点击取消
  shareBtn: function () {
    this.setData({
      shareViewShow: !this.data.shareViewShow
    })
  },
  // 点击遮罩关闭
  closeTemplate:function(){
    this.setData({
      shareShow: !this.data.shareShow
    })
  },
  // 再授权
  save: function () {
    var that = this;
    //获取相册授权
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
              wx.showToast({
                title: '保存中...',
                icon: 'none'
              })
              let buttonshow = "list.buttonShow"
              that.setData({
                [buttonshow]: true
              })
              that.btn_img()
            },
            fail() {//这里是用户拒绝授权后的回调
              console.log('走了save的fail');
              wx.showToast({
                title: '授权后才能保存至手机相册',
                icon: 'none'
              })
              let buttonshow = "list.buttonShow"
              that.setData({
                [buttonshow]: false
              })
              return
            }
          })
        } else {//用户已经授权
          wx.showToast({
            title: '保存中...',
            icon: 'none'
          })
          that.data.list.buttonShow = true;
          that.btn_img()
        }
      }
    })
  },
  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '提示',
        content: '若不打开授权，则无法将图片保存在相册中！',
        showCancel: false
      })
      let buttonshow = "list.buttonShow"
      that.setData({
        [buttonshow]: false
      })
    } else {
      wx.showToast({
        title: '已授权',
        icon: 'none'
      })
      let buttonshow = "list.buttonShow"
      that.setData({
        [buttonshow]: true
      })
    }
  },
  // 点击生成海报 出现分享弹窗
  saveImg: function () {
    this.setData({
      shareViewShow: !this.data.shareViewShow,
      shareShow: !this.data.shareShow
    })
  },
  btn_img: function () {
    console.log('btn_img')
    //创建节点选择器
    var that = this;
    var query = wx.createSelectorQuery();
    if (this.data.couponType === '06') {
      query.select('.every').boundingClientRect(function (rect) {
        that.setData({
          oW: rect.width
        })
        that.drawShare()
      }).exec();
    }
    else {
      query.select('.every6').boundingClientRect(function (rect) {
        that.setData({
          oW2: rect.width
        })
        that.draw06()
      }).exec();
    }
  },
  // 新手大礼包
  drawShare: function () {
    var size = this.setShareCanvasSize();//动态设置画布大小
    var scale = this.data.scale2;
    var _this = this
    var context = wx.createCanvasContext('myShareCanvas');
    context.save();//保存绘图上下文
    context.setFillStyle('#fff');
    context.fillRect(0, 0, 610 * scale, 800 * scale);//给画布添加背景色，无背景色真机会自动变黑
    context.beginPath();
    //绘制商品名
    context.fill();
    context.setFontSize(18 * scale);
    context.setFillStyle('#333333');
    context.fillText(_this.data.list.name, (size.w - context.measureText(_this.data.list.name).width) / 2, 40 * scale);
    // 绘制图片
    var imgUrl = '../../../../images/bg.png';
    context.drawImage(imgUrl, 10 * scale, 30 * scale, 332 * scale, 422 * scale);

    // 绘制标题
    context.setFillStyle('#FF6629');
    var price = '价值' + _this.data.list.money + '元'
    context.fillText(price, (size.w - context.measureText(price).width) / 2, 108 * scale);
    // 绘制礼包类型名称
    var typeLen = this.data.list.type.length;
    console.log('礼包的长度=',typeLen);
    if (typeLen < 5) {
      context.setFontSize(34 * scale);
    }
    else if (typeLen > 4 && typeLen < 7) {
      context.setFontSize(28 * scale);
    }
    else {
      context.setFontSize(24 * scale);
    }
    context.setFillStyle('#FF3E3E');
    context.fillText(this.data.list.type, (size.w - context.measureText(this.data.list.type).width) / 2, 180 * scale);
    context.draw(false, function () {
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 351,
        height: 480,
        destWidth: 702,
        destHeight: 960,
        fileType: 'jpg',
        canvasId: 'myShareCanvas',
        success: function (res) {
          console.log(res.tempFilePath)
          // 保存图片到本地
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'none'
              })
            }
          })
        }
      })
    });
  },
  setShareCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      // var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var scale = res.windowWidth / this.data.oW;
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
      this.setData({
        scale2: res.windowWidth / 375
      })
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  // 优惠券
  draw06: function () {
    var size = this.setCanvasSize06();//动态设置画布大小
    var scale = this.data.scale;
    var _this = this
    var context = wx.createCanvasContext('myShareCanvas6');
    // 绘制图片
    context.save();//保存绘图上下文
    var imgUrl = '../../../../images/bg6.png';
    context.drawImage(imgUrl, 0, 0, 350 * scale, 531 * scale);

    // logo
    context.save()
    context.beginPath()
    context.arc(176, 50, 28, 0, 2 * Math.PI)
    context.clip()
    context.drawImage(this.data.list.imgUrl, 148, 22, 56, 56)
    context.restore();

    // 绘制标题
    context.setFontSize(16 * scale);
    context.setFillStyle('#ffffff');
    context.fillText(this.data.list.name, (size.w - context.measureText(this.data.list.name).width) / 2, 108 * scale);
    // 绘制劵类型
    context.setFontSize(45 * scale);
    context.fillText(this.data.list.type, (size.w - context.measureText(this.data.list.type).width) / 2, 180 * scale);
    context.draw(false, function () {
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 351,
        height: 531,
        destWidth: 702,
        destHeight: 1062,
        fileType: 'jpg',
        canvasId: 'myShareCanvas6',
        success: function (res) {
          console.log(res.tempFilePath)
          // 保存图片到本地
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({
                title: '保存成功',
                icon: 'none'
              })
            }
          })
        }
      })
    });
  },
  //适配不同屏幕大小的canvas
  setCanvasSize06: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      // var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var scale = res.windowWidth / this.data.oW2;
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
      this.setData({
        scale4: res.windowWidth / 375
      })
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  }
})

