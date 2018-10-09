// pages/myHome/downLoad/downLoad.js
var QR = require("../../../utils/qrcode.js");
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeUrl: 'http://a.app.qq.com/o/simple.jsp?pkgname=com.smartcity',
    canvasHidden:false,
    openSettingBtnHidden:true,
    flag:false, //是否是苹果
    show: 'view',
    path:'',
    scale:"",
    size:'',
    boxWidth:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var size = that.setCanvasSize();//动态设置画布大小
    var initUrl = that.data.storeUrl;
    this.createQrCode(initUrl, "mycanvas", size.w, size.h);
    that.setData({
      flag: options.flag //true说明是ios
      
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
        scale: scale
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
            canvasHidden: true
          });
        
        
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  //点击图片进行预览，长按保存分享图片
  // previewImg: function (e) {
  //   var img = this.data.imagePath;
  //   console.log(img);
  //   wx.previewImage({
  //     current: img, // 当前显示图片的http链接
  //     urls: [img] // 需要预览的图片http链接列表
  //   })
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   *保存图片到相册 
   */
  /*
 * 保存到相册
*/
  save: function () {
    var that = this;
    //获取相册授权
    wx.getSetting({
      
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
              that.drawPic();
            },
            fail() {//这里是用户拒绝授权后的回调
              wx.showToast({
                title: '授权后才能保存至手机相册',
                icon: 'none'
              })
              that.setData({
                show: 'button'
              })
              return
            }
          })
        } else {//用户已经授权过了
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
      wx.showModal({
        title: '提示',
        content: '您已授权，赶紧将图片保存在相册中吧！',
        showCancel: false
      })
      that.setData({
        saveImgBtnHidden: false,
        openSettingBtnHidden: true,
        show: 'view'
      })
    }
  },

  drawPic: function () {
    
    var context = wx.createCanvasContext('picCanvas'),
      shopLogo = '../../../images/discount.png',
      shopName = '智享城市',
      borderUrl = "../../store/images/dianpuerweima_biankuang@2x.png",
      scale = this.data.scale,
      tip = '长按保存可将图片保存至系统相册',
      that = this;
    // wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
    //   url: shopLogo,
    //   success: function (res) {
    //     console.log()
    //     _this.setData({
    //       path: res.tempFilePath
    //     })
    //   }
    // })
    
    // console.log(_this.data.path)

    var width = context.measureText(shopName).width;
    var bwidth = context.measureText(tip).width;
    console.log(width)
    console.log((305 - width) / 2)
    setTimeout(function () {//延时等待图片缓存
      context.save();//保存绘图上下文
      context.setFillStyle('#ffffff');
      context.fillRect(0, 0, 610 * scale, 800 * scale);//给画布添加背景色，无背景色真机会自动变黑
      context.beginPath();

      

     // context.arc(50 * scale, 50 * scale, 25 * scale, 0, 2 * Math.PI);//绘制圆形头像画布
     // context.fill();
     // context.clip();
     // context.drawImage(shopLogo, 25 * scale, 25 * scale, 50 * scale, 50 * scale);//绘制店铺头像
      context.drawImage(shopLogo, 127.5 * scale, 25 * scale, 50 * scale, 50 * scale);
      context.restore();//恢复之前保存的上下文
      context.setFontSize(18 * scale);
      context.fillText(shopName, ((310 - width*2)/2) * scale, 110* scale);//绘制店铺名
    //  context.setFontSize(13 * scale);
      context.drawImage(that.data.imagePath, 50 * scale, 120 * scale, 205 * scale, 205 * scale);
      context.setFontSize(13 * scale);
    //  context.fillText(tip, ((305 - bwidth/2)/2) * scale, 350 * scale);//绘制备注
    //  context.drawImage(borderUrl, 0, 0, 305 * scale, 400 * scale);//绘制边框
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
    }, 2000)
  },
  downld:function(e){ //下载地址（非ios可使用）
    wx.navigateTo({
      url: '../downLoadAndroid/downLoadAndroid',
    })
  }
})