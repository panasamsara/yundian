// pages/QrToActivity/QrToActivity.js

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options && options.q) {
      var uri = decodeURIComponent(options.q)
      var p = app.util.getParams(uri)
      let activeType = p.activeType
      let shopId = p.shopId
      let goodsId = p.goodsId
      let actionId = p.actionId
      let signType = p.signType
      let routeTo = p.routeTo

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
      if (routeTo == 0){
        if (activeType == 0) {
          wx.redirectTo({
            url: "../store/activityInfo/activityInfo?shopId=" + shopId + '&goodsId=' + goodsId + '&actionId=' + actionId + '&signType=' + signType,
          })
        } else  {
          wx.redirectTo({
            url: "../store/posterActivity/posterActivity?shopId=" + shopId + '&goodsId=' + goodsId + '&actionId=' + actionId + '&signType=' + signType,
          })
        }
      } else if (routeTo == 1){
        wx.redirectTo({
          url: "../goodsDetial/goodsDetial?shopId=" + shopId + '&goodsId=' + goodsId
        })
      } else if (routeTo == 2) {
        wx.redirectTo({
          url: "../../packageIntegral/pages/goodsdetail/goodsdetail?shopId=" + shopId + '&goodsId=' + goodsId
        })
      }
    }
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