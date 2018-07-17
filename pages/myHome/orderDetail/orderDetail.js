//获取应用实例
//var QR = require("../../../utils/qrcode.js");
const app = getApp();

Page({
  winHeight: "",//窗口高度
  data: {
    goods: [],
    phone:"",//商家电话
    time:1, //倒计时
    createTime:'', //下单时间
    no:'', //倒计时关闭
    index:0,
    userid:'',
    orderStatusVo:'',
    orderNo:'',
    areaName:'',
    cityName:'',
    provinceName:''
  },
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var userid = wx.getStorageSync('scSysUser').id;
    var orderNo = options.orderNo;
    this.setData({
      userid: userid,
      orderNo: orderNo
    })
    
    //调接口
    app.util.reqAsync('shop/orderDetail', {
      orderNo: this.data.orderNo
    }).then((data) => {
      if(data.data.code==1){
        var areaName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.areaId);
        var cityName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.cityId);
        var ProvinceName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.provinceId);
        this.setData({
          goods: data.data.data,
          phone: data.data.data[0].shopInfo.phoneService,
          createTime: data.data.data[0].orderInfo.createTime,
          orderStatusVo: data.data.data[0].orderInfo.orderStatusVo,
          areaName: areaName,
          cityName: cityName,
          ProvinceName: ProvinceName
        })
        if (data.data.data[0].orderInfo.orderStatusVo == 1) { //待付款
          
            this.countTime();
        
        }
        this.setData({
          no: this.data.orderNo
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
  onShow:function(e){
    //调接口
    app.util.reqAsync('shop/orderDetail', {
      orderNo: this.data.orderNo
    }).then((data) => {
      if (data.data.code == 1) {
        var areaName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.areaId);
        var cityName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.cityId);
        var ProvinceName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.provinceId);
        this.setData({
          goods: data.data.data,
          phone: data.data.data[0].shopInfo.phoneService,
          createTime: data.data.data[0].orderInfo.createTime,
          orderStatusVo: data.data.data[0].orderInfo.orderStatusVo,
          areaName: areaName,
          cityName: cityName,
          ProvinceName: ProvinceName
        })
        if (data.data.data[0].orderInfo.orderStatusVo == 1) { //待付款

          this.countTime();

        }
        this.setData({
          no: this.data.orderNo
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
      orderNo = this.data.orderNo;
    //删除订单
    app.util.reqAsync('shop/delOrder', {
      orderNo: orderNo
    }).then((data) => {
      if(data.data.code==1){
        wx.showToast({
          title: '删除成功',
          icon: 'none'
        })
        wx.navigateTo({
          url: '../order/order?customerId=' + customerId + '&=index' + 0
        })
      }else{
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
      url: '../../appraise/appraise?shopId=' + shopId + '&goodsId=' + goodId
    })
  },
  cancel: function (e) {
    var orderNo = this.data.orderNo;
    var userid = this.data.userid;
    //取消订单
    app.util.reqAsync('shop/cancelOrder', {
      orderNo: orderNo
    }).then((res) => {
      if(res.data.code==1){
        wx.showToast({
          title: '订单取消成功',
          icon: 'none'
        })
        wx.navigateTo({
          url: '../order/order?customerId=' + userid + '&=index' + 0
        })
      }else{
        wx.showToast({
          title: res.data.msg,
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
  returnGood: function (e) {
    //申请退货
    // var orderNo = e.currentTarget.dataset.no,
    //   orderStatus = e.currentTarget.dataset.statu,
    //   returnAmount = e.currentTarget.dataset.money;
    // wx.navigateTo({
    //   url: 'applyRefund/applyRefund?orderNo=' + orderNo + '&orderStatus=' + orderStatus + '&returnAmount=' + returnAmount
    // })
    var self = this;
    var phone = this.data.phone;
    wx.showModal({
      title: '申请退货',
      content: '是否拨打商家电话联系退货？',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone, //此号码并非真实电话号码，仅用于测试
            success: function () {
              console.log("拨打电话成功！")
            },
            fail: function () {
              console.log("拨打电话失败！")
            }
          })
        } else if (res.cancel) {
          //用户点击取消

        }
      }
    })
  },
  reimburse: function (e) {
    //申请退款
    // var orderNo = e.currentTarget.dataset.no,
    //   orderStatus = e.currentTarget.dataset.statu,
    //   returnAmount = e.currentTarget.dataset.money;
    // wx.navigateTo({
    //   url: 'applyRefund/applyRefund?orderNo=' + orderNo + '&orderStatus=' + orderStatus + '&returnAmount=' + returnAmount
    // })
    var self = this;
    var phone = this.data.phone;
    wx.showModal({
      title: '申请退款',
      content: '是否拨打商家电话联系退款？',
      success: function (res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone, //此号码并非真实电话号码，仅用于测试
            success: function () {
              console.log("拨打电话成功！")
            },
            fail: function () {
              console.log("拨打电话失败！")
            }
          })
        } else if (res.cancel) {
          //用户点击取消

        }
      }
    })
  },
  take: function (e) {
    //确认收货
    var orderNo = this.data.orderNo,
      customerId = e.currentTarget.dataset.customerid;//"fromBarCode":1 //是否扫码确认收货。可不填 ，不填则不是扫码确认收货
    app.util.reqAsync('shop/confirmRecv', {
      orderNo: orderNo,
      customerId: customerId
    }).then((res) => {
      if(res.data.code==1){
        wx.navigateTo({
          url: 'myHome/order/order?customerId=' + customerId
        })
      }else{
        wx.showToast({
          title: res.data.msg,
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
  shipments: function (e) {
    var orderNo = this.data.orderNo,
      userId = this.data.userid;//用户id
    //提醒发货
    app.util.reqAsync('shop/orderRemind', {
      orderNo: orderNo,
      userId: userid
    }).then((res) => {
      if(res.data.code==1){
        wx.showToast({
          title: '已提醒卖家发货',
          icon: 'none'
        })
      }else{
        wx.showToast({
          title: res.data.msg,
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
      console.log(1)
      this.setData({
        time: 0
      })
      this.cancel();
      clearTimeout(this.countTime);//解除
      
    }  
  },
  pay: function (e) {
    var self = this;
    var dt = this.data.orderNo;
    wx.showModal({
      title: '支付方式',
      content: '是否微信支付？',
      success: function (res) {
        if (res.confirm) {
          //用户点击确定（调微信支付接口）
          self.bindTestCreateOrder(dt);

        } else if (res.cancel) {
          //用户点击取消

        }
      }
    })
  },
  bindTestCreateOrder: function (code) {
    var data = {
      requestBody: {
        body: '测试支付功能',
        out_trade_no: code,
        notify_url: 'https://wxapp.izxcs.com/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult',
        trade_type: 'JSAPI',
        openid: wx.getStorageSync('scSysUser').wxOpenId
      }
    };
    //发起网络请求 微信统一下单   
    app.util.reqAsync('payBoot/wx/pay/unifiedOrder', data).then((res) => {
      console.log(res.data.data);
      if (res.data.code == 1) {
        //获取预支付信息
        var wxResult = res.data.data.wxResult;
        var prepayInfo = res.data.data.prepayInfo;
        var self = this;
        //预支付参数
        var timeStamp = '';
        var nonceStr = '';
        var packages = '';
        var paySign = '';

        if (wxResult) {
          timeStamp = res.data.data.timeStamp;
          nonceStr = wxResult.nonceStr;
          packages = 'prepay_id=' + wxResult.prepayId;
          paySign = res.data.data.paySign;
        } else if (prepayInfo) {
          timeStamp = prepayInfo.timestamp;
          nonceStr = prepayInfo.nonceStr;
          packages = prepayInfo.packages;
          paySign = prepayInfo.paySign;
        }
        //发起支付
        wx.requestPayment({
          'timeStamp': timeStamp,
          'nonceStr': nonceStr,
          'package': packages,
          'signType': 'MD5',
          'paySign': paySign,
          'success': function (res) {
            wx.showToast({
              title: '支付成功',
              icon: 'none'
            })
            self.onShow();
           },
          'fail': function (res) {

            //支付失败或者未支付跳到购物车
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })


          },
          'complete': function (res) {
          }
        })

      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }

    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    });
  }
  // bindTestCreateOrder: function (code) {
  //   //微信支付
  //   var data = {
  //     requestBody: {
  //       body: '测试支付功能',
  //       out_trade_no: code,
  //       notify_url: 'https://wxapp.izxcs.com/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult',
  //       trade_type: 'JSAPI',
  //       openid: wx.getStorageSync('scSysUser').wxOpenId
  //     }
  //   };
  //   //发起网络请求 微信统一下单   
  //   app.util.reqAsync('payBoot/wx/pay/unifiedOrder', data).then((res) => {
  //     //发起支付
  //     var wxResult = res.data.data.wxResult;
  //     var paySign = res.data.data.paySign;
  //     var timeStamp = res.data.data.timeStamp;
  //     var self = this;
  //     wx.requestPayment({
  //       'timeStamp': timeStamp,
  //       'nonceStr': wxResult.nonceStr,
  //       'package': 'prepay_id=' + wxResult.prepayId,
  //       'signType': 'MD5',
  //       'paySign': paySign,
  //       'success': function (res) { },
  //       'fail': function (res) {
  //         //支付失败或者未支付跳到购物车
  //         wx.showToast({
  //           title: '支付失败',
  //           icon: 'none'
  //         })

  //         self.onLoad();

  //       },
  //       'complete': function (res) {
  //         wx.showToast({
  //           title: '支付成功',
  //           icon: 'none'
  //         })

  //         self.onLoad();
  //       }
  //     })

  //   }).catch((err) => {
  //     wx.showToast({
  //       title: '失败……',
  //       icon: 'none'
  //     })
  //   });
  // }
})