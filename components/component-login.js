// pages/component/component-login.js
var app = getApp()
import util from '../utils/util.js'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    loginTypeProperty: { // 属性名
      type: Number, // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: 0, // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) {
        // console.log(newVal, oldVal)
        // this.setData({
        //   loginType: newVal
        // })
      } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
    },
    // myProperty2: String // 简化的定义方式
  },

  /**
   * 组件的初始数据
   */
  data: {
    phoneModel: true,
    time: 0,
    msg: '获取验证码',
    phoneNum: '',
    yzCode: '',
    phoneType: 2,
    codebtn:false,
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    getCode: function () {
      
      // console.log(util)
      // console.log(app.util)
      var reg = /^1(3|4|5|7|8|9)\d{9}$/;
      if (!reg.test(this.data.phoneNum)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        this.setData({
          codebtn: false
        })
        return;
      }
      var _this = this;
      this.setData({
        codebtn: true
      })
      util.reqAsync('payBoot/wx/miniapp/captcha',
        {
          phone: _this.data.phoneNum,
          loginToken: wx.getStorageSync('loginToken')
        }).then((res) => {
          console.log(res)
          if (res.data.code == 1) {
            wx.showToast({
              title: '验证码发送成功',
              icon: 'none'
            })

            this.setData({
              time: 60,
              codebtn: false
              
            })
            var time = setInterval(function () {
              _this.setData({
                time: _this.data.time -= 1
              })
              if (_this.data.time <= 0) {
                _this.setData({
                  msg: '重新获取'
                })
                clearInterval(time)
              }
            }, 1000)
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        }).catch((err) => {
          console.log(err)
        })
    },
    phoneInput: function (e) {
      console.log(e)
      var num = e.detail.value;
      this.setData({
        phoneNum: e.detail.value
      })

    },
    codeInput: function (e) {
      this.setData({
        yzCode: e.detail.value
      })
    },
    wxsureLogin: function (e) {
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        wx.showLoading({ title: '登陆中，请稍候……', mask: true })
        // 根据手机号 登陆绑定/注册 智享城市app账户
        app.util.reqAsync('payBoot/wx/miniapp/phone', {
          loginToken: wx.getStorageSync('loginToken'),
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        })
          .then(res => {
            wx.hideLoading()
            console.log(res);
            if (res.data.code == 1) {
              wx.hideLoading()
              
              
              wx.setStorageSync('scSysUser', res.data.data.scSysUser);
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
              this.triggerEvent('resmevent', {}, { bubbles: true })
              
              // setTimeout(function () {
              //   wx.switchTab({
              //     url: '../index/index'
              //   })
              // }, 500)
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({ title: '登陆失败，请稍后再试……', icon: 'none' })
          })
      } else {
        console.log(e)
      }
    },
    getUserInfo: function (e) {
      if (e.detail.errMsg == 'getUserInfo:ok') {
        util.reqAsync('payBoot/wx/miniapp/info',{
          loginToken: wx.getStorageSync('loginToken'),
          signature: e.detail.signature,
          rawData: e.detail.rawData,
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        }).then(res=>{
          console.log(res)
          if(res.data.code==1){
            this.triggerEvent('resusermevent', { result: '获取用户信息成功' }, { bubbles: true })
          }else{
            wx.showToast({ title: res.data.msg, icon: 'none' })
          }
        })
        // this.setData({
        //   loginTypeProperty:0,
        // })
        // wx.setStorageSync('userInfo', e.detail.userInfo)
      }
      console.log(e)
      // if()
    },
    sureLogin: function () {
      // return;
      console.log(1111)
      var reg = /^1(3|4|5|7|8|9)\d{9}$/;
      if (!reg.test(this.data.phoneNum)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return;
      }
      if (!this.data.yzCode) {
        wx.showToast({
          title: '请输入验证码',
          icon: 'none'
        })
        return;
      }
      var _this = this;
      app.util.reqAsync('payBoot/wx/miniapp/checkCode', {
        phone: _this.data.phoneNum,
        loginToken: wx.getStorageSync('loginToken'),
        captcha: _this.data.yzCode,
      }).then((res) => {
        if (res.data.code == 1) {
          wx.setStorageSync('scSysUser', res.data.data.scSysUser);
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          this.triggerEvent('resmevent', {}, { bubbles: true })
          
         
          // setTimeout(function () {
          //   wx.switchTab({
          //     url: '../index/index'
          //   })
          // }, 500)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }).catch((err) => {

      })

    },
    // 手机号登录
    phoneLogin: function () {
      this.setData({
        phoneModel: true
      })
    },
    changeLogin: function () {
      if (this.data.phoneType == 1) {
        this.setData({
          phoneType: 2
        })
      } else if (this.data.phoneType == 2) {
        this.setData({
          phoneType: 1
        })
      }
    },
    closePhonemodel: function (e) {

      console.log(e)
      // e.stopPropagation()
      this.setData({
        loginTypeProperty: 0,
        msg: '获取验证码',
      })
    },
    stopMove:function(){
      
    },
    getPhoneNumber: function (e) {
      
      if (e.detail.errMsg == "getPhoneNumber:ok") {
        wx.showLoading({ title: '登陆中，请稍候……', mask: true })
        // 根据手机号 登陆绑定/注册 智享城市app账户
        
        app.util.reqAsync('payBoot/wx/miniapp/phone', {
          loginToken: wx.getStorageSync('loginToken'),
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv
        })
          .then(res => {
            // wx.hideLoading()
            
            
            console.log(res);
            
            
            if (res.data.code == 1) {
              
              console.log(res.data.code);
              wx.hideLoading()
              wx.setStorageSync('scSysUser', res.data.data.scSysUser);
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
              this.triggerEvent('resmevent', {}, { bubbles: true })
             
              // setTimeout(function () {
              //   wx.switchTab({
              //     url: '../index/index'
              //   })
              // }, 500)
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }
          })
          .catch((err) => {
            wx.hideLoading()
            wx.showToast({ title: '登陆失败，请稍后再试……', icon: 'none' })
          })
      } else {
        console.log(e)
      }
    },
    cancel: function () {
      this.setData({
        loginTypeProperty: 0//模态框状态
      })
    }

  }
})
