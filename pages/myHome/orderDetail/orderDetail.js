//获取应用实例
const app = getApp();
var user = wx.getStorageSync('scSysUser');
//此页面还差付款未做
Page({
  winHeight: "",//窗口高度
  data: {
    goods: [],
    phone:"",//商家电话
    time:0, //倒计时
    createTime:'' //下单时间
  },
  onLoad: function (option) {
    //调接口
    app.util.reqAsync('shop/orderDetail', {
      orderNo: option.orderNo
    }).then((data) => {
      this.setData({
        goods: data.data.data,
        phone: data.data.data[0].shopInfo.phoneService,
        createTime: data.data.data[0].orderInfo.createTime
      })
      if (data.data.data[0].orderInfo.orderStatusVo == 1){ //待付款
        if (this.data.time!=0){
        this.countTime();
      }else{ //取消订单
        this.cancel();
      }   
    }
      
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  calling: function () {
    //拨打电话
    wx.makePhoneCall({
      phoneNumber: this.data.phone, //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  goodSkip: function(e){
    //跳到商品详情
    var shopId = e.currentTarget.dataset.shopid,
      goodsId = e.currentTarget.dataset.goodsid;
    wx.navigateTo({
      url: '../../goodsDetial/goodsDetial?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  delete: function (e) {
    var customerId = e.currentTarget.dataset.customerid,
      orderNo = e.currentTarget.dataset.no;
    //删除订单
    app.util.reqAsync('shop/delOrder', {
      orderNo: orderNo
    }).then((data) => {
      wx.navigateTo({
        url: 'myHome/order/order?customerId=' + customerId
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  cancel: function (e) {
    var orderNo = e.currentTarget.dataset.no,
      customerId = e.currentTarget.dataset.customerid;
    //取消订单
    app.util.reqAsync('shop/cancelOrder', {
      orderNo: orderNo
    }).then((res) => {
      wx.navigateTo({
        url: 'myHome/order/order?customerId=' + customerId
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  audit: function () {
    //退款中、退货中
    wx.showToast({
      title: '等待商家审核',
      icon: 'none'
    })
  },
  appraise: function (e) {
    var shopId = e.currentTarget.dataset.shopid,
      goodId = e.currentTarget.dataset.goodid;
    //评价
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + shopId + '&goodsId=' + goodId
    })
  },
  returnGood: function (e) {
    //申请退货
    var orderNo = e.currentTarget.dataset.no,
      orderStatus = e.currentTarget.dataset.statu,
      returnAmount = e.currentTarget.dataset.money;
    wx.navigateTo({
      url: 'applyRefund/applyRefund?orderNo=' + orderNo + '&orderStatus=' + orderStatus + '&returnAmount=' + returnAmount
    })
  },
  reimburse: function (e) {
    //申请退款
    var orderNo = e.currentTarget.dataset.no,
      orderStatus = e.currentTarget.dataset.statu,
      returnAmount = e.currentTarget.dataset.money;
    wx.navigateTo({
      url: 'applyRefund/applyRefund?orderNo=' + orderNo + '&orderStatus=' + orderStatus + '&returnAmount=' + returnAmount
    })
  },
  take: function (e) {
    //确认收货
    var orderNo = e.currentTarget.dataset.no,
      customerId = e.currentTarget.dataset.customerid;//"fromBarCode":1 //是否扫码确认收货。可不填 ，不填则不是扫码确认收货
    app.util.reqAsync('shop/confirmRecv', {
      orderNo: orderNo,
      customerId: customerId
    }).then((res) => {      
      wx.navigateTo({
        url: 'myHome/order/order?customerId=' + customerId
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  shipments: function (e) {
    var orderNo = e.currentTarget.dataset.no,
      userId = user.id;//用户id
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
  countTime: function(e){
    //倒计时时分秒
    //获取当前时间
    var date = new Date();
    var now = date.getTime();
    //设置截止时间
    var create = this.data.createTime;//下单时间
    var hour = parseInt(new Date(create).getHours())+1;//时
    var minute = new Date(create).getMinutes();//分
    var seconds = new Date(create).getSeconds();//秒
    var day = new Date(create).getDate(); //日
    var month = parseInt(new Date(create).getMonth())+1;//月
    var year = new Date(create).getFullYear();//年
    var newTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + seconds;
    var endTime = new Date(newTime).getTime();
    //时间差
    var leftTime = parseInt(endTime) - parseInt(now);
    var d, h, m, s;
    if (leftTime >= 0) {
      d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
      h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
      m = Math.floor(leftTime / 1000 / 60 % 60);
      s = Math.floor(leftTime / 1000 % 60);
      this.setData({
        time: h+'小时'+m+'分'+s+'秒'
      })
      setTimeout(this.countTime, 1000);
    }else{
      clearTimeout(this.countTime);//解除
      this.setData({
        time: 0
      })
    }  
  }
})