import util from 'utils/util.js';

//app.js
App({
  // onLaunch: function () {
  //   // 展示本地存储能力
  //   var logs = wx.getStorageSync('logs') || []
  //   logs.unshift(Date.now())
  //   wx.setStorageSync('logs', logs)

  //   let that = this;
  //   //  获取页面的有关信息
  //   wx.getSystemInfo({
  //     success: function (res) {
  //       wx.setStorageSync('systemInfo', res)
  //       var ww = res.windowWidth;
  //       var hh = res.windowHeight;
  //       that.globalData.ww = ww;
  //       that.globalData.hh = hh;
  //     }
  //   });

  //   util.reqAsync('report/selectShopListByBackUserId', {
  //     backUserId: 10317
  //   }).then((res) => {
  //     // wx.showToast({
  //     //   title: JSON.stringify(res.data),
  //     //   icon: 'none'
  //     // })
  //   }).catch((err)=>{
  //     wx.showToast({
  //       title: '失败……',
  //       icon: 'none'
  //     })
  //   })

  //   // 登录
  //   // wx.login({
  //   //   success: res => {
  //   //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
  //   //   }
  //   // })
  //   util.checkWxLogin();
    
  //   // 获取用户信息
  //   wx.getSetting({
  //     success: res => {
  //       if (res.authSetting['scope.userInfo']) {
  //         // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
  //         wx.getUserInfo({
  //           success: res => {
  //             // 可以将 res 发送给后台解码出 unionId
  //             this.globalData.userInfo = res.userInfo

  //             // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
  //             // 所以此处加入 callback 以防止这种情况
  //             if (this.userInfoReadyCallback) {
  //               this.userInfoReadyCallback(res)
  //             }
  //           }
  //         })
  //       }
  //     }
  //   })
  //   //获取店铺信息
  //   util.reqAsync('shop/getShopHomePageInfo', {
  //     customerId: 1246,
  //     shopId: 957,
  //     pageNo: 1,
  //     pageSize: 10,
  //     interVersion: 1
  //   }).then((res) => {
  //     // this.setData({
  //     //   shopInformation: res.data.data
  //     // })
  //     this.globalData.shopInfo = res.data.data
  //     console.log(this.globalData.shopInfo)
  //     // ajax请求，可能会在 Page.onLoad 之后才返回,所以此处加入 callback 以防止这种情况
  //     if(this.shopInfoCallback){
  //       this.shopInfoCallback(res.data.data)
  //     }

  //   }).catch((err) => {
  //     wx.showToast({
  //       title: '失败……',
  //       icon: 'none'
  //     })
  //   })
  // },
  
  onLaunch: function(options){
    console.log('app.js onLaunch')
    wx.removeStorageSync('hostId')
    if (wx.getStorageSync('socketStatus')) {
      wx.closeSocket()
    }
    wx.removeStorageSync('socketStatus')
    
    let that = this;
    //  获取页面的有关信息,贝塞尔曲线会用到
    wx.getSystemInfo({
      success: function (res) {
        wx.setStorageSync('systemInfo', res)
        var ww = res.windowWidth;
        var hh = res.windowHeight;
        that.globalData.ww = ww;
        that.globalData.hh = hh;
      }
    });
  },
  bezier: function (pots, amount) {
    console.log(pots)
    var pot;
    var lines;
    var ret = [];
    var points;
    for (var i = 0; i <= amount; i++) {
      points = pots.slice(0);
      lines = [];
      while (pot = points.shift()) {
        if (points.length) {
          lines.push(pointLine([pot, points[0]], i / amount));
        } else if (lines.length > 1) {
          points = lines;
          lines = [];
        } else {
          break;
        }
      }
      ret.push(lines[0]);
    }
    function pointLine(points, rate) {
      var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
      var ret = [];
      pointA = points[0];//点击
      pointB = points[1];//中间
      xDistance = pointB.x - pointA.x;
      yDistance = pointB.y - pointA.y;
      pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
      tan = yDistance / xDistance;
      // console.log(tan);
      radian = Math.atan(tan);
      tmpPointDistance = pointDistance * rate;
      // console.log(tmpPointDistance);
      // console.log(rate);
      ret = {
        x: pointA.x + tmpPointDistance * Math.cos(radian),
        y: pointA.y + tmpPointDistance * Math.sin(radian)
      };
      return ret;
    }
    return {
      'bezier_points': ret
    };
  },
  util: util,
  globalData: {
    userInfo: null,
    shopInfo: null
  }
})