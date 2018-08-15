// pages/video/video.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoUrl: '',
    scale: null,
    temp: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var videoInfo = wx.getStorageSync('videoInfo');
    if (videoInfo.cover.split(':')[0] == 'http') {
      videoInfo.cover.replace('http', 'https');
    }
    this.setData({
      videoUrl: videoInfo.url
    })
    this.setCanvasSize()
    var _this = this
    wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
      url: videoInfo.cover,
      success: function (downRes) {
        console.log(downRes.tempFilePath)
        _this.setData({
          videoBgCover: downRes.tempFilePath
        })
        _this.drawCanvas()

      }
    })
  },
  videoErrorCallback: function (e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('videoInfo')
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
  drawCanvas: function () {
    let scale = this.data.scale
    var context = wx.createCanvasContext('shareCanvas')
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 720 * scale, 568 * scale);//给画布添加背景色，无背景色真机会自动变黑
    context.drawImage(this.data.videoBgCover, 0 * scale, 0 * scale, 360 * scale, 284 * scale);//绘制背景
    context.save()
    context.setGlobalAlpha(0.5) //半透明遮罩
    context.setFillStyle('#000')
    context.fillRect(0, 0, 360 * scale, 284 * scale)
    context.restore()
    context.drawImage('../../img/zhuanfa_sp_bofang@2x.png', 140 * scale, 100 * scale, 80 * scale, 80 * scale);//绘制背景

    let _that = this
    context.draw(false, setTimeout(this.saveTempCanvas, 1000))

  },
  saveTempCanvas: function () {
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var _this = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log()
    }

    return {
      title: '更多精彩视频尽在[' + wx.getStorageSync('shop').shopName + ']' + '点击查看！',

      path: "pages/index/index?shopId=" + wx.getStorageSync('shop').id,
      imageUrl: this.data.temp,
      success: function (res) {

      }
    }
  }
})