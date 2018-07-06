//shopping-cart.js

//此页面还差付款未做
//获取应用实例
const app = getApp();

Page({
  data: {
    winHeight: "",//窗口高度
    currentPage: 1,  // 当前页数  默认是1
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    goodlist: [], //"orderStatus" 订单状态（待发货0，配送中1，已收货2， 配送失败3, 取消4，异常订单5）
    length:0
  },
  onLoad: function () {
    var that = this;
    // 高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = (clientHeight-58) * rpxR;
        that.setData({
          winHeight: calc
        });
      }
    });

    this.getData(); //全部

  },
  // 滚动切换标签样式
  switchTab: function (e) {
    this.setData({
      currentTab: e.detail.current,
      currentPage:1,
      goodlist: [], //"orderStatus" 订单状态（待发货0，配送中1，已收货2， 配送失败3, 取消4，异常订单5）
      length: 0
    });
    this.checkCor();
    this.getData();
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    var cur = parseInt(e.currentTarget.dataset.current);
    if (this.data.currentTab == cur) { 
      return false;
    } else {
      this.setData({
        currentTab: cur,
        currentPage: 1,
        goodlist: [], //"orderStatus" 订单状态（待发货0，配送中1，已收货2， 配送失败3, 取消4，异常订单5）
        length: 0
      })
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    if (this.data.currentTab > 4) {
      this.setData({
        scrollLeft: 300
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  getData: function(){
    //调接口
    app.util.reqAsync('shop/orderList', {
      customerId: 198,
      orderStatusVo: this.data.currentTab,
      pageNo: this.data.currentPage,
      pageSize: 10
    }).then((res) => {
      var oldData = this.data.goodlist;
      var data = res.data.data;
      for (var ins in data) {
        oldData.push(data[ins]);
      }
      for (var i in oldData){
        oldData[i].total = oldData[i].orderItemList.length;
      }
      wx.hideLoading();
      this.data.currentPage = ++this.data.currentPage;
        this.setData({
          goodlist: oldData,
          length: oldData.length
        })
        console.log(this.data.goodlist)
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  delete: function(e){
    var orderNo = e.currentTarget.dataset.no;
    //删除订单
    app.util.reqAsync('shop/delOrder', {
      orderNo: orderNo
    }).then((res) => {
      this.getData();
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  cancel: function(e){
    var orderNo = e.currentTarget.dataset.no;
    //取消订单
    app.util.reqAsync('shop/cancelOrder', {
      orderNo: orderNo
    }).then((res) => {
      this.getData();
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  audit:function(){
    //退款中、退货中
    wx.showToast({
      title: '等待商家审核',
      icon: 'none'
    })
  },
  appraise: function(e){
    var shopId = e.currentTarget.dataset.shopid,
      goodId = e.currentTarget.dataset.goodid;
    //评价
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + shopId + '&goodId=' + goodId
    })
  },
  returnGood: function(e){
    //申请退货
    var orderNo = e.currentTarget.dataset.no,
      orderStatus = e.currentTarget.dataset.statu,
      returnAmount = e.currentTarget.dataset.money;
    wx.navigateTo({
      url: 'applyRefund/applyRefund?orderNo=' + orderNo + '&orderStatus=' + orderStatus + '&returnAmount=' + returnAmount
    })
  },
  take: function(e){
    //确认收货
    var orderNo = e.currentTarget.dataset.no,
      customerId = e.currentTarget.dataset.customerid;//"fromBarCode":1 //是否扫码确认收货。可不填 ，不填则不是扫码确认收货
    app.util.reqAsync('shop/confirmRecv', {
      orderNo: orderNo,
      customerId: customerId
    }).then((res) => {
      this.getData();
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  shipments : function(e){
    var orderNo = e.currentTarget.dataset.no,
      userId = 1;//用户id不知道哪里获得
    //提醒发货
    app.util.reqAsync('shop/orderRemind', {
      orderNo: orderNo,
      userId: userId
    }).then((res) => {
      wx.showToast({
        title: '已提醒卖家发货',
        icon: 'none'
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  onReachBottom: function () {
    //下拉加载
    var newpage = Math.ceil(this.data.length / this.data.currentPage);
    if (this.data.currentPage <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.getData();
    } else {
      wx.showToast({
        title: '到底了哦',
        icon: "none"
      })
    }
  },
  onPullDownRefresh: function () {
    //上拉刷新
    //票判断不为0,点击tab为空的时候不可以下拉;
    if (this.data.goodlist.length != 0) {
      wx.showLoading({
        title: '加载中',
      });
      // 下拉每次清空数组
      this.data.goodlist.lengthh = 0;
      var newpage = Math.ceil(this.data.length / this.data.currentPage);
      if (this.data.currentPage <= newpage) {
        this.getData();
      } else {
        wx.showToast({
          title: '到底了哦',
          icon: "none"
        })
      }
      wx.stopPullDownRefresh();
    }
  },
})