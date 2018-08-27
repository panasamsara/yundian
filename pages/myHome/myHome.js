// pages/myHome/myHome.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    shop:{},
    items: [
      {
        icon: './images/dianneiorder.png',
        text: '店内订单',
        path: '/pages/myHome/shopOrder/shopOrder'
      },
      {
        icon: './images/yuyuemanage.png',
        text: '预约管理',
        path: '../../packageMyHome/pages/appointmentManage/appointmentManage'
      },
      {
        icon: './images/myaccount.png',
        text: '我的账户',
        path: '../../packageMyHome/pages/myAccount/myAccount'
      },
      {
        icon: './images/youhuidiscount.png',
        text: '优惠券',
        path: '/pages/myHome/discounts/discounts',
      },
      {
        icon: './images/dizhimanage.png',
        text: '地址管理',
        path: '../../packageMyHome/pages/address/index/list',
      },
      {
        icon: './images/myquestion.png',
        text: '我的问答',
        path: '../../packageMyHome/pages/myQuestion/myQuestion',
      },
    ],
    shopList:[
      {
        icon: './images/daifukuan.png',
        text: '待付款',
        path: '../../packageMyHome/pages/order/order?index=1',
        num: ""
      },
      {
        icon: './images/daifahuo.png',
        text: '待发货',
        path: '../../packageMyHome/pages/order/order?index=2',
        num: ""
      },
      {
        icon: './images/daishouhuo.png',
        text: '待收货',
        path: '../../packageMyHome/pages/order/order?index=3',
        num: ""
      },
      {
        icon: './images/daipingjia.png',
        text: '待评价',
        path: '../../packageMyHome/pages/order/order?index=4',
        num: ""
      },
      // {
      //   icon: './images/shouhou.png',
      //   text: '售后',
      //   path: '/pages/myHome/order/order?index=4'
      // },
    ],
    flag:false, //手机系统是否是ios
    count:0
  },
  onLoad: function (options) {
    this.setData({
      count:0
    })
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop')
    console.log(user)
    this.setData({
      user: user,
      shop: shop
    });

    this.getlist();

    var that = this; //获取手机系统是否是ios
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        if (res.system.indexOf("iOS")>-1){ //苹果
          that.setData({
            flag: true
          })
        }else{
          that.setData({
            flag: false
          })
        }
        
      }
    })
  },
  onShow:function(){
    this.getlist();
    this.setData({
      count:0
    })
  },
  getlist:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyOnlineOrderComponentV2', { "customerId": this.data.user.id, "shopId": this.data.shop.id}).then((res) => {
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
    wx.navigateTo({ url: "../../packageMyHome/pages/order/order?index=0"});
  },
  backShop:function (e) {
    wx.navigateTo({ url: e.currentTarget.dataset.path });
  },
  appSkip:function(e){ //点击跳转到app下载页
      wx.navigateTo({ url: "/pages/myHome/downLoadIos/downLoadIos?flag="+this.data.flag });   
  },
  clickCount:function(){
    let count=this.data.count;
    count++;
    if (count == 9) {
      let _this = this;
      app.util.appLogin();
      setTimeout(function(){
        _this.onLoad();
      },1500)
    }
    this.setData({
      count:count
    })
  }
})