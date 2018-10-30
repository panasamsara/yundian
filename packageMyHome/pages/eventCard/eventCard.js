// packageMyHome/pages/eventCardDetail/eventCardDetail.js
import saveImg from '../../../utils/saveImg.js';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    choose:false,
    msgData:'',
    activeId:'',
    shopId:'',
    scale: null,
    btnShow: 'normal',
    draw: false,
    temp: null,
    loginType:0,
    shareType:'',
    shareUser:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      shopId: options.shareShop ||options.shopId ,
      activeId: options.actionId || options.businessId,
      goodsId: options.goodsId || options.businessId,
      shareType: options.shareType ||6
    })
    if (options.shareUser){
      this.setData({
        shareUser: options.shareUser,
      })
    }
    console.log(this.data.shopId)
    this.setCanvasSize()
    
    // this.getData(data)
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
    var _this = this
    
    app.util.checkWxLogin('share').then((loginRes) => {
      if (loginRes.status==0){
        _this.setData({
          loginTyoe:1
        })
      }else{
        _this.getMsgdata()
        app.util.getShop(wx.getStorageSync('scSysUser').id, _this.data.shopId).then((res) => {
          if (res.data.code == 1) {
            wx.setStorageSync('shop', res.data.data.shopInfo)
          }
        })
        let paramData = {
          currentId: wx.getStorageSync('scSysUser').id,
          shareShop: _this.data.shopId,
          shareUser: _this.data.shareUser,
          sourcePart: '1',
          shareType: 6,
          businessId: _this.data.goodsId
        }
        if (this.data.shareUser && this.data.shareUser != wx.getStorageSync('scSysUser').id){
          _this.record(paramData)
        }
        
      }
    })
    
  },
  record: function (data) {
    app.util.reqAsync('payBoot/wx/acode/record', data).then((res) => {
    })
  },
  resmevent: function () {
    this.setData({
      loginType: 0
    })
    let paramData = {
      currentId: wx.getStorageSync('scSysUser').id,
      shareShop: _this.data.shopId ,
      shareUser: _this.data.shareUser,
      sourcePart: '1',
      shareType: 6,
      businessId: _this.data.goodsId
    }
    if (this.data.shareUser && this.data.shareUser != wx.getStorageSync('scSysUser').id) {
      _this.record(paramData)
    }
    app.util.getShop(wx.getStorageSync('scSysUser').id, _this.data.shopId).then((res) => {
      if (res.data.code == 1) {
        wx.setStorageSync('shop', res.data.data.shopInfo)
      }
    })
    // _this.record(paramData)
    this.getMsgdata()
  },
  getMsgdata:function(){
    var _this = this    
    app.util.reqAsync('shop/selectActivePosterById', { "activeId": this.data.activeId }).then(res => {
      if (res.data.code == 1) {
        var msgData = res.data.data
        // msgData.descContent ="<view> sdasdasdasdasd</view>"
        msgData.descContent = msgData.descContent.replace(/background-color[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="width:100%;height:auto" ').replace(/<s>/gi, "").replace(/<u>/gi, '').replace(/<\/s>/gi, '').replace(/<\/u>/gi, '').replace(/\<xmp/gi, '<p').replace(/\<\/xmp/gi, '</p');
        console.log(msgData.descContent)
        msgData.startTime = msgData.startTime.substring(0, 10)
        msgData.endTime = msgData.endTime.substring(0, 10)
        _this.setData({
          msgData: msgData
        })
        if (wx.getStorageSync('shop')) {
          wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
            url: wx.getStorageSync('shop').logoUrl,
            success: function (downRes) {
              console.log(downRes.tempFilePath)
              _this.setData({
                logo: downRes.tempFilePath
              })
              wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
                url: res.data.data.pictureUrl,
                success: function (newRes) {
                  console.log(newRes.tempFilePath)
                  _this.setData({
                    proPic: newRes.tempFilePath
                  })
                  _this.drawCanvas()
                }
              })
            }
          })
        }
      }
    })
  },
  buy:function(){
    wx.navigateTo({
      url: '../eventChoose/eventChoose?activeId=' + this.data.activeId
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  // getData: function (data) {
  //   var _this = this
  //   app.util.reqAsync('shop/goodsDetail', data).then((res) => {
  //     if (res.data.data) {
  //       res.data.data.startTime = app.util.formatActivityDate(res.data.data.startTime);
  //       res.data.data.endTime = app.util.formatActivityDate(res.data.data.endTime);
  //       if (res.data.data.descContent != null && res.data.data.descContent != '') {
  //         res.data.data.descContent = res.data.data.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/background-color[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ').replace(/<s>/gi, "").replace(/<u>/gi, '').replace(/<\/s>/gi, '').replace(/<\/u>/gi, '');
  //       }
  //       this.setData({
  //         data: res.data.data
  //       })
  //       if (wx.getStorageSync('shop')) {
         
  //       }
  //     }
  //   }).catch((err) => {
  //     console.log(err);
  //   })
  // },
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
   * 用户点击右上角分享
   */
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
    var _this=this
    var context = wx.createCanvasContext('shareCanvas')
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 720 * scale, 568 * scale);//给画布添加背景色，无背景色真机会自动变黑
    
    
    context.drawImage(this.data.proPic, 0 * scale, 0 * scale, 345 * scale, 140 * scale);//绘制背景
    context.save()
    context.setGlobalAlpha(0.5) //半透明遮罩
    context.setFillStyle('#000')
    context.fillRect(0, 0, 345 * scale, 140 * scale)
    context.restore()

    context.save()
    context.beginPath();
    context.arc(40 * scale, 100 * scale, 18 * scale, 0, 2 * Math.PI);//绘制圆形头像画布
    context.fill();
    context.clip();
    context.drawImage(this.data.logo, 22 * scale, 80 * scale, 40 * scale, 40 * scale);//绘制logo
    context.restore()
    context.setFillStyle('#fff');
    context.setFontSize(15 * scale);
    _this.cut('shopName', wx.getStorageSync('shop').shopName, 16);
    
    context.fillText(_this.data.shopName, 70 * scale, 108 * scale);//绘制店名
    context.drawImage('img/zhuanfa_hdhb_up@2x.png', 300 * scale, 94 * scale, 19 * scale, 18 * scale);//绘制小图标

    context.setFillStyle('#000');
    context.setFontSize(17 * scale);
    _this.cut('activityName', this.data.msgData.activityName, 16);
    
    context.fillText(this.data.activityName, 25 * scale, 172 * scale);//绘制活动名
    // context.drawImage('../posterActivity/img/zhuanfa_hdhb_right@2x.png', 305 * scale, 160 * scale, 9 * scale, 15 * scale);//绘制小图标

    // context.setFillStyle('#f2f2f2');
    // context.fillRect(25, 185, 290 * scale, 1 * scale)

    if (this.data.msgData.descTitle.length > 16) {
      var string2 = this.data.msgData.descTitle.substring(0, 16)
      string2 = string2 + '...'
    } else {
      var string2 = this.data.msgData.descTitle
    }
    context.setFillStyle('#999');
    context.fillText(string2, 25 * scale, 232 * scale);//绘制口号
    context.drawImage('img/zhuanfa_hdhb_clock@2x.png', 25 * scale, 260 * scale, 16 * scale, 16 * scale);//绘制小图标

    var stringTime = this.data.msgData.startTime + ' - ' + this.data.msgData.endTime
    context.setFillStyle('#999');
    context.setFontSize(16 * scale);
    context.fillText(stringTime, 50 * scale, 275 * scale);//绘制时间

    let _that = this
    context.draw(false, function () {
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
          console.log(res.tempFilePath)
          _that.setData({
            temp: res.tempFilePath
          })
        },
        fail: function (res) {
          console.log(res);
        }
      })
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
    console.log(this.data.temp)
    return {
      title: '[' + wx.getStorageSync('shop').shopName + ']' + this.data.msgData.descTitle,
      path: "packageMyHome/pages/eventCard/eventCard?shareShop=" + this.data.shopId + '&shopId=' + this.data.shopId + '&goodsId=' + this.data.goodsId + '&businessId=' + this.data.activeId + '&signType=' + this.data.signType + '&shareUser=' + wx.getStorageSync('scSysUser').id + '&shareType=6&sourcePart=1',
      imageUrl: this.data.temp,
      success: function (res) {
        // 统计转发数量
        util.reqAsync('shop/updateforwardingAmount', {
          goodsId: _this.data.goodsId,
          type: 0  // 0:增加数量   1:减少数量
        }).then((res) => {
        })
      }
    }
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../../../pages/index/index'
    })
  },
  shareBtn: function () {//点击分享
    this.setData({
      posterShow: true
    })
  },
  closeShare: function () {//取消分享
    this.setData({
      posterShow: false
    })
  },
  drawPoster: function () {//绘制海报
    if (this.data.canvasUrl) {
      return;
    }
    var _this = this;
    wx.showLoading();
    if (!_this.data.codeUrl) {
      saveImg.getCode(_this, {//获取二维码
        source: 0,
        page: "pages/QrToActivity/QrToActivity",
        params: {
          shopId: wx.getStorageSync('shop').id,
          shareUser: wx.getStorageSync('scSysUser').id,
          actionId: this.data.msgData.id,
          signType: this.data.msgData.signType,
          goodsId: this.data.msgData.id,
          sourcePart: '1',
          shareType: 6,
          shareFrom: 'eventCard'
        }
      }).then(function () {
        wx.downloadFile({
          url: _this.data.msgData.pictureUrl,
          success: function (res) {
            _this.setData({
              activityUrl: res.tempFilePath
            });
            var context = wx.createCanvasContext('newShareCanvas'),
              scale = wx.getSystemInfoSync().windowWidth / 375
            context.setFillStyle('#ffffff');
            context.fillRect(0, 0, 690 * scale, 1000 * scale);//设置白色背景
            // context.drawImage('img/yd_hdhb_bbhuodong_bg@2x.png', 0, 0, 720 * scale, 568 * scale);//给画布添加背景色，无背景色真机会自动变黑
            // context.save()
            context.drawImage('img/yd_hdhb_bbhuodong_bg@2x.png', 0, 0, 690 * scale, 1000 * scale);
            // _this.drawShadow(context, scale, 5, 5, 10, 'rgba(176,50,32,0.3)');//绘制阴影
            // context.setStrokeStyle('#ffffff');
            // _this.roundRect(context, scale, 52, 56, 600, 704, 66);//绘制圆角矩形背景
            // _this.drawShadow(context, scale, 0, 0, 30, 'rgba(228,183,177,0.3)');//绘制阴影
            // _this.roundRect(context, scale, 25, 70, 610, 260, 57);//绘制海报圆角矩形阴影矩形
            context.save();
            // _this.roundRect(context, scale, 25, 70, 610, 260, 57);//绘制海报圆角矩形背景
            // context.clip();
            context.setFontSize(36 * scale);
            
            context.setFillStyle('#76350C');
            let w = context.measureText(wx.getStorageSync('shop').shopName).width;            
            context.fillText(wx.getStorageSync('shop').shopName, (660-w)/2 * scale, 60 * scale);//绘制店铺名
            context.setFontSize(38 * scale);
            context.setFillStyle('#76350C');
            _this.cut('activityName', _this.data.msgData.activityName, 13);
            
            let w5 = context.measureText(_this.data.activityName).width;
            context.fillText(_this.data.activityName, (660 - w5) / 2 * scale, 370 * scale);//绘制店铺名
            context.drawImage(_this.data.activityUrl, 85 * scale, 90 * scale, 530 * scale,220 * scale);//绘制海报
            context.setFontSize(24 * scale);
            let timeText = '活动时间:'+ _this.data.msgData.startTime + '—' + _this.data.msgData.endTime,
              w1 = context.measureText(timeText).width;
            
            context.setFillStyle('#BFA391');
            // context.fillText(', 300 * scale, 410 * scale);//绘制活动时间
            
            context.fillText(timeText, (660 - w1) / 2 * scale, 420 * scale);//绘制活动时间
            context.restore();
            context.shadowColor = 'rgba(255,255,255,0)';
            context.beginPath();
            context.arc(270 * scale, 653 * scale, 34 * scale, 0.5 * Math.PI, 1.5 * Math.PI);//绘制左半圆
            context.closePath();
            context.setStrokeStyle('#FB452C');
            context.stroke();
            context.setFillStyle('#FB452C');
            context.fill();
            context.beginPath();
            context.arc(430 * scale, 653 * scale, 34 * scale, 0.5 * Math.PI, 1.5 * Math.PI, true);//绘制右半圆
            context.closePath();
            context.setStrokeStyle('#FB452C');
            context.stroke();
            context.setFillStyle('#FB452C');
            context.fill();
            context.setFillStyle('#FB452C');
            context.fillRect(270 * scale, 619 * scale, 160 * scale, 68 * scale);//绘制矩形
            
            context.setFillStyle('#fff');
            context.setFontSize(36 * scale);
            let money = '￥'+_this.data.msgData.activePrice
            let wm = context.measureText(money).width
            context.fillText(money, (690 - wm) / 2 * scale, 663 * scale);//绘制价格

            // _this.cut('activityName', _this.data.msgData.activityName, 10);
            // let w2 = context.measureText(_this.data.activityName).width;
            // context.fillText(_this.data.activityName, (690 - w2) / 2 * scale, 470 * scale);//绘制店铺标题
            // context.setFillStyle('#FB452C');
            // context.fillRect(305 * scale, 490 * scale, 80 * scale, 6 * scale);//绘制下划线
            context.setFontSize(28 * scale);
            // context.setFillStyle('#999999');
            // _this.cut('descTitle', _this.data.msgData.descTitle, 20, _this);
            // let w3 = context.measureText(_this.data.descTitle).width;
            // context.fillText(_this.data.descTitle, (690 - w3) / 2 * scale, 490 * scale);//绘制口号
            context.setFillStyle('#76350C');
            if (_this.data.msgData.descTitle) {
              var descTitle = _this.data.msgData.descTitle.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, ' ');
            } else {
              var descTitle = '';
            }
            let w4;
            //绘制活动内容
            if (descTitle.length <= 19) {//19字以内
              w4 = context.measureText(descTitle).width;
              context.fillText(descTitle, (650 - w4) / 2 * scale, 490 * scale);
            } else {//超过19字
              w4 = context.measureText(descTitle.substring(0, 18)).width;
              context.fillText(descTitle.substring(0, 19), (650 - w4) / 2 * scale, 490 * scale);
              if (descTitle.length <= 38) {//19到38字
                w4 = context.measureText(descTitle.substring(20)).width;
                context.fillText(descTitle.substring(19), (650 - w4) / 2 * scale, 530 * scale);
              } else {//超过38字
                w4 = context.measureText(descTitle.substring(20, 38)).width;
                context.fillText(descTitle.substring(19, 38), (650 - w4) / 2 * scale, 530 * scale);
                if (descTitle.length <= 48) {//38到48字
                  let w5 = context.measureText(descTitle.substring(38)).width;
                  context.fillText(descTitle.substring(38), (650 - w5) / 2 * scale, 570 * scale);
                } else {//超过48字
                  descTitle = descTitle.substring(38, 48) + '..'
                  let w5 = context.measureText(descTitle).width;
                  context.fillText(descTitle, (650 - w5) / 2 * scale, 570 * scale);
                }
              }
            }
            context.drawImage(_this.data.codeUrl, 470 * scale, 750 * scale, 140 * scale, 140 * scale);//绘制二维码
            // context.drawImage('../../../images/saoma.png', 310 * scale, 800 * scale, 300 * scale, 150 * scale);//绘制扫码文字图片
            context.draw(false, function () {
              setTimeout(function () {
                saveImg.temp(_this, 'newShareCanvas', 1380, 2000, 1380, 2000);
              }, 1000);
            })
          }
        })
      })
    }
  },
  saveImg: function () {//保存图片
    let _this = this;
    saveImg.saveImg(_this);
  },
  handleSetting: function (e) {//授权
    let that = this;
    saveImg.handleSetting(that, e.detail.e);
  },
  //截取文字
  cut: function (textName, text, length) {
    if (text.length > length) {
      text = text.substring(0, length) + '..';
    }
    this.setData({
      [textName]: text
    })
  },
  //绘制阴影
  drawShadow: function (context, scale, x, y, blur, color) {
    context.shadowOffsetX = x * scale;
    context.shadowOffsetY = y * scale;
    context.shadowColor = color;
    context.shadowBlur = blur * scale;
  },
  //绘制圆角矩形
  roundRect: function (context, scale, x, y, w, h, radius) {
    if (w < 2 * radius) {
      radius = w / 2;
    }
    if (h < 2 * radius) {
      radius = h / 2;
    }
    let r = radius * scale;
    context.beginPath();
    context.moveTo((x + r) * scale, y * scale);//a
    context.arcTo((x + w) * scale, y * scale, (x + w) * scale, (y + h) * scale, r);//b-c
    context.arcTo((x + w) * scale, (y + h) * scale, x * scale, (y + h) * scale, r);//c-d
    context.arcTo(x * scale, (y + h) * scale, x * scale, y * scale, r);//d-e
    context.arcTo(x * scale, y * scale, (x + r) * scale, y * scale, r);//e-a
    context.closePath();
    context.setStrokeStyle('#ffffff');
    context.stroke();
    context.fill();
  }
})