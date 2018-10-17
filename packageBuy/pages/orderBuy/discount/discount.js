const app = getApp();

Page({
  data: {
    discount: [], //status 状态  0 删除，1 可用，2 不可用
    shopId: '',
    shopName: '',
    customerId: '',
    totalMoney: 0,
    isSend: 0 //配送方式
  },
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var ispay = wx.getStorageSync('isPay') || 0;
    var discount = wx.getStorageSync('discount');
    this.setData({
      discount: discount,
      shopId: options.shopId,
      shopName: options.shopName,
      customerId: options.customerId,
      totalMoney: options.totalMoney,
      isSend: options.isSend //0-快递  1-店内下单 2-自提
    })
    console.log(discount)
  },

  skip: function (e) {
    var name = e.currentTarget.dataset.name;
    var amount = e.currentTarget.dataset.amount;//满
    var amountMin = e.currentTarget.dataset.amountmin;//减
    var instruction = e.currentTarget.dataset.instruction;//描述
    var id = e.currentTarget.dataset.counid;//优惠券id
    var limtgood = e.currentTarget.dataset.limit;//指定商品的id
    wx.redirectTo({
      url: '../orderBuy?name=' + name + '&amountMin=' + amountMin + '&amount=' + amount + '&instruction=' + instruction + '&shopId=' + this.data.shopId + '&shopName=' +
        this.data.shopName + '&customerId=' + this.data.customerId + '&totalMoney=' + this.data.totalMoney + '&counid=' + id + '&limtgood=' + limtgood + '&isSend=' + this.data.isSend
    })
  },
  noSe: function (e) {
    //暂不使用
    wx.redirectTo({
      url: '../orderBuy?name=' + '' + '&amountMin=' + "" + '&amount=' + "" + '&instruction=' + "" + '&shopId=' + this.data.shopId + '&shopName=' +
        this.data.shopName + '&isSend=' + this.data.isSend + '&customerId=' + this.data.customerId + '&totalMoney=' + this.data.totalMoney + '&counid=' + ""
    })
  }


})