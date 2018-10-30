// pages/store/activityInfo/activityInfo.js
import saveImg from '../../../utils/saveImg.js';
import util from '../../../utils/util.js';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scale: null,
    temp: null,
    signed:false,
    loginType: 0,
    btnShow: 'normal',
    draw: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      signType:options.signType,
      actionId: options.actionId
    })
    if (options.shareUser) {//转发进入页面记录推荐关系
      this.record({
        currentId: wx.getStorageSync('scSysUser').id,
        shareShop: options.shopId,
        shareUser: options.shareUser,
        sourcePart: '1',
        shareType: options.shareType,
        businessId: options.goodsId
      })
    }
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
    var _this = this
    
    this.setData({
      goodsId: options.goodsId,
      shopId: options.shopId
    })

    //获取报名信息
    let data = {
      activeId: options.goodsId
    }
    _this.getData(data)
    this.setCanvasSize()
  },
  record: function (data) {//记录推荐关系
    app.util.reqAsync('payBoot/wx/acode/record', data).then((res) => {})
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
          var data={
            shopId:this.data.shopId,
            goodsId:this.data.goodsId
          }
          this.getSignList(this.data.params);
          this.getData(data)
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
  onShow: function () { //缓存店铺信息（分享切店铺）
    var _this = this
    util.checkWxLogin('share').then((loginRes) => {
      if (loginRes.status == 0) {
        // if (wx.getStorageSync('isAuth') == 'no') {
        //   _this.setData({
        //     loginType: 2
        //   })
        // } else if (wx.getStorageSync('isAuth') == 'yes') {
          _this.setData({
            loginType: 1
          })
        // }
      } else {
        _this.setData({
          phone: loginRes.phone
        })
        var shopId = _this.data.shopId
        if (!shopId) {
          shopId = wx.getStorageSync('shopId');
        }
        var shop = wx.getStorageSync('shop')
        let params = {
          actionId: this.data.actionId,
          userId: wx.getStorageSync('scSysUser').id
        }
        _this.setData({
          params: params
        })
        _this.getSignList(_this.data.params);

        if (!shop) {
          if (shopId == undefined) {
            wx.redirectTo({
              url: '../scan/scan'
            })
          } else {
            util.getShop(loginRes.id, shopId).then(function (res) {
              _this.setData({
                shopInformation: res.data.data
              })
              //shop存入storage
              wx.setStorageSync('shop', res.data.data.shopInfo);
              //活动z
              wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
              // 所有信息
              wx.setStorageSync('shopInformation', res.data.data);

            })
          }
        } else {
          if (shopId == undefined || shopId == '' || shopId == null) {
            if (shop.shopHomeConfig) {
              if (shop.shopHomeConfig.videoPathList.length != 0) {
                let videoInfo = {}
                videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
                videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
                wx.setStorageSync('videoInfo', videoInfo)
              }
            }
            let shopInformation = wx.getStorageSync('shopInformation')
            _this.setData({
              shopInformation: shopInformation
            })

          } else {
            if (shopId == shop.id) {
              if (shop.shopHomeConfig) {
                if (shop.shopHomeConfig.videoPathList.length != 0) {
                  let videoInfo = {}
                  videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
                  videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
                  wx.setStorageSync('videoInfo', videoInfo)
                }
              }
              let shopInformation = wx.getStorageSync('shopInformation')
              _this.setData({
                shopInformation: shopInformation
              })

            } else {
              wx.removeStorageSync('shop')
              wx.removeStorageSync('goodsInfos')
              wx.removeStorageSync('shopInformation')
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
            }
          }

        }
      }


      wx.removeStorageSync('shopId');
    })
  },
  getData:function(data){
    var _this =this
    app.util.reqAsync('shop/selectActivePosterById', data).then((res) => {
      if (res.data.data) {
        res.data.data.startTime = app.util.formatActivityDate(res.data.data.startTime);
        res.data.data.endTime = app.util.formatActivityDate(res.data.data.endTime);
        if (res.data.data.descContent != null && res.data.data.descContent != '') {
          res.data.data.descContent = res.data.data.descContent.replace(/<xmp class="desc_txt">/gi, '<p>').replace(/<\/xmp>/gi, '</p>').replace(/<xmp class="desc_tit">/gi, '<p class="desc_tit">').replace(/\<img/gi, '<img style="max-width:100%;height:auto" ');
        }
        this.setData({
          data: res.data.data
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
    }).catch((err) => {
      console.log(err);
    })
  },
  //报名
  sign:function(){
    this.setData({
      signShow:true,
      unscroll:true
    })
  },
  signHide:function(){
    this.setData({
      signShow:false,
      unscroll:false
    })
  },
  inputSet:function(e){
    this.setData({
      userName:e.detail.value
    })
    console.log(this.data.userName);
  },
  textSet:function(e){
    console.log(e.detail.value)
    this.setData({
      remark:e.detail.value
    })
  },
  //提交
  submit:function(){
    let _this=this;
    setTimeout(function(){
      if (_this.data.userName == undefined || _this.data.userName == '') {
        wx.showToast({
          title: '请完善信息',
          icon: 'none'
        })
        return
      }
      if(_this.data.userName){//用户名校验
        let userFormatExp = new RegExp("^[\u4e00-\u9fa5A-Za-z]+$");
        if (!userFormatExp.test(_this.data.userName)){
          wx.showToast({
            title:'用户名只能输入中英文',
            icon:'none'
          });
          return
        }
        var userName = _this.data.userName.replace(/\s+/g, '');
      }
      if(_this.data.remark){//备注校验
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
        actionId: _this.data.actionId,
        shopId: wx.getStorageSync('shop').id
      }
      app.util.reqAsync('shop/addActionUserInfo', params).then((res) => {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        if(res.data.code==1){//报名成功
          _this.setData({
            signed: true,
            signShow: false,
            unscroll:false
          })
          _this.getSignList(_this.data.params);
        }  
      }).catch((err) => {
        console.log(err);
      })
    },500)
  },
  //获取报名信息
  getSignList:function(params){
    app.util.reqAsync('shop/getActionUserInfo', params).then((res) => {
      if (res.data.data) {
        if (res.data.data.isSignUp==1){//活动已报名
          this.setData({
            signed:true
          })
        }
        if (res.data.data.isTime==1){//活动已过期
          this.setData({
            passed:true
          })
        }
        this.setData({
          load:'done'
        })
        if(res.data.data.userList.length>0){
          this.setData({
            userList: res.data.data.userList,
            signNum:res.data.data.signNum,
          })
        }
      }
    }).catch((err) => {
      console.log(err);
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
    context.fillText(this.data.data.extend1, 70 * scale, 108 * scale);//绘制店名
    context.drawImage('../posterActivity/img/zhuanfa_hdhb_up@2x.png', 300 * scale, 94 * scale, 19 * scale, 18 * scale);//绘制小图标

    context.setFillStyle('#000');
    context.setFontSize(17 * scale);
    context.fillText(this.data.data.activityName, 25 * scale, 172 * scale);//绘制活动名
    // context.drawImage('../posterActivity/img/zhuanfa_hdhb_right@2x.png', 305 * scale, 160 * scale, 9 * scale, 15 * scale);//绘制小图标

    // context.setFillStyle('#f2f2f2');
    // context.fillRect(25, 185, 290 * scale, 1 * scale)

    if (this.data.data.descTitle.length > 16) {
      var string2 = this.data.data.descTitle.substring(0, 16)
      string2 = string2 + '...'
    } else {
      var string2 = this.data.data.descTitle
    }
    context.setFillStyle('#999');
    context.fillText(string2, 25 * scale, 232 * scale);//绘制口号
    context.drawImage('../posterActivity/img/zhuanfa_hdhb_clock@2x.png', 25 * scale, 260 * scale, 16 * scale, 16 * scale);//绘制小图标

    var stringTime = this.data.data.startTime + ' - ' + this.data.data.endTime
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
      title: '[' + this.data.data.extend1 + ']' + this.data.data.descTitle,
      path: "pages/store/activityInfo/activityInfo?shopId=" + this.data.shopId + '&goodsId=' + this.data.goodsId + '&actionId=' + this.data.actionId + '&signType='+this.data.signType+ '&shareUser=' + wx.getStorageSync('scSysUser').id+'&shareType=6',
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
      url: '../../index/index?shopId=' + this.data.shopId
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
    if(this.data.canvasUrl){
      return;
    }
    var _this = this;
    wx.showLoading();
    if(!_this.data.codeUrl){
      saveImg.getCode(_this, {//获取二维码
        source: 0,
        page: "pages/QrToActivity/QrToActivity",
        params: {
          shopId: wx.getStorageSync('shop').id,
          userId: wx.getStorageSync('scSysUser').id,
          shareUser: wx.getStorageSync('scSysUser').id,
          actionId: this.data.data.id,
          signType: this.data.data.signType,
          goodsId: this.data.data.id,
          sourcePart: '1',
          shareType: 6,
          shareFrom: 'activityInfo'
        }
      }).then(function(){
        wx.downloadFile({
          url: _this.data.data.pictureUrl,
          success: function (res) {
            _this.setData({
              activityUrl: res.tempFilePath
            });
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
            context.drawImage(_this.data.activityUrl, 25 * scale, 70 * scale, 610 * scale, 260 * scale);//绘制海报
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
            if (_this.data.data.descContent) {
              var descContent = _this.data.data.descContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, ' ');
            } else {
              var descContent = '';
            }
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
                w4 = context.measureText(descContent.substring(20,38)).width;
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
              setTimeout(function(){
                saveImg.temp(_this, 'newShareCanvas', 1380, 2000, 1380, 2000);
              },1000);
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
  cut:function(textName,text,length){
    if(text.length>length){
      text=text.substring(0,length)+'..';
    }
    this.setData({
      [textName]:text
    })
  },
  //绘制阴影
  drawShadow:function(context,scale,x,y,blur,color){
    context.shadowOffsetX=x*scale;
    context.shadowOffsetY=y*scale;
    context.shadowColor=color;
    context.shadowBlur=blur*scale;
  },
  //绘制圆角矩形
  roundRect:function(context,scale,x,y,w,h,radius){
    if (w<2*radius) {
      radius= w/2;
    }
    if(h<2*radius) {
      radius=h/2;
    }
    let r=radius*scale;
    context.beginPath();
    context.moveTo((x+r) * scale,y * scale);//a
    context.arcTo((x+w)*scale,y*scale,(x+w)*scale,(y+h)*scale,r);//b-c
    context.arcTo((x+w) * scale, (y+h) * scale,x*scale,(y+h)*scale,r);//c-d
    context.arcTo(x * scale, (y+h) * scale, x * scale, y * scale,r);//d-e
    context.arcTo(x * scale, y * scale,(x+r)*scale,y*scale,r);//e-a
    context.closePath();
    context.setStrokeStyle('#ffffff');
    context.stroke();
    context.fill();
  }
})