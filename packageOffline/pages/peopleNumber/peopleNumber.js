//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showView: true,
    imageed:'img/con5.jpg',
    name:'',
    arr:[1,2,3,4,5,6,7],
    idx: 0,
    shopId: '',
    facilityId: '',
    toViewType: '',
    prompt:'',
    ongkd:'false',
    show: ""
  },
 

  goIndex: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var address = that.data.arr[index];
    console.log('你点击的是', address)
    this.setData({
      idx: index
    })
  },
  confirmd: function (e) {
    var that = this;
    var index = that.data.idx;
    console.log('人数---', this.data.arr[index])
    wx.setStorageSync('peopleNumber', this.data.arr[index])
    this.setData({
      prompt: !this.data.prompt
    })
  },

  onChangeShowState: function () {
    // var that = this;
    // that.setData({
    //   showView: (!that.data.showView),
    //   ongkd: !this.data.ongkd
    // })
      let arr=[];
      for(let i=1;i<=20;i++){
        arr.push(i)
      }
      this.setData({
        arr:arr,
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
        wx.redirectTo({
          url: '../proList/proList'
        })
      // } else {

      // }

    })
    
  },
  //跳转换桌扫码页面
  // choosee1: function () {
  //   // this.setData({
  //   //   prompt: !this.data.prompt
  //   // })
  //     var that = this;
  //     var show;
  //     wx.scanCode({
  //       success: (res) => {
  //         this.show = "--result:" + res.result + "--scanType:" + res.scanType + "--charSet:" + res.charSet + "--path:" + res.path;
  //         console.log(this.show)
  //         that.setData({
  //           show: this.show
  //         })
  //         console.log(res)
  //         if (!res.path){
  //           var result = "../../../packageOffline/pages/proList/proList?q="+ res.result
  //           wx.navigateTo({
  //             url: result
  //           })
  //         } 
  //         // else {
  //         //   var result = "../../../" + res.path + res.result
  //         //   wx.navigateTo({
  //         //     url: result
  //         //   })
  //         // }
  //       },
  //     })
  // },
  // 生命周期函数--监听页面加载
  onLoad: function (e) {
    showView: (e.showView == "true" ? true : false)
    this.setData({
      shop: wx.getStorageSync('shop')
    })

    let _this = this;
    var num = _this.data.arr
    console.log(_this)
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
