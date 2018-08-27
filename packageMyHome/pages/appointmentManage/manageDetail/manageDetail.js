var app=getApp();
Page({
  data: {
    appointmentId:"",
    orderList:[],
    items:[
      { value: '行程取消', name: '' },
      { value: '订单信息填写有误', name: '', checked: 'true' },
      { value: '只是试试没打算去', name: '' },
      { value: '其他原因', name: '' },
    ],
    callOff:"",
    model:false
  },
  onLoad: function (options) {
    this.setData({ appointmentId: options.id});
    this.getList();
    console.log(this.data.model);
  },
  getList: function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getBespokeById', {
      id: this.data.appointmentId
    }).then((res) => {
      wx.hideLoading();
      this.setData({ orderList: res.data.data});
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  callOff:function(){
    this.setData({ model: true });
  },
  off:function(){
    this.setData({ model: false });
  },
  sure:function(){
    if (app.util.isEmpty(this.data.callOff)){
      wx.showToast({ title: "请填写取消原因", icon: 'none' });
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/cancelBespoke', {
      ids: this.data.appointmentId,
      reason: this.data.callOff
    }).then((res) => {
      this.getList();
      this.setData({ model: false });
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  radioChange: function (e) {
    var value = e.detail.value;
    console.log(value);
    this.setData({ callOff: value});
  }
})