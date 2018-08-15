var app = getApp();
Page({
  data: {
    select:"全部",
    cardList:[],
    showType:false,
    carIndex:[],
    data:{
      memberId: ""
    },
    flag:0
  },
  onLoad: function (options) {
    var carIndex = JSON.parse(options.carList);
    var memberId = wx.getStorageSync("shopMemberId");
    var id = 'data.memberId';
    this.setData({ carIndex: carIndex, [id]: memberId})
    this.getList(this.data.data,0);
  },
  getList:function(data,flag){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('member/getAccountConsume', data).then((res) => {
      var data = res.data.data;
      for (var i = 0; i < data.length; i++) {
        data[i].actualPay = app.util.formatMoney(data[i].actualPay, 2);
      }
      // 判断第一次加载有没有数据设置标志，选择的全部一起隐藏
      //如果是点击卡项没有数据 选择的全部就不隐藏
      if (flag==0&&data.length==0){
        this.setData({ flag: 0 });
      }else{
        this.setData({ flag: 1 });
      }
      this.setData({ cardList: res.data.data });
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading()
    })
  },
  searchall:function(){
    var memberId = wx.getStorageSync("shopMemberId");
    var id = 'data.memberId';
    this.setData({ select: "全部", [id]: memberId, flag:1})
    this.getList(this.data.data);
    this.showType();
  },
  search:function(e){
    var id = 'data.memberId';
    var subaccountId = e.currentTarget.dataset.subaccountid;
    var memberId = e.currentTarget.dataset.memberid;
    var select = e.currentTarget.dataset.accountname;
    this.setData({ [id]: subaccountId, select: select,flag:1});
    console.log("flag",this.data.flag)
    var data={
      memberId: memberId,
      accountId: subaccountId
    }
    this.getList(data,1);
    this.showType();
  },
  showType: function () {
    this.setData({
      showType: !this.data.showType
    })
    console.log(this.data.showType);
  },
  skip:function(e){
    var orderId = e.currentTarget.dataset.orderid;
    wx:wx.navigateTo({
      url: '../consumptionDetail/consumptionDetail?orderId=' + orderId
    })
  },
  onShareAppMessage: function () {
  }
})