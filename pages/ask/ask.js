// pages/ask/ask.js
//获取应用实例
const app = getApp();
Page({
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.util.reqAsync('shop/getGoodsQuestions',{
      shopId: 808,//options.shopId
      goodsId: 2117,//options.goodsId
      pageNo:1,
      pageSize:20
    }).then((res) =>{
      var data = res.data.data
      console.log(data)
      for(var i=0;i<data.length;i++){
        var key ='time';
        var value = data[i].createTime.slice(0,11)
        data[i][key]=value
      }
      this.setData({
        askAcount:res.data.total,
        askData:data
      })
    })  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})