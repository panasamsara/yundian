// packageIndex/pages/lessonHistory/lessonHistory.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arr: new Array(50).fill({})
  },

  timeAge: function (time) {
    let duration = new Date().getTime() - new Date(time.replace(/-/g, '/')).getTime();
    let days = duration / 86400000;
    if (days < 1) return '今天';
    if (days < 2) return '昨天';
    if (days < 3) return '三天前';
    if (days < 7) return '一周前';
    if (days < 30) return '一月前';
    if (days < 180) return '半年前';
    if (days < 365) return '一年前';
    if (days < 730) return '两年前';
    if (days < 1095) return '三年前';
    return '很久前';
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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