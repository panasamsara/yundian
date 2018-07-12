var app = getApp();
var shop = wx.getStorageSync('shop');
Page({
  data: {
    arrayName: [],
    arrayId: [],
    fansAccount:[],
    memsYuanAccount:[],
    accountList:[],
    index:""
  },
  onLoad: function(options) {
    // 获取缓存的shopOId和shopName存入数组
    this.getShop();
    this.getCard(shop.id);
  },
  bindPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log(this.data.index);
    this.setData({
      index: e.detail.value
    });
    var shopIdActive = this.data.arrayId[this.data.index];
    this.getCard(shopIdActive);
  },
  getCard: function(shopIdActive) {
    //获取店铺id
    wx.showLoading({
      title: '加载中',
    })
    var newdata=[];
    app.util.reqAsync('member/getMemberCard', {
      "memberId": shopIdActive
    }).then((res) => {
      this.setData({
        accountList: []
      })
      if(res.data.data){
        //截取粉账户的时间
        res.data.data.fans.periodTime = res.data.data.fans.periodTime.substring(0, 10);
        res.data.data.fans.balance = app.util.formatMoney(res.data.data.fans.balance, 2); 
        res.data.data.fans.finance = app.util.formatMoney(res.data.data.fans.finance, 2); 
        console.log();
        newdata.push(res.data.data);
        this.setData({
          accountList: newdata
        })
      }else{
      }
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  getShop: function() {
    //获取店铺名称
    wx.showLoading({
      title: '加载中',
    })
    var shopName = [];
    var shopId = [];
    app.util.reqAsync('member/getShopInfosByUserId', {
      "userId": "573"
    }).then((res) => {
      res.data.data.forEach(function(item, index) {
        shopName.push(item.shopName);
        shopId.push(item.memberId);
      })
      //将缓存存入选择店铺的数组中
      shopName.unshift(shop.shopName);
      shopId.unshift(shop.id);
      this.setData({
        arrayName: shopName,
        arrayId: shopId
      });
      wx.hideLoading()
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  }
})