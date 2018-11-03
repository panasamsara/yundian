import util from '../../../utils/util.js';
import saveImg from '../../../utils/saveImg.js';
const app = getApp();

Page({
  // 页面数据
  data: {
    url: '',
    goodsId: null,
    shopId: null,
    actionId: null,
    activityData: null,
    scale: null,
    temp: null,
    signed: false,
    signType: null,
    loginType:0,
    btnShow: 'normal'
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    let url = util.SHARE_URL+'/yueba/yundian/posterTemplate/posterTemplate.html?&goodsId=' + options.goodsId + '&shopId=' + options.shopId + '&customerId=' + options.customerId
    var _this = this;

    this.setData({
      url: url,
      goodsId: options.goodsId,
      shopId: options.shopId,
      // phone: wx.getStorageSync('scSysUser').phone,
      signType: options.signType,
      actionId: options.actionId,
      shareUser: options.shareUser || null,
    });
    // 小程序分享 加上分享记录
    if (options.shareUser && _this.data.shareUser != wx.getStorageSync('scSysUser').id){
      _this.record({
        currentId: wx.getStorageSync('scSysUser').id,
        shareShop: options.shopId,
        shareUser: options.shareUser,
        sourcePart: '1',
        shareType: 6,
        businessId: options.goodsId
      })
    }
    console.log('111111----',options)
    this.setCanvasSize()

   
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
    // 获取店铺信息
    // var user = wx.getStorageSync('scSysUser');
    // util.getShop(user.id, options.shopId).then((res) => {
    //   wx.setStorageSync('shop', res.data.data.shopInfo);
    // })
    //获取报名信息
    this.getAct(options.goodsId, options.shopId)
    if (wx.getStorageSync('scSysUser')){
      var params = {
        actionId: options.actionId,
        userId: wx.getStorageSync('scSysUser').id
      }
      this.setData({
        params: params
      })
      this.getSignList(_this.data.params);
      
    }else{
      this.setData({
        actionId: options.actionId
      })
    }
   
    // this.getSignList(params);
  },
  // 记录推荐关系
  record: function (data) {
    app.util.reqAsync('payBoot/wx/acode/record', data).then((res) => {
console.log('记录关系的参数------------',data)
    })
  },
  //登录注册回调
  resmevent: function (e) {
    if (wx.getStorageSync('scSysUser')) {
      this.setData({
        loginType: 0,
        phone: wx.getStorageSync('scSysUser').phone
      })
      app.util.getShop(wx.getStorageSync('scSysUser').id, this.data.shopId).then((res) => {
        // debugger
        if (res.data.code == 1) {
          wx.setStorageSync('shop', res.data.data.shopInfo)
          wx.setStorageSync('shop', res.data.data.shopInfo);
          //活动
          wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
          // 所有信息
          wx.setStorageSync('shopInformation', res.data.data);
          let params = {
            actionId: this.data.actionId,
            userId: wx.getStorageSync('scSysUser').id
          }
          this.setData({
            params: params
          })
          this.getSignList(this.data.params);
          this.getAct(options.goodsId, options.shopId)
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
  //报名
  sign: function () {
    this.setData({
      signShow: true,
      unscroll: true
    })
  },
  signHide: function () {
    this.setData({
      signShow: false,
      unscroll: false
    })
  },
  inputSet: function (e) {
    this.setData({
      userName: e.detail.value
    })
    console.log(this.data.userName);
  },
  textSet: function (e) {
    console.log(e.detail.value)
    this.setData({
      remark: e.detail.value
    })
  },
  //提交
  submit: function () {
    let _this = this;
    setTimeout(function () {
      if (_this.data.userName == undefined || _this.data.userName == '') {
        wx.showToast({
          title: '请完善信息',
          icon: 'none'
        })
        return
      }
      if (_this.data.userName) {//用户名校验
        let userFormatExp = new RegExp("^[\u4e00-\u9fa5A-Za-z]+$");
        if (!userFormatExp.test(_this.data.userName)) {
          wx.showToast({
            title: '用户名只能输入中英文',
            icon: 'none'
          });
          return
        }
        var userName = _this.data.userName.replace(/\s+/g, '');
      }
      if (_this.data.remark) {//备注校验
        let remarkFormatExp = new RegExp("[~'!@#￥$%^&*()-+_=:]");
        if (remarkFormatExp.test(_this.data.remark)) {
          wx.showToast({
            title: '备注只能输入中英文和数字',
            icon: 'none'
          });
          return
        }
        var ranges = [
          '\ud83c[\udf00-\udfff]',
          '\ud83d[\udc00-\ude4f]',
          '\ud83d[\ude80-\udeff]'
        ],
        remark = _this.data.remark.replace(new RegExp(ranges.join('|'), 'g'), '').replace(/\s+/g, '');
      }
     
      let params = {
        phone: _this.data.phone,
        remark: remark,
        userId: wx.getStorageSync('scSysUser').id,
        userName: userName,
        actionId: _this.data.actionId
      }
      app.util.reqAsync('shop/addActionUserInfo', params).then((res) => {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        if (res.data.code == 1 ) {//报名成功||已报名
          _this.setData({
            signed: true,
            signShow: false,
            unscroll: false
          })
          _this.getSignList(_this.data.params);
        }
      }).catch((err) => {
        console.log(err);
      })
    }, 500)
  },
  //获取报名信息
  getSignList: function (params) {
    app.util.reqAsync('shop/getActionUserInfo', params).then((res) => {
      if (res.data.data) {
        if (res.data.data.isSignUp == 1) { // 已报名
          this.setData({
            signed: true
          })
        }
        if (res.data.data.isTime == 1) {//活动已过期
          this.setData({
            passed: true
          })
        }else{
          this.setData({
            passed: false
          })
        }
        this.setData({
          load: 'done'
        })
        if (res.data.data.userList.length > 0) {
          this.setData({
            userList: res.data.data.userList,
            signNum: res.data.data.signNum,
          })
          console.log(this.data.signNum)
        }
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  onShow: function () { //缓存店铺信息（分享切店铺）
    var _this = this;

    if (_this.data.shareUser && _this.data.shareUser != wx.getStorageSync('scSysUser').id) {
      _this.record({
        currentId: wx.getStorageSync('scSysUser').id,
        shareShop: _this.data.shopId,
        shareUser: _this.data.shareUser,
        sourcePart: '1',
        shareType: 6,
        businessId: _this.data.goodsId
      })
    }

    util.checkWxLogin('share').then((loginRes) => {
      console.log(loginRes)

      if (loginRes.status == 0) {
        // if (wx.getStorageSync('isAuth') == 'no') {
        //   this.setData({
        //     loginType: 2
        //   })
        // } else if (wx.getStorageSync('isAuth') == 'yes') {
          this.setData({
            loginType: 1
          })
        // }
      } else {
        _this.getSignList({
          actionId: _this.data.actionId,
          userId: wx.getStorageSync('scSysUser').id});
        _this.setData({
          phone: loginRes.phone
        })
        var shopId = this.data.shopId
        if (!shopId) {
          shopId = wx.getStorageSync('shopId');
        }
        // var shop = wx.getStorageSync('shop')

        util.getShop(wx.getStorageSync('scSysUser').id, shopId).then(res => {
          if (res.data.code == 1) {
            wx.setStorageSync('shop', res.data.data.shopInfo)
            wx.setStorageSync('shop', res.data.data.shopInfo);
            //活动
            wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
            // 所有信息
            wx.setStorageSync('shopInformation', res.data.data);
            this.getAct(this.data.goodsId, this.data.shopId)
            
          }
        })

        // 判断是否有缓存店铺，没有就缓存，有就看是否需要替换


        // wx.removeStorageSync('shopId');

      }
    })
   
  },
  getAct: function (goodsId, shopId){
    var _this = this
    // app.util.reqAsync('shop/goodsDetail', {
    //   goodsId: goodsId,
    //   shopId: shopId
    app.util.reqAsync('shop/selectActivePosterById', {
      activeId: goodsId,
    }).then((res) => {
      console.log(999)
      console.log(res)
      if (res.data.code == 9) {
        _this.setData({
          passed: true
        })
        if (res.data.code == 9) {
          _this.setData({
            passed: true
          })
        }






        
      }
      console.log(999)
      if (res.data.data) {
        res.data.data.startTime = app.util.formatActivityDate(res.data.data.startTime);
        res.data.data.endTime = app.util.formatActivityDate(res.data.data.endTime)
        _this.data.details = res.data.data;
        console.log(_this.data.details, '所有数据')
        var time = app.util.formatActivityDate(res.data.data.startTime) + '-' + app.util.formatActivityDate(res.data.data.endTime);
        this.setData({
          activityData: res.data.data,
          data:res.data.data,
          list: {
            time: time,
            shopName: _this.data.details.shopName,
            pictureUrl: _this.data.details.pictureUrl,
            goodsName: _this.data.details.goodsName,
            descTitle: _this.data.details.descTitle,
            buttonShow: true
          }
        })
        if (wx.getStorageSync('shop')){
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
                    proPic: newRes.tempFilePath,
                    downloadStatus:'done'
                  })
                  _this.drawCanvas()
                }
              })
            }
          })
        }                   
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  drawCanvas: function () {
    let scale = this.data.scale
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
    context.fillText(this.data.activityData.extend1, 70 * scale, 108 * scale);//绘制店名
    context.drawImage('./img/zhuanfa_hdhb_up@2x.png', 300 * scale, 94 * scale, 19 * scale, 18 * scale);//绘制小图标

    context.setFillStyle('#000');
    context.setFontSize(17 * scale);
    context.fillText(this.data.activityData.activityName, 25 * scale, 172 * scale);//绘制活动名
    // context.drawImage('./img/zhuanfa_hdhb_right@2x.png', 305 * scale, 160 * scale, 9 * scale, 15 * scale);//绘制小图标

    // context.setFillStyle('#f2f2f2');
    // context.fillRect(25, 185, 290 * scale, 1 * scale)

    if (this.data.activityData.descTitle.length > 16) {
      var string2 = this.data.activityData.descTitle.substring(0, 16)
      string2 = string2 + '...'
    } else {
      var string2 = this.data.activityData.descTitle
    }
    context.setFillStyle('#999');
    context.fillText(string2, 25 * scale, 232 * scale);//绘制口号
    context.drawImage('./img/zhuanfa_hdhb_clock@2x.png', 25 * scale, 260 * scale, 16 * scale, 16 * scale);//绘制小图标

    var stringTime = this.data.activityData.startTime + ' - ' + this.data.activityData.endTime
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

  onShareAppMessage: function (res) {
    var _this = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log()
    }

    return {
      title: '[' + this.data.activityData.extend1 + ']'  + this.data.activityData.descTitle,
      path: "pages/store/posterActivity/posterActivity?shopId=" + this.data.shopId + '&goodsId=' + this.data.goodsId + '&actionId=' + this.data.actionId + '&signType=' + this.data.signType + '&shareUser=' + wx.getStorageSync('scSysUser').id,
      imageUrl: this.data.temp,
      success: function (res) {
        _this.updateforwardingAmount(_this.data.goodsId) // 用户转发点击量统计
      }
    }
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../../index/index?shopId=' + this.data.shopId
    })
  },
  // 用户转发点击量统计
  updateforwardingAmount(goodsId){
    app.util.reqAsync('shop/updateforwardingAmount', {
      goodsId: goodsId,
      type: 0     // 0:增加    1:减少
    }).then((res) => {

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
    wx.showLoading();
    var _this=this;
    if (!_this.data.codeUrl){
      saveImg.getCode(_this, {//获取二维码
        source: 0,
        page: "pages/QrToActivity/QrToActivity",
        params: {
          shopId: wx.getStorageSync('shop').id,
          userId: wx.getStorageSync('scSysUser').id,
          shareUser: wx.getStorageSync('scSysUser').id,
          actionId: _this.data.activityData.id,
          signType: _this.data.activityData.signType,
          goodsId: _this.data.activityData.id,
          sourcePart: '1',
          shareType: 6,
          shareFrom: 'posterActivity'
        }
      }).then(function(){
        wx.downloadFile({//缓存网络图片，直接使用网络路径真机无法显示或绘制
          url: _this.data.data.pictureUrl,
          success: function (newRes) {
            _this.setData({
              proPic: newRes.tempFilePath
            })
            var context = wx.createCanvasContext('newShareCanvas'),
              scale = wx.getSystemInfoSync().windowWidth / 375;
            context.setFillStyle('#ffffff');
            context.fillRect(0, 0, 690 * scale, 1000 * scale);//设置白色背景
            context.drawImage('../../../images/bg3.png', 0, 0, 690 * scale, 1000 * scale);
            _this.drawShadow(context, scale, 5, 5, 10, 'rgba(176,50,32,0.3)');//绘制阴影
            context.setStrokeStyle('#ffffff');
            _this.roundRect(context, scale, 52, 56, 600, 704, 66);//绘制圆角矩形背景
            _this.drawShadow(context, scale, 0, 0, 30, 'rgba(228,183,177,0.3)');//绘制阴影
            _this.roundRect(context, scale, 25, 70, 610, 260, 57);//绘制海报圆角矩形阴影矩形
            context.save();
            _this.roundRect(context, scale, 25, 70, 610, 260, 57);//绘制海报圆角矩形背景
            context.clip();
            context.drawImage(_this.data.proPic, 25 * scale, 70 * scale, 610 * scale, 260 * scale);//绘制海报
            context.restore();
            context.setFontSize(30 * scale);
            let w = context.measureText(_this.data.data.extend1).width;
            context.shadowColor = 'rgba(255,255,255,0)';
            context.beginPath();
            context.arc(122.5 * scale, 70 * scale, 37 * scale, 0.5 * Math.PI, 1.5 * Math.PI);//绘制左半圆
            context.closePath();
            context.setStrokeStyle('#ffffff');
            context.stroke();
            context.setFillStyle('#ffffff');
            context.fill();
            context.beginPath();
            context.arc((122.5 + w) * scale, 70 * scale, 37 * scale, 0.5 * Math.PI, 1.5 * Math.PI, true);//绘制右半圆
            context.closePath();
            context.setStrokeStyle('#ffffff');
            context.stroke();
            context.setFillStyle('#ffffff');
            context.fill();
            context.setFillStyle('#ffffff');
            context.fillRect(122.5 * scale, 33 * scale, w * scale, 74 * scale);//绘制矩形
            context.setFillStyle('#FB452C');
            context.fillText(_this.data.data.extend1, 122.5 * scale, 79 * scale);//绘制店铺名
            context.setFontSize(24 * scale);
            let timeText = '活动时间:  ' + _this.data.data.startTime + '—' + _this.data.data.endTime,
              w1 = context.measureText(timeText).width;
            context.setFillStyle('#FE732D');
            context.fillText(timeText, (690 - w1) / 2 * scale, 380 * scale);//绘制活动时间
            context.setFillStyle('#333333');
            context.setFontSize(36 * scale);
            _this.cut('activityName', _this.data.data.activityName, 10);
            let w2 = context.measureText(_this.data.activityName).width;
            context.fillText(_this.data.activityName, (690 - w2) / 2 * scale, 470 * scale);//绘制店铺标题
            context.setFillStyle('#FB452C');
            context.fillRect(305 * scale, 490 * scale, 80 * scale, 6 * scale);//绘制下划线
            context.setFontSize(26 * scale);
            context.setFillStyle('#999999');
            _this.cut('descTitle', _this.data.data.descTitle, 20, _this);
            let w3 = context.measureText(_this.data.descTitle).width;
            context.fillText(_this.data.descTitle, (690 - w3) / 2 * scale, 540 * scale);//绘制口号
            context.setFillStyle('#666666');
            let descContent = _this.data.data.descContent;
            let w4;
            //绘制活动内容
            if (descContent.length <= 19) {//19字以内
              w4 = context.measureText(descContent).width;
              context.fillText(descContent, (690 - w4) / 2 * scale, 600 * scale);
            } else {//超过19字
              w4 = context.measureText(descContent.substring(0, 19)).width;
              context.fillText(descContent.substring(0, 20), (690 - w4) / 2 * scale, 600 * scale);
              if (descContent.length <= 38) {//19到38字
                w4 = context.measureText(descContent.substring(20)).width;
                context.fillText(descContent.substring(20), (690 - w4) / 2 * scale, 645 * scale);
              } else {//超过38字
                w4 = context.measureText(descContent.substring(20, 38)).width;
                context.fillText(descContent.substring(20, 38), (690 - w4) / 2 * scale, 645 * scale);
                if (descContent.length <= 48) {//38到48字
                  let w5 = context.measureText(descContent.substring(38)).width;
                  context.fillText(descContent.substring(38), (690 - w5) / 2 * scale, 690 * scale);
                } else {//超过48字
                  descContent = descContent.substring(39, 48) + '..'
                  let w5 = context.measureText(descContent).width;
                  context.fillText(descContent, (690 - w5) / 2 * scale, 690 * scale);
                }
              }
            }
            context.drawImage(_this.data.codeUrl, 100 * scale, 800 * scale, 158 * scale, 158 * scale);//绘制二维码
            context.drawImage('../../../images/saoma.png', 290 * scale, 800 * scale, 300 * scale, 150 * scale);//绘制扫码文字图片
            context.draw(false, function () {
              setTimeout(function () {
                saveImg.temp(_this, 'newShareCanvas', 1380, 2000, 1380, 2000);
              }, 1000)
            })
          }
        })
      });
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