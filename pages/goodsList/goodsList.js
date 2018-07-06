//获取应用实例
const app = getApp();

Page({
  data:{
    tips:'当前分类下没有商品,以下是为您推荐的本店其他商品',
    arry:[                              
      ]
  },
  
  onLoad: function(){
    app.util.reqAsync('shop/getShopGoodsMore',{
      shopId:288,
      merchantId: 571
    }).then((res) => {
      this.setData({
        arry: res.data.data
      });
    })
  },
  clickTo: function (e) {
    var goodsId = e.currentTarget.dataset['goodsid']
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?shopId=' + 288 + '&goodsId=' + goodsId
    })
  }

})