// packageIndex/pages/appointmentNew/device/device.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    key:'',
    deviceList: [{ name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }],
    dataList: [{ name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }, { name: '测试设备' }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  search:function(e){//搜索
    this.setData({
      deviceList:e.detail.newList
    })
    wx.hideLoading();
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