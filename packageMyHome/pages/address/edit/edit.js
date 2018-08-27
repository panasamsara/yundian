var app = getApp();
Page({
  data: {
    addressId: "",
    redClick:"",
    province:"北京市",
    city:"北京市",
    county:"西城区",
    person:"",
    tel:"",
    address:"",
    region: [],
    areaCodes: [],
    userId:""
  },
  onLoad: function (options) {
    var userId=wx.getStorageSync('scSysUser').id;
    var arr=[];
    arr.push(options.ProvinceName);
    arr.push(options.cityName);
    arr.push(options.areaName);
    this.setData({
      person: options.name,
      tel: options.phone,
      address: options.address,
      addressId: options.id,
      redClick: options.isDefault,
      region:arr,
      userId: userId
    });

  },
  getAddress: function(){
  },
  addressTap: function(){
    // 设置默认地址接口
    if (this.data.redClick==0){
      this.data.redClick=1
    }else{
      this.data.redClick = 0
    }
    this.setData({ redClick:this.data.redClick});
  },

  formSubmit: function (e) {
    var name = e.detail.value.username;
    var tel = e.detail.value.tel;
    var city = e.detail.value.city;
    var address = e.detail.value.address;
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (app.util.isEmpty(name)){
      wx.showToast({title: "请填写收货人姓名",icon: 'none'});
      return;
    } else if(app.util.isEmpty(tel)){
      wx.showToast({ title: "请填写手机号码", icon: 'none' });
      return;
    } else if (!myreg.test(tel)){
      wx.showToast({ title: "手机格式错误", icon: 'none' });
      return;
    } else if (app.util.isEmpty(city)) {
      wx.showToast({ title: "请选择所在地区", icon: 'none' });
      return;
    } else if (app.util.isEmpty(address)) {
      wx.showToast({ title: "请填写详细地址", icon: 'none' });
      return;
    }
    var isDefault;
    if (this.data.redClick==false){
      isDefault=0;
    }else{
      isDefault=1;
    }
    app.util.reqAsync('shop/recvAddrAddOrUpdate', {
      id: this.data.addressId,
      isDefault: isDefault,
      customerId: this.data.userId,
      phone:tel,
      name:name,
      address: address,
      provinceId: this.data.areaCodes[0],
      cityId: this.data.areaCodes[1],
      areaId: this.data.areaCodes[2],
    }).then((res) => {
      wx.showToast({
        title: "更新成功",
        icon: 'none'
      })
      wx.navigateBack(1);
    }).catch((err) => {
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
