// pages/myhome/address/add/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    redClick: 0,
    show:false,
    region: [],
    areaCodes: [],
    userId:""
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    this.setData({ userId: userId });
  },
  addressTap: function () {
    // 设置默认地址接口
    if (this.data.redClick == 0) {
      this.data.redClick = 1
    } else {
      this.data.redClick = 0
    }
    this.setData({ redClick: this.data.redClick });
  },
  formSubmit:function(e){
    var _this=this;
    var name = e.detail.value.username;
    var tel = e.detail.value.tel;
    var city = e.detail.value.city;
    var address = e.detail.value.address;
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    var userFormatExp = new RegExp("^[\u4e00-\u9fa5A-Za-z]+$");
    var remarkFormatExp = new RegExp("[~'!@#￥$%^&*()-+_=:]");
    if (app.util.isEmpty(name)) {
      wx.showToast({ title: "请填写收货人姓名", icon: 'none' });
      return;
    } else if (!app.util.isEmpty(name) && !userFormatExp.test(name)) {
      wx.showToast({
        title: '用户名只能输入中英文',
        icon: 'none'
      });
      return;
    }else if (app.util.isEmpty(tel)) {
      wx.showToast({ title: "请填写手机号码", icon: 'none' });
      return;
    } else if (!myreg.test(tel)) {
      wx.showToast({ title: "手机格式错误", icon: 'none' });
      return;
    } else if (app.util.isEmpty(city)) {
      wx.showToast({ title: "请选择所在地区", icon: 'none' });
      return;
    } else if (app.util.isEmpty(address)) {
      wx.showToast({ title: "请填写详细地址", icon: 'none' });
      return;
    } else if (!app.util.isEmpty(address) && remarkFormatExp.test(address)){
      wx.showToast({
        title: '详细地址地址只能输入中英文和数字',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/recvAddrAddOrUpdate', {
      name: name,
      customerId: this.data.userId,
      address: address, 
      phone: tel, 
      isDefault: this.data.redClick, 
      provinceId: this.data.areaCodes[0], 
      cityId: this.data.areaCodes[1], 
      areaId: this.data.areaCodes[2], 
    }).then((res) => {
      wx.hideLoading();
      wx.navigateBack(1)
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  bindRegionChange: function (e) {
    var names = e.detail.value;
    var areaCodes = app.util.area.getAreaCodeByNames(names[0], names[1], names[2]);
    this.setData({
      region: e.detail.value,
      areaCodes: areaCodes
    })
  }
})