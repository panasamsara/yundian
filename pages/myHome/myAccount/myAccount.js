var app = getApp();
Page({
  data: {
    arrayName: [],
    shopmemberId: [],
    arrayImg:[],
    fansAccount:[],
    memsYuanAccount:[],
    accountList:[],
    index:"",
    indexImg:0,
    shop:{},
    shopId:[]
  },
  onLoad: function(options) {
    var shop = wx.getStorageSync('shop');
    var user = wx.getStorageSync('scSysUser');
    this.setData({
      shop: shop
    })
    // 获取缓存的shopOId和shopName存入数组
    //获取店铺名称
    wx.showLoading({
      title: '加载中',
    })
    var shopName = [];
    var shopmemberId = [];
    var shopImg = [];
    var shopId = [];
    app.util.reqAsync('member/getShopInfosByUserId', {
      "userId": user.id
    }).then((res) => {
      // 判断是否返回店铺列表
      if (res.data.data != null){
        res.data.data.forEach(function (item, index) {
          shopName.push(item.shopName);
          shopmemberId.push(item.memberId);
          shopImg.push(item.backImage);
          shopId.push(item.shopId);
        })
        this.setData({
          shopId: shopId
        });
        // 判断当前id是否存在列表中,存在就显示它的卡，不存在就直接为空
        //不存在
        if (shopId.indexOf(this.data.shop.id) == -1) {
          //将缓存存入选择店铺的数组中
          shopName.unshift(this.data.shop.shopName);
          // 不存在列表中时必定没有卡信息,就把0加入到数组最前面
          shopmemberId.unshift(0);
          shopImg.unshift(this.data.shop.bgImage);
          this.setData({
            arrayName: shopName,
            shopmemberId: shopmemberId,
            arrayImg: shopImg,
            accountList: []
          });
        } else {
          var newIndex = shopId.indexOf(this.data.shop.id);
          //删除当前数组存在的shopName,shopmemberId,shopImg,并移到数组的第一位
          var name = shopName[newIndex];
          var memberId = shopmemberId[newIndex];
          var img = shopImg[newIndex];
          // 首先获取存在卡的数据
          this.getCard(memberId);
          // //删除数组里面的
          shopName.splice(newIndex, 1);
          shopName.unshift(name);
          shopmemberId.splice(newIndex, 1);
          shopmemberId.unshift(memberId);
          shopImg.splice(newIndex, 1);
          shopImg.unshift(img);
          this.setData({
            arrayName: shopName,
            shopmemberId: shopmemberId,
            arrayImg: shopImg,
          });
        }
      }else{
        shopName.unshift(this.data.shop.shopName);
        // 不存在列表中时必定没有卡信息,就把0加入到数组最前面
        shopmemberId.unshift(0);
        shopImg.unshift(this.data.shop.bgImage);
        this.setData({
          arrayName: shopName,
          shopmemberId: shopmemberId,
          arrayImg: shopImg,
          accountList: []
        });
      }
     
      wx.hideLoading()
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })

  },
  bindPickerChange: function(e) {
    // console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
      indexImg:1
    });
    var shopIdActive = this.data.shopmemberId[this.data.index];
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
        if (res.data.data.fans){
          res.data.data.fans.periodTime = res.data.data.fans.periodTime.substring(0, 10);
          res.data.data.fans.balance = app.util.formatMoney(res.data.data.fans.balance, 2);
          res.data.data.fans.finance = app.util.formatMoney(res.data.data.fans.finance, 2); 
        }
        newdata.push(res.data.data);
        this.setData({
          accountList: newdata
        })
        console.log(res.data.data);
        console.log(this.data.accountList);
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
    
  }
})