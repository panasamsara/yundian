// pages/myHome/myHome.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    items: [
      {
        icon: './images/dianneiorder.png',
        text: '店内订单',
        path: '/pages/myHome/shopOrder/shopOrder'
      },
      {
        icon: './images/yuyuemanage.png',
        text: '预约管理',
        path: '/pages/myHome/appointmentManage/appointmentManage'
      },
      {
        icon: './images/myaccount.png',
        text: '我的账户',
        path: '/pages/myHome/myAccount/myAccount'
      },
      {
        icon: './images/youhuidiscount .png',
        text: '优惠券',
        path: '/pages/myHome/discounts/discounts',
      },
      {
        icon: './images/dizhimanage.png',
        text: '地址管理',
        path: '/pages/myHome/address/index/list',
      },
      {
        icon: './images/myquestion.png',
        text: '我的问答',
        path: '/pages/myHome/myQuestion/myQuestion',
      },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      user: wx.getStorageSync('scSysUser')
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
  
  },
  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    if (app.util.isEmpty(path)){
      wx.showToast({ title: "正在开发中......", icon: 'none' });
    }else{
      wx.navigateTo({ url: path });
    }
  },
})