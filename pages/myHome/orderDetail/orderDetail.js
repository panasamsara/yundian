//获取应用实例
var QR = require("../../../utils/qrcode.js");
const app = getApp();

Page({
  winHeight: "",//窗口高度
  data: {
    goods: [],
    phone: "",//商家电话
    time: 1, //倒计时
    createTime: '', //下单时间
    no: '', //倒计时关闭
    index: 0,
    userid: '',
    orderStatusVo: '',
    orderNo: '',
    areaName: '',
    cityName: '',
    provinceName: '',
    canvasHidden: false,
    imagePath: '',
    isGroupBuying:'',// 是否为拼团
    userList:'', // 参与拼团人员
    timeStatus: '', // 状态：0拼单进行中，1成功,2拼单时间到，已过期未成功'
    nowTime:'', // 服务器当前时间
    groupEndTime:'', // 拼单结束时间
    spellLeftTime:'',// 拼单剩余时间
    goodsName:'', // 商品名称
    stockName:'', // 商品描述
    groupId:'',//拼单 Id 
    shopId: '' //店铺id

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
      if (data.data.code == 1) {
        var areaName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.areaId);
        var cityName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.cityId);
        var ProvinceName = app.util.area.getAreaNameByCode(data.data.data[0].orderInfo.provinceId);
        console.log(data.data.data[0]);
        this.setData({
          goods: data.data.data,
          phone: data.data.data[0].shopInfo.phoneService,
          createTime: data.data.data[0].orderInfo.createTime,
          orderStatusVo: data.data.data[0].orderInfo.orderStatusVo,
          areaName: areaName,
          cityName: cityName,
          ProvinceName: ProvinceName
        })
        // if (data.data.data[0].orderInfo.orderStatusVo == 1) { //待付款

        //     this.countTime();

        // } 
        if (data.data.data[0].orderInfo.orderStatusVo == 2 && data.data.data[0].orderInfo.deliveryType == 2) { //自提
          // 页面初始化 options为页面跳转所带来的参数
          var size = this.setCanvasSize();//动态设置画布大小
          var initUrl = this.data.storeUrl;
          this.createQrCode(initUrl, "mycanvas", size.w, size.h);
        }
        // this.setData({
        //   no: this.data.orderNo
        // })
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
  onShow: function (e) {
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
        // if (data.data.data[0].orderInfo.orderStatusVo == 1) { //待付款

        //   this.countTime();

        // }
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
        title: '失败222……',
        icon: 'none'
      })
    })

  },//适配不同屏幕大小的canvas
  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 686;//不同屏幕下canvas的适配比例；设计稿是750宽
      var width = res.windowWidth / scale;
      var height = width;//canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => { this.canvasToTempImage(); }, 500);

  },
  //获取临时缓存照片路径，存入data中
  canvasToTempImage: function () {
    var that = this;
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
          canvasHidden: true
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  //点击图片进行预览，长按保存分享图片
  previewImg: function (e) {
    var img = this.data.imagePath;
    console.log(img);
    wx.previewImage({
      current: img, // 当前显示图片的http链接
      urls: [img] // 需要预览的图片http链接列表
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
  goodSkip: function (e) {
    //跳到商品详情
    var shopId = e.currentTarget.dataset.shopid,
      goodsId = e.currentTarget.dataset.goodsid;
    //调接口判断是否下架
    app.util.reqAsync('shop/goodsDetail', {
      shopId: shopId,
      goodsId: goodsId,
      customerId: this.data.userid
    }).then((data) => {
      if (data.data.code == 1) {
        if (data.data.data.status == 1 && data.data.data.goodsStatus == 1) {
          wx.navigateTo({
            url: '../../goodsDetial/goodsDetial?shopId=' + shopId + '&goodsId=' + goodsId
          })
        } else {
          wx.showToast({
            title: '此商品已下架',
            icon: 'none'
          })
        }
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
  delete: function (e) {
    var customerId = e.currentTarget.dataset.customerid,
      orderNo = this.data.orderNo;
    //删除订单
    wx.showModal({
      title: '提示',
      content: '确定删除订单？',
      success: function (res) {
        if (res.confirm) {
          app.util.reqAsync('shop/delOrder', {
            orderNo: orderNo
          }).then((data) => {
            if (data.data.code == 1) {
              wx.showToast({
                title: '删除订单成功',
                icon: 'none'
              })
              setTimeout(function () {
                wx.navigateTo({
                  url: '../order/order?customerId=' + customerId + '&=index' + 0
                })
              }, 2000);
            } else {
              wx.showToast({
                title: data.data.msg,
                icon: 'none'
              })
            }
          })
        }
      }
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
    app.util.reqAsync('shop/cancelOnlineOrder', {
      orderNo: orderNo
    }).then((res) => {
      if (res.data.code == 1) {
        wx.showToast({
          title: '订单取消成功',
          icon: 'none'
        })
        wx.navigateTo({
          url: '../order/order?customerId=' + userid + '&=index' + 0
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
      customerId = this.data.userid;//"fromBarCode":1 //是否扫码确认收货。可不填 ，不填则不是扫码确认收货
    app.util.reqAsync('shop/confirmRecv', {
      orderNo: orderNo,
      customerId: customerId
    }).then((res) => {
      console.log(res)
      if (res.data.code == 1) {
        this.onShow();
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
    })
  },
  shipments: function (e) {
    var orderNo = this.data.orderNo,
      userId = this.data.userid;//用户id
    console.log(userId)
    //提醒发货
    app.util.reqAsync('shop/orderRemind', {
      orderNo: orderNo,
      userId: userId
    }).then((res) => {
      if (res.data.code == 1) {
        wx.showToast({
          title: '已提醒卖家发货,请勿重复提醒',
          icon: 'none'
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
    })
  },
  countTime: function (e) {
    //倒计时时分秒
    //获取当前时间
    var date = new Date();
    var now = date.getTime();
    //设置截止时间
    var create = this.data.createTime;//下单时间
    var hour = parseInt(new Date(create).getHours()) + 2;//时
    var minute = new Date(create).getMinutes();//分
    var seconds = new Date(create).getSeconds();//秒
    var day = new Date(create).getDate(); //日
    var month = parseInt(new Date(create).getMonth()) + 1;//月
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
        time: h + '小时' + m + '分' + s + '秒'
      })
      setTimeout(this.countTime, 1000);
    } else {
      console.log(1)
      this.setData({
        time: 0
      })
      var self = this;
      clearTimeout(this.countTime);//解除
      wx.showModal({
        title: '提示',
        content: '订单已取消',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            self.cancel();
          }
        }
      })

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
        notify_url: 'http://apptest.izxcs.com:81/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult',
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
  },
  // 获取服务器当前时间
  getData: function () {
    app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
      if (res.data) {
        this.setData({
          nowTime: res.data.data
        })
      }
      var now = Date.parse(this.data.nowTime);
      var endTime = Date.parse(this.data.groupEndTime);
      console.log('服务器当前时间：  '+this.data.nowTime);
      console.log('拼单结束时间：  '+this.data.groupEndTime);
      var leftTime = parseInt(endTime) - parseInt(now);
      var d, h, m, s;
      if (leftTime >= 0) {
        d = Math.floor(leftTime / 1000 / 60 / 60 / 24);
        h = Math.floor(leftTime / 1000 / 60 / 60 % 24);
        m = Math.floor(leftTime / 1000 / 60 % 60);
        s = Math.floor(leftTime / 1000 % 60);
        this.setData({
          spellLeftTime: h + '小时' + m + '分' + s + '秒'
        })
        setTimeout(this.countTime, 1000);
      } else {
        this.setData({
          spellLeftTime: 0
        })
        var self = this;
        clearTimeout(this.count);//解除
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  // 邀请好友拼单
  onShareAppMessage: function (res) {
    return {
      title: this.data.goodsName,
      desc: this.data.goodsName
    }
  },
  // 查看拼单详情
  openDetail:function(){
    wx.navigateTo({
      url: '../../spelldetails/spelldetails?groupId=' + this.data.groupId + '&orderNo=' + this.data.orderNo + '&shopId=' + this.data.shopId + '&cUser=' + this.data.userid
    })
  }
  
})