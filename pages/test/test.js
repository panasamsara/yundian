// pages/test/test.js
import util from '../../utils/util.js';
Page({
  getPhoneNumber: function (e) {
    // 检查用户当前登陆状态
    wx.checkSession({
      success: function () {
        //session_key 未过期，并且在本生命周期一直有效
        console.log('session_key 未过期，并且在本生命周期一直有效');
        if (wx.getStorageSync('loginToken') && wx.getStorageSync('loginToken')){
          //发起网络请求 注册
          util.reqAsync('/payBoot/wx/miniapp/phone', {
            'loginToken': wx.getStorageSync('loginToken'),
            'encryptedData': e.detail.encryptedData,
            'iv': e.detail.iv
            // 'userAvatarUrl': 'test',
            // 'userNickName': 'test'
          }).then((res) => {
            if (res.data.code == 1) {
              console.log('获取手机号成功');
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
            console.log(res);
          }).catch((err) => {
            wx.showToast({
              title: '失败……',
              icon: 'none'
            })
          })
        }
        
      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        console.log('session_key 已经失效，需要重新执行登录流程');
        //重新登录
        this.doLogin();
      }
    });
    // wx.showModal({
    //   title: JSON.stringify(e.detail)
    // })
  },
  bindGetUserInfo: function (e) {
    wx.setStorageSync('userInfoRawData', e.detail.rawData);
    wx.setStorageSync('userInfoSignature', e.detail.signature);
    console.log(e);
    console.log(e.detail.userInfo)
  },
  doLogin: function(e){
    wx.login({
      success: function (res) {
        //console.log(res);
        var cmd = 'payBoot/wx/miniapp/login';   
        var data = {
          code:res.code
        };
        if (res.code) {
          //发起网络请求 登录
          util.reqAsync(cmd, {
            code: res.code
          }).then((res) => {
            if(res.data.code == 1){
              console.log('登录成功');
              wx.showToast({
                title: '自动登录成功',
                icon: 'none'
              })
              wx.setStorageSync('loginToken', res.data.data.loginToken);
              wx.setStorageSync('scSysUser', res.data.data.scSysUser);
            } else {
              console.log('登录失败')
            }
            
            console.log('loginToken', res.data.data.loginToken); 
            console.log('isReg', res.data.data.isReg);
            console.log(res.data.data);
          }).catch((err) => {
            wx.showToast({
              title: '失败……',
              icon: 'none'
            })
          })
        } else {
          console.log('登录失败！' + res.errMsg)
        }
      }
    });

  },
  bindTestCreateOrder:function(){
    var data = {
      requestBody:{
        body: '测试支付功能',
        //out_trade_no:'1',
        total_fee: 1,
        notify_url: 'https://wxapp.izxcs.com/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult', 
        spbill_create_ip: '127.0.0.1',   
        trade_type: 'JSAPI',
        openid: wx.getStorageSync('scSysUser').wxOpenId
      }
    };
    //发起网络请求 微信统一下单   
    util.reqAsync('payBoot/wx/pay/unifiedOrder', data).then((res) => {
      trade_type:
      console.log(res.data.data);

      //发起支付
      var wxResult = res.data.data.wxResult;
      var paySign = res.data.data.paySign;
      var timeStamp = res.data.data.timeStamp;

      wx.requestPayment({
        'timeStamp': timeStamp,
        'nonceStr': wxResult.nonceStr,
        'package': 'prepay_id=' + wxResult.prepayId,
        'signType': 'MD5',
        'paySign': paySign,
        'success': function (res) { },
        'fail': function (res) {
          console.log(res);
         },
        'complete': function (res) {
          console.log(res);
        }
      })

    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    });
  },


  /**
   * 页面的初始数据
   */
  data: {
  
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

    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              console.log('已授权')
              console.log(res)
            }
          })
        }else{
          console.log('未授权');
        }
      }
    });
    // 检查用户当前登陆状态
    wx.checkSession({
      success: function () {
        //session_key 未过期，并且在本生命周期一直有效
        console.log('session_key 未过期，并且在本生命周期一直有效');
        
      },
      fail: function () {
        // session_key 已经失效，需要重新执行登录流程
        console.log('session_key 已经失效，需要重新执行登录流程');
        //重新登录
        this.doLogin();
      }
    });
    
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