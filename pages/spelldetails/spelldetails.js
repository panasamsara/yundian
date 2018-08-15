// pages/spelldetails/spelldetails.js
const app = getApp();

Page({
  data: {
    isMaster: '', //是否拼主 0不是1是  #int  
    groupId: '', //拼团id
    pictureUrl: '', //商品图片
    goodsTitle:'',  //商品名称
    discountPrice:'',//拼团价格
    descTitle: '',  //商品描述
    endTime:'',     //结束时间
    timeStatus: '', //拼团状态 0进行中 1成团 2过期失败#int
    lackUser: '' , //成团缺少人数#int
    moreGroupList: [], //推荐更多拼团商品list
    groupOrderList:[], //已加入拼团用户list
    groupOrderListLength:'',
    showStock:false,
    shopId:'',
    goodId:'',
    population:'', //几人团
    spellUser:'',
    orderStatusVo:'', //付款状态 
    stockId: '', //商品是否有默认规格，默认规格 不返回 stockId
    timer: '',
    count:'',
    d:'',
    h:'',
    m:'',
    s:''
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      groupId: options.groupId,
      orderNo: options.orderNo,
      population: options.population,
      shopId: options.shopId,
      cUser: options.cUser,
      orderStatusVo: options.orderStatusVo,
      stockId: options.stockId
    })
    console.log('orderStatusVo:' + this.data.orderStatusVo);
    app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
      if (res.data.data) {
        this.setData({
          nowTime: app.util.formatIOS(res.data.data)
        })
      }
    })
    console.log('stockId:' + this.data.stockId);
    app.util.reqAsync('shop/getGroupBuyOrderDetail', {
      groupId: this.data.groupId, //拼团id
      orderNo: this.data.orderNo, //订单编号
      pageNo: 1,
      shopId: this.data.shopId,//店铺id
      pageSize: 10,
      cUser: this.data.cUser//拼团用户
    }).then((res) => {
      // debugger;
      var data = res.data.data;
      if (options.share) {
        this.setData({
          isMaster: 0
        })
      }else{
        this.setData({
          isMaster: data.isMaster
        })
      }
      this.setData({      
        groupId: data.groupId,
        pictureUrl: data.pictureUrl,
        goodsTitle: data.goodsTitle,
        descTitle: data.descTitle,
        discountPrice: data.discountPrice,
        endTime: app.util.formatIOS(data.endTime),
        timeStatus: data.timeStatus,
        lackUser: data.lackUser ? data.lackUser : '0',
        moreGroupList: data.moreGroupList,
        groupOrderList: data.groupOrderList,
        groupOrderListLength: data.groupOrderList.length,
        goodId: data.goodsId
      })
      console.log(this.data.endTime)
      console.log(this.data.nowTime)
      let count=this.data.endTime-this.data.nowTime;
      console.log('goodId:'+this.data.goodId);
      this.setData({
        count:count
      })
    })
    let _this = this
    clearInterval(_this.data.timer)
    this.data.timer = setInterval(function () {
      _this.count()
    }, 1000)
    // 刷新页面
    this.refreshRequest();
  },
  onShow: function (e) {
    //调接口
    app.util.reqAsync('shop/getGroupBuyOrderDetail', {
      groupId: this.data.groupId, //拼团id
      orderNo: this.data.orderNo, //订单编号
      pageNo: 1,
      shopId: this.data.shopId,//店铺id
      pageSize: 10,
      cUser: this.data.cUser//拼团用户
    }).then((res) => {
      // debugger;
      console.log(res);
      if (res.data.code == 1) {
        var data = res.data.data;
        this.setData({
          // isMaster: data.isMaster,
          groupId: data.groupId,
          pictureUrl: data.pictureUrl,
          goodsTitle: data.goodsTitle,
          descTitle: data.descTitle,
          discountPrice: data.discountPrice,
          endTime: data.endTime,
          timeStatus: data.timeStatus,
          lackUser: data.lackUser,
          moreGroupList: data.moreGroupList,
          groupOrderList: data.groupOrderList,
          groupOrderListLength: data.groupOrderList.length
        })
        this.setData({
          data:data
        })
      } else {
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })

  },
  showRule:function(){
    this.setData({
      showStock: true
    });
  },
  closeMask:function(){
    this.setData({
      showStock: false
    });
  },
  // 参与拼单
  participate: function(e){
    if (this.data.stockId) {
      console.log("有规格");
      wx.navigateTo({
        url: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodId
      })
    } else {
      console.log("无规格");
      wx.navigateTo({
        url: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodId
      })
    }
  },
  // 再次发起拼单
  // 1 拼团 2 秒杀 3 普通商品
  againInitiate: function (e) {
    if (this.data.stockId) {
      wx.navigateTo({
        url: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodId
      })
    } else {
      wx.navigateTo({
        url: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodId
      })
    }
  },
  // 跳转商品详情
  // 1 拼团 2 秒杀 3 普通商品
  goToGroupBuy: function (e) {
    var goodsid = e.currentTarget.dataset['goodsid']
    var groupId = e.currentTarget.dataset['groupid']
    var shopId = e.currentTarget.dataset['shopid']
    console.log(goodsid);
    console.log(groupId);
    console.log(shopId);
    var user = wx.getStorageSync('scSysUser')
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?goodsId=' + goodsid + '&shopId=' + shopId ,
      success: function (res) {
        // success
      }
    })
  },
  // 倒计时方法
  count: function () {
      let leftTime = this.data.count;
      leftTime -= 1000;
      if (leftTime <= 0) {
        leftTime = 0;
      }
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
        h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
        m = Math.floor(leftTime / 1000 / 60 % 60),
        s = Math.floor(leftTime / 1000 % 60)
      if (h < 10) {
        h = "0" + h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        count:leftTime,
        d:d,
        h:h,
        m:m,
        s:s
      })
  },
  // 定时2分钟自动请求服务器一次
  refreshRequest:function(){
    var refreshTimer;
    refreshTimer = setInterval(this.onShow, 120000);
  },
  primary: function(){
    wx.switchTab({
      url: '../index/index',
    })
  }

})