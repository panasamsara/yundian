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
        if (options && options.q) { /** 扫二维码 */
          var uri = decodeURIComponent(options.q)
          var p = app.util.getParams(uri)
          let activeType = p.activeType
          let shopId = p.shopId
          let goodsId = p.goodsId
          let actionId = p.actionId
          let signType = p.signType
          let routeTo = p.routeTo
          this.setData({
            activeType: p.activeType,
            shopId: p.shopId,
            goodsId: p.goodsId,
            actionId: p.actionId,
            signType: p.signType,
            routeTo: p.routeTo
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
          }

        } else if (options.scene) { /** 扫小程序码 */
          console.log(' 扫小程序码进入---------', options.scene)
          app.util.reqAsync('payBoot/wx/acode/params', {
            scene: options.scene,
          }).then((res) => {
           
            console.log('1111111111----',JSON.parse(res.data.data))
            let resJson = JSON.parse(res.data.data)
            let activeType = resJson.activeType 
            let shopId = resJson.shopId
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
            this.setData({
              shopId: resJson.shopId,
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
              shareFrom: resJson.shareFrom || ''
            })

            let paramData = {
              currentId: loginRes.id,
              shareShop: shopId,
              shareUser: 111,
              sourcePart: '1',
              shareType: shareType,
              businessId: goodsId
            }
            _this.record(paramData)

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
              } else { //九大
                wx.redirectTo({
                  url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
                })
              }
            } else if (shareType == 7) { //新人礼包 优惠券
              if (couponType == '06'){
                wx.redirectTo({
                  url: "../myHome/discounts/discountDetail/discountDetail?shopId=" + _this.data.shopId + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId + '&id=' + _this.data.couponId,
                })
              }else{
                wx.redirectTo({
                  url: "../../packageMyHome/pages/discountCenter/discountCenter?shopId=" + _this.data.shopId + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId + '&id=' + _this.data.couponId,
                })
              }
              
            } else if (shareType == 8) { //云店课堂
              wx.redirectTo({
                url: "../../packageIndex/pages/lessonDetail/lessonDetail?id=" + _this.data.courseId ,
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
      let activeType = p.activeType
      let shopId = p.shopId
      let goodsId = p.goodsId
      let actionId = p.actionId
      let signType = p.signType
      let routeTo = p.routeTo
      this.setData({
        activeType: p.activeType,
        shopId: p.shopId,
        goodsId: p.goodsId,
        actionId: p.actionId,
        signType: p.signType,
        routeTo: p.routeTo
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
      }

    } else if (_this.data.options.scene) { /** 扫小程序码 */
      console.log(' 扫小程序码进入---------', options.scene)
      app.util.reqAsync('payBoot/wx/acode/params', {
        scene: options.scene,
      }).then((res) => {

        console.log('1111111111----', JSON.parse(res.data.data))
        let resJson = JSON.parse(res.data.data)
        let activeType = resJson.activeType
        let shopId = resJson.shopId
        let goodsId = resJson.goodsId
        let goodsType = resJson.goodsType
        let actionId = resJson.actionId
        let signType = resJson.signType
        let shareType = resJson.shareType
        let share = resJson.share
        let couponType = resJson.couponType
        let couponLogId = resJson.couponLogId
        let courseId = resJson.courseId
        this.setData({
          activeType: resJson.activeType,
          shopId: resJson.shopId,
          goodsId: resJson.goodsId || 0,
          goodsType: resJson.goodsType || 0,
          actionId: resJson.actionId || 0,
          signType: resJson.signType || 0,
          shareType: resJson.shareType || 0,
          share: resJson.share || 0,
          couponType: resJson.couponType || 0,
          couponLogId: resJson.couponLogId || 0,
          courseId: resJson.courseId || 0,
        })

        let paramData = {
          currentId: loginRes.id,
          shareShop: shopId,
          shareUser: 111,
          sourcePart: '1',
          shareType: shareType,
          businessId: goodsId
        }
        _this.record(paramData)

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
          } else { //九大
            wx.redirectTo({
              url: "../store/posterActivity/posterActivity?shopId=" + _this.data.shopId + '&goodsId=' + _this.data.goodsId + '&actionId=' + _this.data.actionId + '&signType=' + _this.data.signType,
            })
          }
        } else if (shareType == 7) { //新人礼包 优惠券
          wx.redirectTo({
            url: "../myHome/discounts/discountDetail/discountDetail?shopId=" + _this.data.shopId + '&share=' + _this.data.share + '&couponType=' + _this.data.couponType + '&couponLogId=' + _this.data.couponLogId,
          })
        } else if (shareType == 8) { //云店课堂
          wx.redirectTo({
            url: "../../packageIndex/pages/lessonDetail/lessonDetail?id=" + _this.data.courseId,
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