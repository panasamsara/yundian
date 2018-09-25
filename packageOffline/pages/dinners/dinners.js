//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showView: true,
    list: [
      { 'num': '1' },
      { 'num': '2' },
      { 'num': '3' },
      { 'num': '4' },
      { 'num': '5' },
      { 'num': '6' },
      { 'num': '7' },
      { 'num': '8' },
      { 'num': '9' },
      { 'num': '10' },
      { 'num': '11' },
      { 'num': '12' },
      { 'num': '13' },
      { 'num': '14' },
      { 'num': '15' },
      { 'num': '16' },
      { 'num': '17' },
      { 'num': '18' },
      { 'num': '19' },
      { 'num': '20' }
    ],
    idx: 0,
    shopId: '',
    facilityId: '',
    toViewType: ''
  },
  goIndex: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    console.log('每个index', index)
    console.log(that.data.list)
    this.setData({
      idx: index
    })
  },
  confirmd: function (e) {
    var that = this;
    var list = that.__viewData__.idx;
    console.log(list)
  },

  onLoad: function (options) {
    // 生命周期函数--监听页面加载
    showView: (options.showView == "true" ? true : false)
  },
  onChangeShowState: function () {
    var that = this;
    that.setData({
      showView: (!that.data.showView)
    })
  },

  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

// 生命周期函数--监听页面加载
  onLoad: function (e) {
    console.log(e)
    let _this = this
    let systemInfo = wx.getStorageSync('systemInfo');

    if (e && e.q) {
      var uri = decodeURIComponent(e.q)
      var p = util.getParams(uri)
      let shopId = p.s
      let facilityId = p.f00
      let underline = p.o
      wx.setStorageSync('shopId', shopId);
      wx.setStorageSync("facilityId", facilityId);
      console.log(underline)
      this.setData({
        shopId: shopId,
        facilityId: facilityId,
        underline: underline
      })
      //重新扫码 跳转页面
      util.checkWxLogin('offline').then((loginRes) => {
        app.util.reqAsync('foodBoot/findFoodPresale', {
          shopId: wx.getStorageSync('shop').id,
          userId: wx.getStorageSync('hostId'),
          userId: loginRes.id,
          // presaleId: "", //订单id
          facilityId: wx.getStorageSync('facilityId')
        }).then((res) => {
          //正餐
          if (res.data.data == null && res.data.data.orderStatus == 2) {
            setTimeout(function () {
              wx.navigateTo({
                url: '../../../pages/myHome/shopOrder/orderDetail/orderDetail?activeIndex=0&shopId=' + _this.data.shopId + '&userId=' + _this.data.userId + '&presaleId=' + _this.data.presaleId + '&facilityId=' + _this.data.facilityId + '&merchantId=' + _this.data.merchantId + '&selectMember=1'
              })
            }, 200)
          }
        })
      })
    }
    //  else {
    //   if (e && e.shopId) {
    //     wx.setStorageSync('shopId', e.shopId);
    //     this.setData({
    //       shopId: e.shopId
    //     })
    //   }
    // }

  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
