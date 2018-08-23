import util from '../../../../utils/util.js';
var app = getApp();
Page({
  data: {
    orderList: [],
    activeIndex: "",
    flag: false, //手机系统是否是ios
    shopId: '',
    userId: '',
    presaleId: '', //订单id
    facilityId: '', //座位号
    facilityName: '',
    shopName: '',
    scPresaleInfoList: [],
    shouldPay: '',
    total: 0,
    flagOrder: true,
    memberId: '',
    subaccountId: '',
    discount: '',
    orderStatus: '',
    merchantId: ''
  },
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');
    this.setData({
      activeIndex: options.activeIndex,
      shopId: shop.id,
      userId: options.userId,
      presaleId: options.presaleId,
      facilityId: options.facilityId,
      merchantId: options.merchantId
    })
    console.log(options.activeIndex)

    var that = this; //获取手机系统是否是ios
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        if (res.system.indexOf("iOS") > -1) { //苹果
          that.setData({
            flag: true
          })
        } else {
          that.setData({
            flag: false
          })
        }

      }
    })

    this.getInfo();//获取数据
  },
  onShow: function (e) {
    this.getInfo();
  },
  appSkip: function (e) { //点击跳转到app下载页
    wx.navigateTo({ url: "/pages/myHome/downLoadIos/downLoadIos?flag=" + this.data.flag });
  },
  offlineSkip: function (e) { //跳到云店首页
    wx.switchTab({ url: "../../../index/index" });
  },
  againBuy: function (e) { //再来一单
    wx.navigateTo({
      url: "../../../../packageOffline/pages/proList/proList"
    });
  },
  goOn: function (e) { //继续添加
    var facilityId = e.currentTarget.dataset.facilityid,
      presaleId = e.currentTarget.dataset.no,
      userId = e.currentTarget.dataset.userid,
      shopId = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: "../../../../packageOffline/pages/proList/proList"
    });
  },
  buyOrder: function (e) { //结算支付
    var code = e.currentTarget.dataset.no;//订单编号
    var name = e.currentTarget.dataset.name;//商品名
    var shopid = e.currentTarget.dataset.shopid;
    this.bindTestCreateOrder(code, name, this.data.shouldPay, shopid);
  },
  bindTestCreateOrder: function (code, name, price, shopid) {
    var data = {
      subject: name, //商品名
      shopId: shopid, //店铺id
      amount: this.data.shouldPay,
      requestBody: {
        body: '云店小程序店内下单',
        out_trade_no: code, //订单编号
        trade_type: 'JSAPI',
        sub_openid: wx.getStorageSync('scSysUser').wxOpenId
      }
    };
    //发起网络请求 微信统一下单   
    util.reqAsync('payBoot/wx/pay/unifiedOrderInSpMode', data).then((res) => {
      console.log(res);

      if (res.data.code == 1) {
        //获取预支付信息
        var wxResult = res.data.data.wxResult;
        var prepayInfo = res.data.data.prepayInfo;
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
        var that = this;
        wx.requestPayment({
          'timeStamp': timeStamp,
          'nonceStr': nonceStr,
          'package': packages,
          'signType': 'MD5',
          'paySign': paySign,
          'success': function (res) {
            console.log("支付成功")
            console.log(that.data.shouldPay)
            that.setData({
              flagOrder: false
            })
            that.getMessage();
          },
          'fail': function (res) {
            that.getInfo()
          },
          'complete': function (res) {

            console.log('支付成功回调-------------',res)
            if (res.errMsg == "requestPayment:ok"){
              wx.sendSocketMessage({
                data: '已结算'
              })
            }
          }
        })

      } else {
        if (res.data.data == 'overdue payment') {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          wx.navigateTo({
            url: "../../../../packageOffline/pages/proList/proList"
          });
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }

      }

    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    });
  },
  getInfo: function (e) {
    this.setData({
      hidden: false
    })
    //获取订单详情
    app.util.reqAsync('shopOrder/getPresaleByCondition', {
      shopId: this.data.shopId,
      userId: this.data.userId,
      presaleId: this.data.presaleId, //订单id
      facilityId: this.data.facilityId
    }).then((res) => {
      if (res.data.code == 1) {

        this.setData({
          orderList: res.data.data,
          facilityName: res.data.data.facilityName,
          shopName: res.data.data.shopName,
          scPresaleInfoList: res.data.data.scPresaleInfoList,
          shouldPay: res.data.data.shouldPay,
          total: res.data.data.scPresaleInfoList.length,
          memberId: res.data.data.memberId,
          subaccountId: res.data.data.subaccountId,
          discount: res.data.data.discount,
          orderStatus: res.data.data.orderStatus,
          hidden: true
        })
        console.log(this.data.orderList)
        wx.setStorageSync("orderInfo", res.data.data)
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      console.log(err)
      wx.showToast({
        title: '获取服务异常',
        icon: 'none'
      })
    })
  },
  goShop: function (e) {
    //再来一单
    this.setData({
      flagOrder: true
    })
    wx.navigateTo({
      url: '../../../../packageOffline/pages/proList/proList'
    });
  },
  look: function (e) {
    //查看详情
    this.setData({
      flagOrder: true
    })
    this.getInfo();
  },
  getMessage: function () {
    //支付成功调接口
    app.util.reqAsync('shop/getRoomIdSendMessage', {
      orderNo: this.data.presaleId,
      shopId: this.data.shopId,
      userCode: wx.getStorageSync('scSysUser').usercode,
      type: 1
    }).then((data) => {
      if (data.data.code == 1) {

      } else {
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
      }

    })
  }

})