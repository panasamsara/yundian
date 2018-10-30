// pages/QrToActivity/QrToActivity.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId:'',
    goodsId: '',
    signType: '',
    routeTo: '',
    actionId:'',
    activeType:'',
    loginType:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var _this =this
    app.util.checkWxLogin('share').then((loginRes) => {
      console.log('检测是否登录---------------------loginRes', loginRes)
      if (loginRes.status == 0) {
        _this.setData({
          loginType: 1
        })
      } else {
        
        _this.setData({
          options: options
        })
        //https://wxapp.izxcs.com/qrcode/activity/a?routeTo=3&posterId=5934&shareUser=81716&shareShop=288&shareType=6&businessId=5934&sourcePart=1
        if (options && options.q) { /** 扫二维码 */
          var uri = decodeURIComponent(options.q)
          var p = app.util.getParams(uri)
          let activeType = p.activeType || ''
          let shopId = p.shopId || p.shareShop
          let shareUser = p.shareUser || p.userId
          let goodsId = p.goodsId || p.businessId
          let goodsType = p.goodsType || 0
          let actionId = p.actionId || p.businessId
          let signType = p.signType || ''
          let routeTo = p.routeTo
          let shareType = p.shareType 
          this.setData({
            activeType: activeType,
            shopId: shopId,
            goodsId: goodsId,
            goodsType: goodsType,
            actionId: actionId,
            signType: signType,
            routeTo: routeTo,
            shareUser: shareUser,
            shareType: shareType
          })
          let paramData = {
            currentId: loginRes.id,
            shareShop: shopId,
            shareUser: shareUser,
            sourcePart: '1',
            shareType: shareType,
            businessId: goodsId
          }
          if (loginRes.id != shareUser) { //分享人不是本人，记录推荐关系
            _this.record(paramData)
          }

          if (wx.getStorageSync('scSysUser')) {
            app.util.getShop(wx.getStorageSync('scSysUser').id, _this.data.shopId).then((res) => {
              if (res.data.code == 1) {
                wx.setStorageSync('shop', res.data.data.shopInfo)
              }
            })
          }
          /** 参数 ：
           *  
           *  routeTo:
           *  0 活动 海报 {
           *    activeType： 0-普通活动 / 非0-九大活动
           *  }
           *  1 商品
           *  2 积分
           *  3 销售海报
           */
          if (_this.data.routeTo == 0) {
            if (_this.data.activeType == 0) {
              wx.redirectTo({
                url: "../store/activityInfo/activityInfo?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&goodsType=' + _this.data.goodsType,
              })
            } else {
              wx.redirectTo({
                url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&goodsType=' + _this.data.goodsType,
              })
            }
          } else if (_this.data.routeTo == 1) {
            wx.redirectTo({
              url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId  + '&goodsType=' + _this.data.goodsType
            })
          } else if (_this.data.routeTo == 2) {
            wx.redirectTo({
              url: "../../packageIntegral/pages/goodsdetail/goodsdetail?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&goodsType=' + _this.data.goodsType 
            })
          } else if (_this.data.routeTo == 3) {
            wx.redirectTo({
              url: "../../packageMyHome/pages/eventCard/eventCard?shopId=" + _this.data.shopId + '&businessId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&shareUser=' + _this.data.shareUser  + '&goodsType=' + _this.data.goodsType,
            })
          }

        } else if (options.scene) { /** 扫小程序码 */
          console.log(' 扫小程序码进入---------', options.scene)
          app.util.reqAsync('payBoot/wx/acode/params', {
            scene: options.scene,
          }).then((res) => {
           
            console.log('1111111111----',JSON.parse(res.data.data))
            let resJson = JSON.parse(res.data.data)
            let activeType = resJson.activeType 
            let shopId = resJson.shopId || resJson.shareShop
            let goodsId = resJson.goodsId
            let goodsType = resJson.goodsType
            let actionId = resJson.actionId
            let signType = resJson.signType
            let shareType = resJson.shareType
            let share = resJson.share
            let couponType = resJson.couponType
            let couponLogId = resJson.couponLogId
            let couponId = resJson.couponId
            let courseId = resJson.courseId
            let shareFrom = resJson.shareFrom
            let shareUser = resJson.shareUser            
            this.setData({
              shopId: shopId ,
              activeType: resJson.activeType || 0,
              goodsId: resJson.goodsId || 0,
              goodsType: resJson.goodsType || 0,
              actionId: resJson.actionId || 0,
              signType: resJson.signType || 0,
              shareType: resJson.shareType || 0,
              share: resJson.share || 0,
              couponType: resJson.couponType || '',
              couponLogId: resJson.couponLogId || 0,
              couponId: resJson.couponId || 0,
              courseId: resJson.courseId || 0,
              shareUser: resJson.shareUser || '', 
              shareFrom: resJson.shareFrom || '',
              })

            if (shareType == 7) {
              var businessId = couponId
            } else if (shareType == 8) {
              var businessId = courseId
            } else {
              var businessId = goodsId
            }
            var paramData = {
              currentId: wx.getStorageSync('scSysUser').id,
              shareShop: shopId,
              shareUser: shareUser,
              sourcePart: '1',
              shareType: shareType,
              businessId: businessId
            }
            if (loginRes.id != shareUser) { //分享人不是本人，记录推荐关系
              _this.record(paramData)
            }

            if (shareType <= 3) { //商品(1普通 2m秒杀 3拼团)
              wx.redirectTo({
                url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId
              })
            } else if (shareType == 4) { //积分商品
              wx.redirectTo({
                url: "../../packageIntegral/pages/goodsdetail/goodsdetail?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&goodsType=' + _this.data.goodsType
              })
            } else if (shareType == 5) { //邀请拼团
              wx.redirectTo({
                url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId
              })
            } else if (shareType == 6) { //活动
              if (_this.data.shareFrom == 'activityInfo') { //普通
                wx.redirectTo({
                  url: "../store/activityInfo/activityInfo?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
                })
              } else if (_this.data.shareFrom == 'eventCard') {//
                wx.redirectTo({
                  url: "../../packageMyHome/pages/eventCard/eventCard?shopId=" + _this.data.shopId + '&businessId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&shareUser=' + _this.data.shareUser,
                })
              } else { //九大
                wx.redirectTo({
                  url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
                })
              }
            } else if (shareType == 7) { //新人礼包 优惠券
              if (couponType == '06'){
                wx.redirectTo({
                  url: "../myHome/discounts/discountDetail/discountDetail?shopId=" + _this.data.shopId + '&shareShop=' + _this.data.shopId + '&businessId=' + businessId + '&shareType=' + _this.data.shareType + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId + '&id=' + _this.data.couponId + '&shareUser=' + _this.data.shareUser,
                })
              }else{
                wx.redirectTo({
                  url: "../../packageMyHome/pages/discountCenter/discountCenter?shopId=" + _this.data.shopId + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId + '&id=' + _this.data.couponId + '&shareUser=' + _this.data.shareUser,
                })
              }
              
            } else if (shareType == 8) { //云店课堂
              wx.redirectTo({
                url: "../../packageIndex/pages/lessonDetail/lessonDetail?id=" + _this.data.courseId + "&shopId=" + _this.data.shopId,
              })
            } 

          })
        }
      }
    })
    
  },
  // 记录推荐关系
  record: function(data){
    app.util.reqAsync('payBoot/wx/acode/record', data).then((res) => {

    })
  },
  resmevent:function(){
    this.setData({
      loginType:0
    })
    var _this =this
    if (_this.data.options && _this.data.options.q) { /** 扫二维码 */
      var uri = decodeURIComponent(options.q)
      var p = app.util.getParams(uri)
      let activeType = p.activeType || ''
      let shopId = p.shopId || p.shareShop
      let shareUser = p.shareUser || p.userId
      let goodsId = p.goodsId || p.businessId
      let goodsType = p.goodsType || 0
      let actionId = p.actionId || p.businessId
      let signType = p.signType || ''
      let routeTo = p.routeTo
      let shareType = p.shareType
      this.setData({
        activeType: activeType,
        shopId: shopId,
        goodsId: goodsId,
        goodsType: resJson.goodsType || 0,
        actionId: actionId,
        signType: signType,
        routeTo: routeTo,
        shareUser: shareUser,
        shareType: shareType
      })
      let paramData = {
        currentId: wx.getStorageSync('scSysUser').id,
        shareShop: shopId,
        shareUser: shareUser,
        sourcePart: '1',
        shareType: shareType,
        businessId: goodsId
      }
      if (wx.getStorageSync('scSysUser').id != shareUser) { //分享人不是本人，记录推荐关系
        _this.record(paramData)
      }

      app.util.getShop(wx.getStorageSync('scSysUser').id, _this.data.shopId).then((res) => {
        if (res.data.code == 1) {
          wx.setStorageSync('shop', res.data.data.shopInfo)
        }
      })
      /** 参数 ：
       *  
       *  routeTo:
       *  0 活动 海报 {
       *    activeType： 0-普通活动 / 非0-九大活动
       *  }
       *  1 商品
       *  2 积分
       *  
       */
      if (_this.data.routeTo == 0) {
        if (_this.data.activeType == 0) {
          wx.redirectTo({
            url: "../store/activityInfo/activityInfo?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&goodsType=' + _this.data.goodsType,
          })
        } else {
          wx.redirectTo({
            url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&goodsType=' + _this.data.goodsType,
          })
        }
      } else if (_this.data.routeTo == 1) {
        wx.redirectTo({
          url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&goodsType=' + _this.data.goodsType
        })
      } else if (_this.data.routeTo == 2) {
        wx.redirectTo({
          url: "../../packageIntegral/pages/goodsdetail/goodsdetail?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&goodsType=' + _this.data.goodsType 
        })
      } else if (_this.data.routeTo == 3) {
        wx.redirectTo({
          url: "../../packageMyHome/pages/eventCard/eventCard?shopId=" + _this.data.shopId + '&businessId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&shareUser=' + _this.data.shareUser+ '&goodsType=' + _this.data.goodsType,
        })
      }

    } else if (_this.data.options.scene) { /** 扫小程序码 */
      console.log(' 扫小程序码进入---------', options.scene)
      app.util.reqAsync('payBoot/wx/acode/params', {
        scene: options.scene,
      }).then((res) => {

        console.log('1111111111----', JSON.parse(res.data.data))
        let resJson = JSON.parse(res.data.data)
        let activeType = resJson.activeType
        let shopId = resJson.shopId || resJson.shareShop
        let goodsId = resJson.goodsId
        let goodsType = resJson.goodsType
        let actionId = resJson.actionId
        let signType = resJson.signType
        let shareType = resJson.shareType
        let share = resJson.share
        let couponType = resJson.couponType
        let couponLogId = resJson.couponLogId
        let courseId = resJson.courseId
        let shareFrom = resJson.shareFrom
        let shareUser=resJson.shareUser 
        
        this.setData({
          activeType: activeType,
          shopId: shopId,
          goodsId: resJson.goodsId || 0,
          goodsType: resJson.goodsType || 0,
          actionId: resJson.actionId || 0,
          signType: resJson.signType || 0,
          shareType: resJson.shareType || 0,
          share: resJson.share || 0,
          couponType: resJson.couponType || 0,
          couponLogId: resJson.couponLogId || 0,
          courseId: resJson.courseId || 0,
          shareFrom: resJson.shareFrom || '',
          shareUser: resJson.shareUser || '',
          
        })
        if (shareType ==7){
          var businessId = couponId
        } else if (shareType == 8){
          var businessId = courseId
        }else{
          var businessId = goodsId
        }
        var paramData = {
          currentId: wx.getStorageSync('scSysUser').id,
          shareShop: shopId,
          shareUser: shareUser,
          sourcePart: '1',
          shareType: shareType,
          businessId: businessId
        }
       
        if (wx.getStorageSync('scSysUser').id != shareUser) { //分享人不是本人，记录推荐关系
          _this.record(paramData)
        }

        if (shareType <= 3) { //商品(1普通 2m秒杀 3拼团)
          wx.redirectTo({
            url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId
          })
        } else if (shareType == 4) { //积分商品
          wx.redirectTo({
            url: "../../packageIntegral/pages/goodsdetail/goodsdetail?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&goodsType=' + _this.data.goodsType
          })
        } else if (shareType == 5) { //邀请拼团
          wx.redirectTo({
            url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId
          })
        } else if (shareType == 6) { //活动
          if (_this.data.shareFrom == 'activityInfo') { //普通
            wx.redirectTo({
              url: "../store/activityInfo/activityInfo?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
            })
          } else if (_this.data.shareFrom == 'eventCard') {//
            wx.redirectTo({
              url: "../../packageMyHome/pages/eventCard/eventCard?shopId=" + _this.data.shopId + '&businessId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType + '&shareUser=' + _this.data.shareUser,
            })
          } else { //九大
            wx.redirectTo({
              url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
            })
          }
        } else if (shareType == 7) { //新人礼包 优惠券
          if (couponType == '06') {
            wx.redirectTo({
              url: "../myHome/discounts/discountDetail/discountDetail?shopId=" + _this.data.shopId + '&shareShop=' + _this.data.shopId + '&businessId=' + businessId + '&shareType=' + _this.data.shareType + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId + '&id=' + _this.data.couponId + '&shareUser=' + _this.data.shareUser,
            })
          } else {
            wx.redirectTo({
              url: "../../packageMyHome/pages/discountCenter/discountCenter?shopId=" + _this.data.shopId + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId + '&id=' + _this.data.couponId + '&shareUser=' + _this.data.shareUser,
            })
          }
        } else if (shareType == 8) { //云店课堂
          wx.redirectTo({
            url: "../../packageIndex/pages/lessonDetail/lessonDetail?id=" + _this.data.courseId + "&shopId=" + _this.data.shopId,
          })
        } 

      })
    }
  /*  if (_this.data.routeTo == 0) {
      if (_this.data.activeType == 0) {
        wx.redirectTo({
          url: "../store/activityInfo/activityInfo?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
        })
      } else {
        wx.redirectTo({
          url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
        })
      }
    } else if (_this.data.routeTo == 1) {
      wx.redirectTo({
        url: "../goodsDetial/goodsDetial?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId
        
      })
    } else if (_this.data.routeTo == 2) {
      wx.redirectTo({
        url: "../../packageIntegral/pages/goodsdetail/goodsdetail?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId
      })
    }*/

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


})