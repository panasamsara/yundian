//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showView: true,
    imageed:'img/con5.jpg',
    name:'',
    list: [
      { num: '1' },
      { num: '2' },
      { num: '3' },
      { num: '4' },
      { num: '5' },
      { num: '6' },
      { num: '7' },
      { num: '8' },
      { num: '9' },
      { num: '10' },
      { num: '11' },
      { num: '12' },
      { num: '13' },
      { num: '14' },
      { num: '15' },
      { num: '16' },
      { num: '17' },
      { num: '18' },
      { num: '19' },
      { num: '20' }
    ],
    idx: 0,
    shopId: '',
    facilityId: '',
    toViewType: '',
    prompt:'',
    ongkd:'false'
  },
 

  goIndex: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var address = that.data.list[index].num;
    console.log('你点击的是', address)
   
    // for (var i in ongd) {
    //   console.log(ongd[i].num);
    // }
    this.setData({
      idx: index
    })
  },
  confirmd: function (e) {
    var that = this;
    var index = that.__viewData__.idx;
    console.log('人数---',this.data.list[index].num)
    wx.setStorageSync('peopleNumber', this.data.list[index].num)
    this.setData({
      prompt: !this.data.prompt
    })
  },

  onChangeShowState: function () {
    var that = this;
    that.setData({
      showView: (!that.data.showView),
      ongkd: !this.data.ongkd
    })
  },

  //事件处理函数
  choosee2: function () {
    this.setData({
      prompt: !this.data.prompt
    })
    // 开台（设备占用）
    app.util.reqAsync('foodBoot/updateDeviceOccupy', {
      deviceId: wx.getStorageSync('facilityId'),
      deviceTime: app.util.formatTime(new Date()),
      deviceType: 1,
      waiterId: '',
      peopleNumber: 1,
      startTime: app.util.formatTime(new Date()),
    }).then((res) => {
      // if (res.data.code == 1) {
        wx.navigateTo({
          url: '../proList/proList'
        })
      // } else {

      // }

    })
    
  },
  //跳转换桌扫码页面
  choosee1: function () {
    // this.setData({
    //   prompt: !this.data.prompt
    // })
    
    wx.navigateBack({
      delta: -1
    })
    console.log(123)
  },
  // 生命周期函数--监听页面加载
  onLoad: function (e) {
    showView: (e.showView == "true" ? true : false)
    this.setData({
      shop: wx.getStorageSync('shop')
    })

    let _this = this;
    var num = _this.__viewData__.list[7]
    console.log(num)
    this.setData({
      num:''
    })
    let systemInfo = wx.getStorageSync('systemInfo');

    if (e && e.q) {
      var uri = decodeURIComponent(e.q)
      var p = app.util.getParams(uri)
      let shopId = p.s
      let facilityId = p.f
      let underline = p.o
      wx.setStorageSync('shopId', shopId);
      wx.setStorageSync("facilityId", facilityId);
      this.setData({
        shopId: shopId,
        facilityId: facilityId,
        underline: underline
      })
      //重新扫码 跳转页面
      app.util.checkWxLogin('offline').then((loginRes) => {
        app.util.reqAsync('foodBoot/findFoodPresale', {
          shopId: wx.getStorageSync('shop').id,
          userId: wx.getStorageSync('hostId'),
          userId: loginRes.id,
          // presaleId: "", //订单id
          facilityId: wx.getStorageSync('facilityId')
        }).then((res) => {
          //正餐
          if (res.data.data == null && res.data.data.orderStatus == 1) {
            setTimeout(function () {
              this.setData({
                prompt: !this.data.prompt
              })
            }, 200)
          } else {
            setTimeout(function () {
              this.setData({
                prompt: !this.data.prompt
              })
            })
          }
        })
      })
    }
     else {
      if (e && e.shopId) {
        wx.setStorageSync('shopId', e.shopId);
        this.setData({
          shopId: e.shopId
        })
      }
    }

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
