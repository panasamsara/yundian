// pages/myHome/myHome.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    shop: {},
    // share:false,
    items: [
      {
        icon: '../../images/dianneiorder.png',
        text: '店内订单',
        path: '/pages/myHome/shopOrder/shopOrder',
        style: "width:48rpx;height:44rpx;"
      },
      // {
      //   icon: '../../images/jifenduihuan.png',
      //   text: '积分兑换',
      //   path: '../../packageIntegral/pages/integralMall/integralMall',
      //   style: "width:56rpx;height:46rpx;"
      // },
      {
        icon: '../../images/youhuidiscount.png',
        text: '优惠券',
        path: '/pages/myHome/discounts/discounts',
        style: "width:57rpx;height:39rpx;"
      },
      {
        icon: '../../images/myquestion.png',
        text: '我的问答',
        path: '../../packageMyHome/pages/myQuestion/myQuestion',
        style: "width:47rpx;height:49rpx;"
      },
      {
        icon: '../../images/dizhimanage.png',
        text: '地址管理',
        path: '../../packageMyHome/pages/address/index/list',
        style: "width:58rpx;height:52rpx;"
      },
      {
        icon: '../../images/yundian_wode_kcdd.png',
        text: '课程订单',
        path: '../../packageIndex/pages/lessonOrder/lessonOrder',
        style: "width:54rpx;height:50rpx;"
      },
      {
        icon: '../../images/yundian_wode_xxls.png',
        text: '学习历史',
        path: '../../packageIndex/pages/lessonHistory/lessonHistory',
        style: "width:54rpx;height:50rpx;"
      },
      // {
      //   icon: './images/gengduo.png',
      //   text: '更多',
      //   path: '',
      //    style: "width:44rpx;height:44rpx;"
      // },
    ],
    shopList: [
      {
        icon: '../../images/daifukuan.png',
        text: '待付款',
        path: '../../packageMyHome/pages/order/order?index=1',
        num: "",
        style: "width:47rpx;height:40rpx;"
      },
      {
        icon: '../../images/daifahuo.png',
        text: '待发货',
        path: '../../packageMyHome/pages/order/order?index=2',
        num: "",
        style: "width:42rpx;height:40rpx;"
      },
      {
        icon: '../../images/daishouhuo.png',
        text: '待收货',
        path: '../../packageMyHome/pages/order/order?index=3',
        num: "",
        style: "width:43rpx;height:40rpx;"
      },
      {
        icon: '../../images/daipingjia.png',
        text: '待评价',
        path: '../../packageMyHome/pages/order/order?index=4',
        num: "",
        style: "width:45rpx;height:40rpx;"
      },
      // {
      //   icon: './images/shouhou.png',
      //   text: '售后',
      //   path: '/pages/myHome/order/order?index=4'
      // },
    ],
    flag: false, //手机系统是否是ios
    count: 0,
    animate: "",
    loginTyoe: 0
  },
  onLoad: function (options) {
    this.setData({
      count: 0,
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
        if (res.system.indexOf("iOS") > -1) { //苹果
          that.setData({
            flag: true
          })
        } else {
          that.setData({
            flag: false
          })
        }

      }
    })
  },
  onShow: function () {
    var that = this;
    this.getlist();
    this.setData({
      count: 0,
      animate: true
    })
    setTimeout(function () {
      that.setData({
        animate: false
      })
    }, 8000)
  },
  getlist: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyOnlineOrderComponentV2', { "customerId": this.data.user.id, "shopId": this.data.shop.id }).then((res) => {
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
  genxi: function () {
    this.setData({
      loginType: 2
    })
  },
  resusermevent: function () {
    var _this = this
    this.setData({
      loginType: 0
    })
    wx.removeStorageSync('scSysUser')
    app.util.checkWxLogin('check').then((loginRes) => {
      console.log('检测是否登录---------------------loginRes', loginRes)
      if (loginRes.status === 0) {
        this.setData({
          loginType: 1
        })
      } else {
        setTimeout(function () {
          _this.onLoad();
        }, 1500)
      }
    })
  },
  resmevent: function () {
    let _this = this;    
    this.setData({
      loginType: 0
    })
    setTimeout(function () {
      _this.onLoad();
    }, 1500)
  },
  navigateTo(e) {
    const path = e.currentTarget.dataset.path;
    if (app.util.isEmpty(path)) {
      wx.showToast({ title: "正在开发中......", icon: 'none' });
    } else {
      wx.navigateTo({ url: path });
    }
  },
  back: function () {
    wx.removeStorageSync('shop');
    wx.removeStorageSync('shopId');
    wx.redirectTo({ url: '/pages/scan/scan' });
  },
  backOrder: function (e) {
    wx.navigateTo({ url: "../../packageMyHome/pages/order/order?index=0" });
  },
  backShop: function (e) {
    wx.navigateTo({ url: e.currentTarget.dataset.path });
  },
  appSkip: function (e) { //点击跳转到app下载页
    wx.navigateTo({ url: "/pages/myHome/downLoadIos/downLoadIos?flag=" + this.data.flag });
  },
  clickCount: function () {
    let count = this.data.count;
    count++;
    if (count == 9) {
      let _this = this;
      // app.util.appLogin();

      wx.removeStorageSync('scSysUser')
      app.util.checkWxLogin('check').then((loginRes) => {
        console.log('检测是否登录---------------------loginRes', loginRes)
        if (loginRes.status === 0) {
          this.setData({
            loginType: 1
          })
        } else {
          setTimeout(function () {
            _this.onLoad();
          }, 1500)
        }
      })

    }
    this.setData({
      count: count
    })
  },
  skipAppoint: function () {
    wx.navigateTo({
      url: '../../packageMyHome/pages/appointmentManage/appointmentManage',
    })
  },
  shipAccount: function () {
    wx.navigateTo({
      url: '../../packageMyHome/pages/myAccount/myAccount',
    })
  }
})