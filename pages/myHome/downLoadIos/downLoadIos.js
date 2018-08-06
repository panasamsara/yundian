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
    flag:false //是否是苹果
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var size = that.setCanvasSize();//动态设置画布大小
    var initUrl = that.data.storeUrl;
    this.createQrCode(initUrl, "mycanvas", size.w, size.h,1);
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
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH,a) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(a); }, 500);
  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function (a) {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        if(a==1){ //1-显示二维码
          that.setData({
            imagePath: tempFilePath,
            canvasHidden: true
          });
        }else{ //保存图片

        }
        
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
    var size = that.setCanvasSize();//动态设置画布大小
    //获取相册授权
    wx.getSetting({
      
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {//这里是用户同意授权后的回调
              that.savaImageToPhoto();
            },
            fail() {//这里是用户拒绝授权后的回调
              that.setData({
                saveImgBtnHidden: true,
                openSettingBtnHidden: false
              })
            }
          })
        } else {//用户已经授权过了
          that.setData({
            openSettingBtnHidden:true
          })
          that.savaImageToPhoto();
        }
      }
    })
  },

  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
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
        openSettingBtnHidden: true
      })
    }
  },

  savaImageToPhoto: function () {
    
    let that = this;
    wx.showLoading({
      title: '努力生成中...'
    })
    // wx.canvasToTempFilePath({
    //   canvasId: 'codeBox',
    //   success: function (res) {
    //     var tempFilePath = res.tempFilePath;
    //     that.setData({
    //       imagePath: tempFilePath,
    //       canvasHidden: true
    //     });
     //   wx.hideLoading()
        wx.saveImageToPhotosAlbum({
          filePath: this.data.imagePath,
          success(res) {
            wx.hideLoading();
            wx.showModal({
              content: '图片已保存到相册了',
              showCancel: false,
              confirmText: '保存成功了哟~',
              confirmColor: '#72B9C3',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定');
                  that.setData({
                    hidden: true
                  })
                }
              }
            })
          }
        })
      // },
      // fail: function (res) {
      //   console.log(res)
      // }
   // })
  },
  downld:function(e){ //下载地址（非ios可使用）
    wx.navigateTo({
      url: '../downLoadAndroid/downLoadAndroid',
    })
  }
})