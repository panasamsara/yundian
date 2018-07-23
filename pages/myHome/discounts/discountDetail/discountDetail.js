var QR = require("../../../../utils/qrcode.js");
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
    canvasHidden: false,
    shopId:"",
    limitGoods:[],
    couponCode:"",
    userId:""
  },
  onLoad: function(options) {
    wx.showShareMenu({
      withShareTicket: true,
    })
    var userId=wx.getStorageSync('scSysUser').id;
    this.setData({
      id: options.id,
      couponLogId: options.couponLogId,
      couponType: options.couponType,
      canLimitGoods: options.canLimitGoods,
      userId: userId
    })
    this.getList();
  },
  getList: function() {
    wx.showLoading({
      title: '加载中',
    })
    // 判断新客礼包和满减的礼包不同
    if (this.data.couponType == "06") {
      app.util.reqAsync('coupon/selectScCouponDetail', {
        couponLogId: this.data.couponLogId
      }).then((res) => {
        wx.hideLoading();
        this.setData({
          discountsNew: res.data.data,
          shopId: res.data.data.shopId,
        });
        this.setData({
          storeUrl: res.data.data.couponCode
        })
        // 页面初始化 options为页面跳转所带来的参数
        var size = this.setCanvasSize();//动态设置画布大小
        var initUrl = this.data.storeUrl;
        this.createQrCode(initUrl, "mycanvas", size.w, size.h);
        
      }).catch((err) => {
        wx.hideLoading();
        wx.showToast({
          title: '失败……',
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
        this.setData({
          discounts: res.data.data.coupon
        });
      }).catch((err) => {
        wx.hideLoading();
        wx.showToast({
          title: '失败……',
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
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log()
    }
    return {
      title: "分享云店",
      path: "pages/index/index?shopId=" + this.data.shopId,
      imageUrl: res.target.dataset.shoplogourl,
      success: function(res){
        app.util.reqAsync("coupon/shareCoupon", {
          couponId: _this.data.id,
          couponLogId: _this.data.couponLogId, 
          userId: _this.data.userId, 
        }).then((res) => {
        }).catch((err) => {
          wx.hideLoading();
          wx.showToast({
            title: '失败……',
            icon: 'none'
          })
        })
  
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
  // }
})

