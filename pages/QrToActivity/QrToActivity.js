// pages/QrToActivity/QrToActivity.js
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
      var uri = decodeURIComponent(e.q)
      var p = util.getParams(uri)
      let activeType = p.activeType
      let shopId = p.shopId
      let goodsId = p.goodsId
      let actionId = p.actionId
      let signType = p.signType

      if (activeType == 0){
        wx.redirectTo({
          url: "../store/activityInfo/activityInfo?shopId=" + shopId + '&goodsId=' + goodsId + '&actionId=' + actionId + '&signType=' + signType,
        })
      }else{
        wx.redirectTo({
          url: "../store/posterActivity/posterActivity?shopId=" + shopId + '&goodsId=' + goodsId + '&actionId=' + actionId + '&signType=' + signType,
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