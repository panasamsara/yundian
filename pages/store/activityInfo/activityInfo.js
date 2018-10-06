// pages/store/activityInfo/activityInfo.js
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
    shareViewShow: false,
    details:{},
    list: {
      time: '2018.09.25-2018.10.06',
      shopName: '',
      pictureUrl:'',
      goodsName: '',
      descTitle: '',
      buttonShow: true
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      signType:options.signType,
      actionId: options.actionId
    })
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
    console.log(data)
    
   
  
    
    //获取报名信息
    let data = {
      goodsId: options.goodsId,
      shopId: options.shopId
    }
    _this.getData(data)
    this.setCanvasSize()
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
    app.util.reqAsync('shop/goodsDetail', data).then((res) => {
      if (res.data.data) {
        res.data.data.startTime = app.util.formatActivityDate(res.data.data.startTime);
        res.data.data.endTime = app.util.formatActivityDate(res.data.data.endTime)
        _this.data.details = res.data.data;
        console.log(_this.data.details, '所有数据')
        var time = app.util.formatActivityDate(res.data.data.startTime) + '-' + app.util.formatActivityDate(res.data.data.endTime);
        if (res.data.data.descContent != null && res.data.data.descContent != '') {
          res.data.data.descContent = res.data.data.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/background-color[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ').replace(/<s>/gi, "").replace(/<u>/gi, '').replace(/<\/s>/gi, '').replace(/<\/u>/gi, '');
        }
        this.setData({
          data: res.data.data,
          list:{
            time: time,
            shopName: _this.data.details.shopName,
            pictureUrl: _this.data.details.pictureUrl,
            goodsName: _this.data.details.goodsName,
            descTitle: _this.data.details.descTitle,
            buttonShow: true
          }
        })
        console.log(this.data.data)
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
    context.fillText(this.data.data.shopName, 70 * scale, 108 * scale);//绘制店名
    context.drawImage('../posterActivity/img/zhuanfa_hdhb_up@2x.png', 300 * scale, 94 * scale, 19 * scale, 18 * scale);//绘制小图标

    context.setFillStyle('#000');
    context.setFontSize(17 * scale);
    context.fillText(this.data.data.goodsName, 25 * scale, 172 * scale);//绘制活动名
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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
      title: '[' + this.data.data.shopName + ']' + this.data.data.descTitle,
      path: "pages/store/activityInfo/activityInfo?shopId=" + this.data.shopId + '&goodsId=' + this.data.goodsId + '&actionId=' + this.data.actionId + '&signType='+this.data.signType,
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
  // 关于活动海报的
  // 点击分享后 点击取消
  shareBtn: function () {
    this.setData({
      shareViewShow: !this.data.shareViewShow
    })
  },
  // 点击遮罩关闭
  closeTemplate: function () {
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
          let buttonshow = "list.buttonShow"
          that.setData({
            [buttonshow]: true
          })
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
  // 生成海报
  saveImg:function(){
    console.log('生成海报');
    console.log(this.data.list,'我是list')
    this.setData({
      shareViewShow: !this.data.shareViewShow,
      shareShow: !this.data.shareShow
    })
  },
  btn_img:function(){
    //创建节点选择器
    var that = this;
    var query = wx.createSelectorQuery();
    query.select('.every3').boundingClientRect(function (rect) {
      that.setData({
        oW3: rect.width
      })
      that.draw3()
    }).exec();
  },
  draw3: function () {
    var size = this.setCanvasSize3();//动态设置画布大小
    var scale = this.data.scale3;
    var _this = this
    var context = wx.createCanvasContext('myCanvas3');
    // 背景图
    context.drawImage('../../../images/bg3.png', 0, 0, 351 * scale, 702 * scale);
    // 内容背景
    context.drawImage('../../../images/bg8.png', 24 * scale, 28 * scale, 314 * scale, 361 * scale);
    // 扫码 
    context.drawImage('../../../images/saoma.png', 150 * scale, 412 * scale, 150 * scale, 75 * scale);
    // 活动模板
    context.save()
    context.beginPath()
    // context.arc(50, 50, 25, 0, 2 * Math.PI)
    // context.arc(50, 150, 25, 0, 2 * Math.PI)
    // context.clip()
    // context.drawImage(_this.data.list.pictureUrl, 13 * scale, 38 * scale, 310 * scale, 130 * scale);
    context.restore()
    // 时间
    context.setFontSize(12 * scale);
    context.setFillStyle('#FE732D');
    context.fillText('活动时间：' + _this.data.list.time, (size.w - context.measureText('活动时间：' + _this.data.list.time).width) / 2, 200 * scale);
    context.setFontSize(18 * scale);
    context.setFillStyle('#333333');
    context.fillText(_this.data.list.goodsName, (size.w - context.measureText(_this.data.list.goodsName).width) / 2, 230 * scale);
    context.setStrokeStyle('#FB452C');
    context.setLineWidth(3 * scale)
    context.moveTo(155 * scale, 250 * scale)
    context.lineTo(195 * scale, 250 * scale)
    context.stroke()
    // 活动口号
    context.setFontSize(13 * scale);
    context.setFillStyle('#999999');
    context.fillText(_this.data.list.descTitle, (size.w - context.measureText(_this.data.list.descTitle).width) / 2, 275 * scale);
    // 详情描述
    var st = '每日中午12—14时，凡在我餐厅就餐5人以上的顾客，每人均赠河豚一条，数量有限，每日送完为止，可预约。';
    var arr = st.split('');
    var st1 = '';
    var st2 = '';
    var st3 = '';
    var st1Len = 0;
    var st2Len = 0;
    var st3Len = 0;
    var flg = false
    arr.forEach(function (item, index) {
      var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      if (st1Len < 17) {
        st1 += item
        if (reg.test(item)) {
          st1Len += 1;
        } else {
          st1Len += 0.5;
        }
      } else {
        if (st2Len < 17) {
          st2 += item
          if (reg.test(item)) {
            st2Len += 1;
          } else {
            st2Len += 0.5;
          }
        } else {
          if (st3Len < 17) {
            st3 += item
            if (reg.test(item)) {
              st3Len += 1;
            } else {
              st3Len += 0.5;
            }
          } else {
            if (flg === false) {
              st3 += '...';
              flg = true;
            }
          }
        }
      }
    });
    context.setFillStyle('#666666');
    context.fillText(st1, (size.w - context.measureText(st1).width) / 2, 300 * scale);
    context.fillText(st2, (size.w - context.measureText(st2).width) / 2, 320 * scale);
    context.fillText(st3, (size.w - context.measureText(st3).width) / 2, 340 * scale);
    this.foundRect(context, 20, 40, 305, 130, 28);
    // 标题
    context.drawImage('../../../images/bg9.png', 43 * scale, 19 * scale, 149 * scale, 37 * scale);
    context.setFontSize(16 * scale);
    context.setFillStyle('#FB452C');
    var title = _this.data.list.shopName;
    if (title.length > 6) {
      title = title.substring(0, 6) + '...';
    }
    context.fillText(title, 67 * scale, 42 * scale);
    context.draw(false, function () {
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 351,
        height: 531,
        destWidth: 702,
        destHeight: 1062,
        fileType: 'jpg',
        canvasId: 'myCanvas3',
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
  setCanvasSize3: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      // var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var scale = res.windowWidth / this.data.oW3;
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
      this.setData({
        scale3: res.windowWidth / 375
      })
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  // 圆角
  foundRect: function (ctx, x, y, w, h, r) {
    ctx.save();
    if (w < 2 * r) {
      r = w / 2;
    }
    if (h < 2 * r) {
      r = h / 2;
    }
    ctx.beginPath();
    ctx.setStrokeStyle('#fff');
    ctx.setLineWidth(1);
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.clip();
    ctx.drawImage(this.data.list.pictureUrl, 20, 40, 305, 130);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
})