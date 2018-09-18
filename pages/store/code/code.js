// pages/store/code/code.js
var QR = require("../../../utils/qrcode.js");
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    canvasHidden: false,
    imagePath: '',
    show:'view'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var _this = this
    app.util.getShop(user.id, options.shopId).then((res) => {
      if (res.data.code == 1){
        var shop = res.data.data.shopInfo
        wx.setStorageSync('shop', res.data.data.shopInfo);
        var address = shop.address
        if (address.length > 28) {
          address = address.substring(0, 28) + '...'
        }
        _this.setData({
          shopName: shop.shopName,
          url: shop.logoUrl,
          address: address,
          phoneService: shop.phoneService,
          storeUrl: "https://wxapp.izxcs.com/qrcode/shop/index.html?apptype=cityshop&subtype=shophome&fromscan=yes&visitFrom=1&cloud_store&sn=17&yw=shop&cp=1&shopId=" + shop.id,
          shopId: shop.id
        })
        // 页面初始化 options为页面跳转所带来的参数
        var size = _this.setCanvasSize();//动态设置画布大小
        var initUrl = _this.data.storeUrl;
        _this.createQrCode(initUrl, "mycanvas", size.w, size.h);

      }else{
        wx.showToast({
          title: '数据错误...',
        })
      }
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
        scale:res.windowWidth/375
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
          imagePath: tempFilePath
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
              that.drawPic()
            },
            fail() {//这里是用户拒绝授权后的回调
              wx.showToast({
                title: '授权后才能保存至手机相册',
                icon:'none'
              })
              that.setData({
                show:'button'
              })
              return
            }
          })
        } else {//用户已经授权
          wx.showToast({
            title: '保存中...',
            icon: 'none'
          })
          that.drawPic();
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
      that.setData({
        saveImgBtnHidden: true,
        openSettingBtnHidden: false
      })
    } else {
      wx.showToast({
        title: '已授权',
        icon:'none'
      })
      that.setData({
        saveImgBtnHidden: false,
        openSettingBtnHidden: true,
        show:'view'
      })
    }
  },

  drawPic:function(){
    var context = wx.createCanvasContext('picCanvas'),
        shop = wx.getStorageSync('shop'),
        shopLogo = shop.logoUrl,
        shopName=shop.shopName,
        address=shop.address,
        phoneService=shop.phoneService,
        borderUrl ="../images/dianpuerweima_biankuang@2x.png",
        scale=this.data.scale,
        _this=this;
    wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
      url: shopLogo,
      success: function (res) {
        _this.setData({
          path: res.tempFilePath
        })
      }
    })
    setTimeout(function(){//延时等待图片缓存
      context.save();//保存绘图上下文
      context.setFillStyle('#ffffff');
      context.fillRect(0, 0, 610 * scale, 800 * scale);//给画布添加背景色，无背景色真机会自动变黑
      context.beginPath();
      context.arc(50 * scale, 50 * scale, 25 * scale, 0, 2 * Math.PI);//绘制圆形头像画布
      context.fill();
      context.clip();
      context.drawImage(_this.data.path, 25 * scale, 25 * scale, 50 * scale, 50 * scale);//绘制店铺头像
      context.restore();//恢复之前保存的上下文
      context.setFontSize(18 * scale);
      context.fillText(shopName, 90 * scale, 42.5 * scale);//绘制店铺名
      context.setFontSize(13 * scale);
      //绘制店铺地址
      if (address.length > 14) {//地址超过14字换行
        var address1 = address.substring(0, 14),
            address2 = address.substring(14);
        context.fillText(address1, 90 * scale, 67.5 * scale);
        context.fillText(address2, 90 * scale, 92.5 * scale);
        context.fillText(phoneService, 90 * scale, 117.5 * scale);
        context.drawImage(_this.data.imagePath, 50 * scale, 140 * scale, 205 * scale, 205 * scale);
      } else {//未超过14字不换行
        context.fillText(address, 90 * scale, 67.5 * scale);
        context.fillText(phoneService, 90 * scale, 92.5 * scale);
        context.drawImage(_this.data.imagePath, 50 * scale, 120 * scale, 205 * scale, 205 * scale);
      }
      context.drawImage(borderUrl, 0, 0, 305 * scale, 400 * scale);//绘制边框
      context.draw(false, function () {//图形绘制完成后执行保存回调
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 610,
          height: 800,
          destWidth: 610,
          destHeight: 800,
          fileType: 'jpg',
          canvasId: 'picCanvas',
          success: function (res) {
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
    },2000)
  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    return{
      title: this.data.shopName,
      path:'/pages/store/code/code?shopName='+this.data.shopName+'&address='+this.data.address+'&phoneService='+this.data.phoneService+'&shopLogo='+this.data.url+'&shopId='+this.data.shopId
    }
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../../index/index?shopId=' + this.data.shopId
    })
  }
})