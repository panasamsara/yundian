var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //轮播专用开始
    indicatorDots: "",
    indicatorColor: "rgba(255, 255, 255, .3)",//滑动圆点颜色
    indicatorActiveColor: "rgba(255, 255, 255, 1)", //当前圆点颜色
    vertical: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    //轮播专用结束
    cardList: [],
    user:"",
    shop:"",
    expenditure:[],
    leaveGoods:[],//留店商品
    activeIndex:0,
    hiddenKas: false,
    hiddenGoods: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    wx.setNavigationBarTitle({
      title: shop.shopName,
    })
    this.setData({
      user: user,
      shop: shop
    });
    this.getAccountByUser();
    this.getFansAccountByUser();
    this.getCardByUser();
  },
  onShow: function () {

  },
  onReachBottom: function () {

  },
  getAccountByUser: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('member/getAccountByUser', { "userId": this.data.user.id, "shopId": this.data.shop.id  }).then((res) => {
      var data = res.data.data;
      if (data!=null){
        for (var i = 0; i < data.length; i++) {
          data[i].principal = app.util.formatMoney(data[i].principal, 2);
        }
        //缓存memberId到缓存里
        wx.setStorageSync("shopMemberId", data[0].memberId);
        //放在这里请求主要是为了存储shopMemberId后再请求
        this.leaveGoods();
        if (data.length > 0 && data.length == 1) {
          this.setData({ indicatorDots: false });
        }else{
          this.setData({ indicatorDots: true });
        }
      }
      this.setData({ cardList: res.data.data});
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  getFansAccountByUser: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('member/getFansAccountByUser', { "userId": this.data.user.id, "shopId": this.data.shop.id }).then((res) => {
      var data = res.data.data;
      if (data.length!=0){
        data[0].finance = app.util.formatMoney(data[0].finance, 2);
      }
      this.setData({ expenditure: res.data.data});
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  getCardByUser: function () {
    wx.showLoading({
      title: '加载中',
    })
    // 1 次数 2 时长 5终身
    app.util.reqAsync('member/getCardByUser', { "userId": this.data.user.id, "shopId": this.data.shop.id }).then((res) => {
      if(res.data.code==1){
        var data = res.data.data;
        // 去除后台返回值的截止
        if (data && data.card.length!=0){
          for (var i = 0; i < data.card.length; i++) {
            if (data.card[i].remainNum.indexOf("截止") != -1) {
              data.card[i].remainNum = data.card[i].remainNum.replace("截止", "");
            }
          }
        }
        if (data && data.package.length != 0) {
          for (var i = 0; i < data.package.length; i++) {
            if (data.package[i].remainNum.indexOf("截止") != -1) {
              data.package[i].remainNum = data.package[i].remainNum.replace("截止", "");
            }
          }
        }
        
        var totalCard = [];
        if (data.card.length != 0 && data.package.length == 0) {
          var totalCard1 = totalCard.concat(res.data.data.card);
          this.setData({ getCardByUser: totalCard1 });
        } else if (data.card.length == 0 && data.package.length != 0) {
          console.log(111111111111)
          var totalCard1 = totalCard.concat(res.data.data.package);
          this.setData({ getCardByUser: totalCard1 });
        } else if (data.card.length != 0 && data.package.length != 0) {
          var totalCard1 = totalCard.concat(res.data.data.card);
          var totalCardTotal = totalCard1.concat(res.data.data.package)
          this.setData({ getCardByUser: totalCardTotal });
          console.log("getCardByUser", this.data.getCardByUser);
        } else if (data==null){
          this.setData({ getCardByUser: null });
        }
      }
      
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  leaveGoods:function(){
    wx.showLoading({
      title: '加载中',
    })
    // 1 次数 2 时长 5终身
    app.util.reqAsync('member/accRecordList', { "memberId": wx.getStorageSync("shopMemberId") }).then((res) => {
      this.setData({ leaveGoods: res.data });
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  loseEfficacy: function(){
    wx.navigateTo({
      url: '../loseEfficacy/loseEfficacy',
    })
  },
  skip:function(e){
    var item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../cardDetail/cardDetail?item=' + JSON.stringify(item) + "&loseKa=" + 0,
    })
  },
  forDetail:function(){ 
    wx.navigateTo({
      url: '../forDetail/forDetail',
    })
  }, 
  expenseDetail: function() {
    wx.navigateTo({
      url: '../expenseDetail/expenseDetail?carList=' + JSON.stringify(this.data.cardList),
    })
  }, 
  //进入详情3种 ，失效卡详情0,卡项详情1,留店商品详情2,用loseKa判断
  goodsDetail:function(e){
    var item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../cardDetail/cardDetail?item=' + JSON.stringify(item) + "&loseKa=" + 2,
    })
  },
  switchover:function(e){
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      this.setData({ activeIndex: 0, hiddenKas: false, hiddenGoods: true})
    } else {
      this.setData({ activeIndex: 1, hiddenKas: true, hiddenGoods: false})
    }
  },
  onShareAppMessage: function () {
  }
})