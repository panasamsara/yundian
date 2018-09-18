// packageIndex/pages/pinkGroup/pinkGroup.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataJson:{
      "sPagerows": "6,6,5,5", 
      "sStartpage": "1", 
      "userId": "", 
      "type": "", 
      "detailId": "" 
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    var userId = wx.getStorageSync('scSysUser').id
    var detailId ='dataJson.detailId';
    var userId ='dataJson.userId';
    var typeId = 'dataJson.type'
    this.setData({
      [detailId]: options.detailId,
      [userId]: userId,
      [typeId]: options.type
    })
  },
  detail:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('fans/getFansTeam', data).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          articleDetail: res.data.data
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  }
})