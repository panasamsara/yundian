var app = getApp()
// pages/reg/reg.js
Page({

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
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
 
  },
  getPhoneNumber: function (e) {
    if (e.detail.errMsg =="getPhoneNumber:ok"){
      // wx.showLoading({ title: '登陆中，请稍候……', mask: true })
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
            wx.setStorageSync('scSysUser', res.data.data.scSysUser);
          }
          wx.showToast({
            title: res.data.msg,
            icon:'none'
          })
          setTimeout(function () {
            wx.switchTab({
              url: '../index/index'
            })
          }, 500)
        })
        .catch((err) => {
          wx.hideLoading()
          wx.showToast({ title: '登陆失败，请稍后再试……', icon: 'none' })
        })
    }else{
      let _this=this;
      setTimeout(function(){
        _this.setData({
          modal: true
        })
      },500)
    }
  },
  cancel:function(){
    this.setData({
      modal:false
    })
  }
})