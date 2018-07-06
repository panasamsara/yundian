var app = getApp();
Page({
  data: {
    address:[]
  },
  onLoad: function (options) {
    this.getAddress();
  },
  onShow: function () {
    this.getAddress();
  },
  radioChange: function(e) {
    // 点击单选框设置默认地址
    var nowId = e.detail.value; 
    app.util.reqAsync('shop/recvAddrAddOrUpdate', {
      id: nowId,
      isDefault: 0,
      customerId: 1870,
    }).then((res) => {
      this.getAddress();
      wx.showToast({
        title: "更新默认地址成功",
        icon: 'none'
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })

  },
  deleteAddress: function(e){
    // 点击删除地址接口
    var _this=this;
    var nowId = e.currentTarget.dataset.id;
    wx.showModal({
      title: "删除",
      content: "确定删除当前地址吗？",
      showCancel: true,
      confirmText: "确定",
      success: function (res) {
        if (res.confirm) {
          app.util.reqAsync('shop/recvAddrDel', {
            id: nowId
          }).then((res) => {
            wx.showLoading({
              title: '加载中',
            })
            setTimeout(function () {
              wx.hideLoading()
            }, 1000)
            _this.getAddress();
          }).catch((err) => {
            wx.hideLoading();
            wx.showToast({
              title: '失败……',
              icon: 'none'
            })
          })
        } else if (res.cancel) {
        }
      }
    })
  },
  toAddressAdd: function(){
    var path ="/pages/myHome/address/add/index";
    wx.navigateTo({ url: path })
  },
  aditAddress: function(e){
    console.log(e);
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.name;
    var phone = e.currentTarget.dataset.phone;
    var address = e.currentTarget.dataset.address;
    var isdefault = e.currentTarget.dataset.default;
    var ProvinceName = e.currentTarget.dataset.provincename;
    var cityName = e.currentTarget.dataset.cityname;
    var areaName = e.currentTarget.dataset.areaname;
    var path = "/pages/myHome/address/edit/edit?id="+id+"&name="+name+"&phone="+phone+"&address="+address+"&isDefault="+isdefault+"&ProvinceName="+ProvinceName+"&cityName="+cityName+"&areaName="+areaName;
    wx.navigateTo({ url: path});
  },
  getAddress: function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/recvAddrList', {
      customerId: 1870
    }).then((res) => {
      wx.hideLoading();
      res.data.data.forEach(function(i, v){
        i.areaName = app.util.area.getAreaNameByCode(i.areaId);
        i.cityName = app.util.area.getAreaNameByCode(i.cityId);
        i.ProvinceName = app.util.area.getAreaNameByCode(i.provinceId);
      })
      this.setData({address:res.data.data});
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  }
})