import util from '../../../utils/util.js';

const app = getApp();

Page({
  // 页面数据
  data: {
    url: '',
    goodsId: null,
    shopId: null,
    activityData: null,
    scale: null,
    temp: null
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    let url = util.SHARE_URL+'/yueba/yundian/posterTemplate/posterTemplate.html?&goodsId=' + options.goodsId + '&shopId=' + options.shopId + '&customerId=' + options.customerId

    this.setData({
      url: url,
      goodsId: options.goodsId,
      shopId: options.shopId
    });
    this.setCanvasSize()

    this.getAct(options.goodsId, options.shopId)

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
  },
  onshow: function () { //缓存店铺信息（分享切店铺）
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
          if (res.data.data.shopInfo.shopHomeConfig) {
            if (res.data.data.shopInfo.shopHomeConfig.videoPathList.length != 0) {
              let videoInfo = {}
              videoInfo.url = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].filePath
              videoInfo.cover = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
              wx.setStorageSync('videoInfo', videoInfo)
            }
          }
          _this.getShopInfo(res.data.data)
          _this.getIndexAllInfo(res.data.data.shopInfo.id)
          _this.checkCoupon()
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
        _this.getShopInfo(shopInformation)
        _this.getIndexAllInfo(shop.id)
        _this.checkCoupon()
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
          _this.getShopInfo(shopInformation)
          _this.getIndexAllInfo(shop.id)
          _this.checkCoupon()
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
            if (res.data.data.shopInfo.shopHomeConfig) {
              if (res.data.data.shopInfo.shopHomeConfig.videoPathList.length != 0) {
                let videoInfo = {}
                videoInfo.url = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].filePath
                videoInfo.cover = res.data.data.shopInfo.shopHomeConfig.videoPathList[0].coverImagePath
                wx.setStorageSync('videoInfo', videoInfo)
              }
            }
            _this.getShopInfo(res.data.data)
            _this.getIndexAllInfo(res.data.data.shopInfo.id)
            _this.checkCoupon()

          })
        }
      }

    }

    wx.removeStorageSync('shopId');
  },
  getAct: function (goodsId, shopId){
    var _this = this
    app.util.reqAsync('shop/goodsDetail', {
      goodsId: goodsId,
      shopId: shopId
    }).then((res) => {
      console.log(999)
      console.log(res)
      console.log(999)
      if (res.data.data) {
        res.data.data.startTime = app.util.formatActivityDate(res.data.data.startTime);
        res.data.data.endTime = app.util.formatActivityDate(res.data.data.endTime)

        this.setData({
          activityData: res.data.data
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
    context.fillText(this.data.activityData.shopName, 70 * scale, 108 * scale);//绘制店名
    context.drawImage('./img/zhuanfa_hdhb_up@2x.png', 300 * scale, 94 * scale, 19 * scale, 18 * scale);//绘制小图标

    context.setFillStyle('#000');
    context.setFontSize(17 * scale);
    context.fillText(this.data.activityData.goodsName, 25 * scale, 172 * scale);//绘制活动名
    context.drawImage('./img/zhuanfa_hdhb_right@2x.png', 305 * scale, 160 * scale, 9 * scale, 15 * scale);//绘制小图标

    context.setFillStyle('#f2f2f2');
    context.fillRect(25, 185, 290 * scale, 1 * scale)

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
      title: '[' + this.data.activityData.shopName + ']'  + this.data.activityData.descTitle,
      path: "pages/store/posterActivity/posterActivity?shopId=" + this.data.shopId + '&goodsId=' + this.data.goodsId,
      imageUrl: this.data.temp,
      success: function (res) {

      }
    }
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../../index/index?shopId=' + this.data.shopId
    })
  }
  
})