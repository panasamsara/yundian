
const app = getApp();
Page({
  data:{
    path2: '',
    scale2: '',
    oW: 0
  },
  onLoad: function () {
    
  },
  btn_img: function () {
    console.log(2)
    //创建节点选择器
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.every').boundingClientRect(function (rect) {
      that.setData({
        oW: rect.width
      })
      that.drawShare()
    }).exec();
  },
  drawShare: function () {
    var size = this.setShareCanvasSize();//动态设置画布大小
    var scale = this.data.scale2;
    var _this = this
    var context = wx.createCanvasContext('myCanvas');
    context.save();//保存绘图上下文
    context.setFillStyle('#fff');
    context.fillRect(0, 0, 610 * scale, 800 * scale);//给画布添加背景色，无背景色真机会自动变黑
    context.beginPath();
    //绘制商品名
    context.fill();
    context.setFontSize(18 * scale);
    context.setFillStyle('#333333');
    context.fillText('海底捞', (size.w - context.measureText('海底捞').width) / 2, 40 * scale);
    // 绘制图片
    var imgUrl = './images/bg.png';
    context.drawImage(imgUrl, 10 * scale, 30 * scale, 332 * scale, 422 * scale);

    // 绘制标题
    context.setFillStyle('#FF6629');
    context.fillText('免费赠送500抵用券', (size.w - context.measureText('免费赠送500抵用券').width) / 2, 108 * scale);
    // 绘制礼包类型名称
    context.setFontSize(34 * scale);
    context.setFillStyle('#FF3E3E');
    context.fillText('新手礼包', (size.w - context.measureText('新手礼包').width) / 2, 180 * scale);
    // console.log(size.w)
    // console.log(size.h)
    // console.log(size.w * 2)
    // console.log(size.h * 2)
    context.draw(false, function () {
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 351,
        height: 480,
        destWidth: 702,
        destHeight: 960,
        fileType: 'jpg',
        canvasId: 'myCanvas',
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
  }
})