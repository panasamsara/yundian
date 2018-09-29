import util from '../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    histories: [],
    loginType: 0,
    showBtn: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.loginType == 1) {
      // if (wx.getStorageSync('isAuth') == 'no'){
      //   this.setData({
      //     loginType: 2
      //   })
      // } else if (wx.getStorageSync('isAuth') == 'yes'){
      this.setData({
        loginType: 1
      })
      // }
    }
    if (options.share) {
      this.setData({
        showBtn: false,
		loginType: 1
      })
      // if (wx.getStorageSync('isAuth') == 'no') {
      //   this.setData({
      //     loginType: 2
      //   })
      // } else if (wx.getStorageSync('isAuth') == 'yes') {

      // }

    }
    // 若已有shopId，则跳转到首页
    // var shop = wx.getStorageSync('shop');
    // if(shop && shop.id) {
    //   wx.redirectTo({ 
    //     url: '/pages/index/index'
    //   })
    //   return;
    // }
    // 否则检查并列出历史纪录
    var histories = wx.getStorageSync('histories');
    this.setData({
      histories: histories
    })
    if (!histories || histories.length == 0) return;
    // 获取上一次的本地shopId
  },
  resmevent: function (e) {
    if (wx.getStorageSync('scSysUser')) {
      this.setData({
        loginType: 0
      })
      if (wx.getStorageSync('shopId')) {
        this.getShop(wx.getStorageSync('shopId'))
      }
    }
  },
  resusermevent: function (e) {
    // debugger
     // if (!wx.getStorageSync('scSysUser')) {
    //   this.setData({
    //     loginType: 1
    //   })
    // }
  },
  scanCode: function () {
    wx.scanCode({
      success: (res) => {

        wx.showLoading({
          title: '加载中',
        })
        var path = res.result;
        // 获取二维码链接中的参数
        let params = util.getParams(path)
        let shopId = params.shopId
        // var shopId = path.match(/\d+$/g)[0]
        var user = wx.getStorageSync('scSysUser');
        util.getShop(user.id, shopId).then(function (res) {
          console.log('扫码成功---------------', res)
          util.setHistories(res.data.data.shopInfo)
          wx.setStorage({
            key: "shopInformation",
            data: res.data.data,
            success: function () {

              wx.setStorage({
                key: "goodsInfos",
                data: res.data.data.goodsInfos,
                success: function () {

                  wx.setStorage({
                    key: "shop",
                    data: res.data.data.shopInfo,
                    success: function () {
                      wx.reLaunch({
                        url: '/pages/index/index'
                      })
                    }
                  })

                }
              })

            }
          })
        })
        // wx.setStorageSync('shop', { id: shopId });

        //判断是否注册
        // util.checkWxLogin().then((res) => {//判断是否已注册
        //   console.log(res)

        // });
      }
    })
  },
  getShop: function (shopId) {
    var user = wx.getStorageSync('scSysUser');

    util.getShop(user.id, shopId).then(function (res) {
      console.log('扫码成功---------------', res)
      util.setHistories(res.data.data.shopInfo)
      wx.setStorage({
        key: "shopInformation",
        data: res.data.data,
        success: function () {

          wx.setStorage({
            key: "goodsInfos",
            data: res.data.data.goodsInfos,
            success: function () {

              wx.setStorage({
                key: "shop",
                data: res.data.data.shopInfo,
                success: function () {
                  wx.reLaunch({
                    url: '/pages/index/index'
                  })
                }
              })

            }
          })

        }
      })
    })
  },
  // 跳转到对应商铺
  toShop: function (e) {
    let _this = this
    var user = wx.getStorageSync('scSysUser');
    var index = e.currentTarget.dataset.index;
    var shopId = this.data.histories[index].id

    util.getShop(user.id, shopId).then(function (res) {
      console.log('扫码成功---------------', res)
      util.setHistories(res.data.data.shopInfo)
      wx.setStorage({
        key: "shopInformation",
        data: res.data.data,
        success: function () {

          wx.setStorage({
            key: "goodsInfos",
            data: res.data.data.goodsInfos,
            success: function () {

              wx.setStorage({
                key: "shop",
                data: res.data.data.shopInfo,
                success: function () {
                  // wx.setStorageSync("shopId", this.data.histories[index].id)
                  wx.reLaunch({
                    url: '/pages/index/index?shopId' + _this.data.histories[index].id
                  })
                }
              })

            }
          })

        }
      })
    })

  }
})