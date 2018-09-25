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
    signed:false
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
    let data = {
      goodsId: options.goodsId,
      shopId:options.shopId
    }
    this.setData({
      goodsId: options.goodsId,
      shopId: options.shopId
    })
    console.log(data)
    app.util.reqAsync('shop/goodsDetail', data).then((res) => {
      if(res.data.data){
        res.data.data.startTime = app.util.formatActivityDate(res.data.data.startTime);
        res.data.data.endTime = app.util.formatActivityDate(res.data.data.endTime)
        if (res.data.data.descContent != null && res.data.data.descContent!=''){
          res.data.data.descContent = res.data.data.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/background-color[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ').replace(/<s>/gi, "").replace(/<u>/gi,'').replace(/<\/s>/gi,'').replace(/<\/u>/gi,'');
        } 
        this.setData({
          data: res.data.data
        })
        
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
    }).catch((err) => {
      console.log(err);
    })
    //获取报名信息
    let params={
      actionId:options.actionId,
      userId: wx.getStorageSync('scSysUser').id
    }
    this.setData({
      params:params
    })
    this.setCanvasSize()
  },
  onShow: function () { //缓存店铺信息（分享切店铺）
    var _this = this
    util.checkWxLogin('share').then((loginRes) => {
      _this.setData({
        phone: loginRes.phone
      })
      var shopId = this.data.shopId
      if (!shopId) {
        shopId = wx.getStorageSync('shopId');
      }
      var shop = wx.getStorageSync('shop')

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
            //活动
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
      wx.removeStorageSync('shopId');
      this.getSignList(this.data.params);
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
        actionId: _this.data.actionId
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
  }
})