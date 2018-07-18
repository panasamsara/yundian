// pages/buyNow/buyNow.js
Page({

  data: {
    number: 1,
    balance:'',
    stockPrice:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');//店铺信息
    var goodsInfo = wx.getStorageSync('goodsInfo');//商品规格
    var user = wx.getStorageSync('scSysUser');//用户信息
    // console.log(options)
    console.log(goodsInfo)
    this.setData({
      
      shopId: shop.id,//店铺id
      shopName: goodsInfo.shopName,//店铺名
      customerId: user.id,//用户id
      balance: goodsInfo.stockBalance,//默认库存
      goodsName: goodsInfo. goodsName,//商品名称
      stockPrice: goodsInfo.price,//默认价格
      pictureUrl: goodsInfo.pictureUrl,//商品图片
      stockData: goodsInfo.stockList,//商品规格
      goodsType: goodsInfo.goodsType,//商品类型
      deliveryCalcContent: goodsInfo.deliveryCalcContent,//邮费
    })
  },
  chose(e){   //选择
     console.log(e)
    this.setData({
      num: e.currentTarget.dataset.id,
      id: e.currentTarget.dataset.dt.id,
      balance: e.currentTarget.dataset.dt.balance, //库存
      stockPrice: e.currentTarget.dataset.dt.stockPrice, //商品价格
      goodsId: e.currentTarget.dataset.dt.goodsId,   //商品id
      stockId: e.currentTarget.dataset.dt.id ,//stockIdid
      stockName: e.currentTarget.dataset.dt.stockName//规格名
    })
    console.log(this.data.id)
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
    var orderbuy = [];
    orderbuy.push({
      'id':this.data.id,
      'customerId': this.data.customerId,
      'shopId': this.data.shopId,
      'goodsId': this.data.goodsId,
      'stockId': this.data.stockId,
      'goodsName': this.data.goodsName,
      'goodsPrice': this.data.stockPrice,
      'stockPrice': this.data.stockPrice,
      'goodsImageUrl': this.data.pictureUrl,
      'stockName': this.data.stockName,
      'number': this.data.number,
      'goodsType': this.data.goodsType,
      'balance': '',
      'goodsIndex': 0,
      'remake': '',
      'deliveryCalcContent': this.data.deliveryCalcContent == null ? 0 : this.data.deliveryCalcContent,
      'actualPayment': this.data.stockPrice,//实付单价
      'goodsPic': this.data.pictureUrl,
      'unitPrice': this.data.stockPrice//单价

    });
    console.log(orderbuy)
    wx.setStorageSync('cart', orderbuy);
    wx.navigateTo({
      url: '/pages/orderBuy/orderBuy?shopId=' + this.data.shopId + '&shopName=' + this.data.shopName + '&totalMoney=' + (this.data.stockPrice) * (this.data.number),
    })
  }
})