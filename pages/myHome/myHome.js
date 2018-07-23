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
        icon: './images/youhuidiscount.png',
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
    shopList:[
      {
        icon: './images/daifukuan.png',
        text: '待付款',
        path: '/pages/myHome/order/order?index=1',
        num: ""
      },
      {
        icon: './images/daifahuo.png',
        text: '待发货',
        path: '/pages/myHome/order/order?index=2',
        num: ""
      },
      {
        icon: './images/daishouhuo.png',
        text: '待收货',
        path: '/pages/myHome/order/order?index=3',
        num: ""
      },
      {
        icon: './images/daipingjia.png',
        text: '待评价',
        path: '/pages/myHome/order/order?index=4',
        num: ""
      },
      // {
      //   icon: './images/shouhou.png',
      //   text: '售后',
      //   path: '/pages/myHome/order/order?index=4'
      // },
    ],
  },
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser')
    this.setData({
      user: user
    });

    this.getlist();
  },
  onShow:function(){
    this.getlist();
  },
  getlist:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyOnlineOrderComponentV2', { "customerId": this.data.user.id }).then((res) => {
      this.setData({
        "shopList[0].num": res.data.data.waitingOfPayNum,
        "shopList[1].num": res.data.data.waitingOfSendNum,
        "shopList[2].num": res.data.data.waitingOfReciveNum,
        "shopList[3].num": res.data.data.waitingOfCommentNum
      })
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    if (app.util.isEmpty(path)){
      wx.showToast({ title: "正在开发中......", icon: 'none' });
    }else{
      wx.navigateTo({ url: path });
    }
  },
  back:function(){
    wx.removeStorageSync('shop');
    wx.redirectTo({ url: '/pages/scan/scan' });
  },
  backOrder: function (e) {
    wx.navigateTo({ url: "/pages/myHome/order/order?index=0"});
  },
  backShop:function (e) {
    wx.navigateTo({ url: e.currentTarget.dataset.path });
  },
})