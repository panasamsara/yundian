// pages/buyNow/buyNow.js
Page({

  data: {
    number:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');//店铺信息
    var stock=wx.getStorageSync('stock');//商品规格
    var user = wx.getStorageSync('scSysUser');//用户信息
    console.log(options)
    console.log(stock)
    this.setData({
      groupBuyingPrice: options.groupBuyingPrice,
      pictureUrl: options.pictureUrl,
      stockBalance: options.stockBalance,
      stockData:stock,
      shopData:shop,
      userData: user
    })
  },
  chose(e){   //选择
    console.log(e)
    this.setData({
      num: e.currentTarget.dataset.id,
      stockBalance: e.currentTarget.dataset.dt.balance,
      groupBuyingPrice: e.currentTarget.dataset.dt.stockPrice
    })
  },
  minus(){  // 减
    if (this.data.number <= 1) {
      this.setData({
        number:1
      })
    }else{
      this.setData({
        number: this.data.number - 1
      })
    }
  },
  add(){    //加
    this.setData({
      number:this.data.number+1
    })
  },
  buyNow(){  //立即购买   
   wx.navigateTo({
     url: '/pages/orderBuy/orderBuy',
   })
  }
})