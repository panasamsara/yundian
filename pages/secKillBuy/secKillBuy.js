//获取应用实例
const app = getApp();
Page({
  data: {
    array: ['快递配送', '自提'],
    isService: 0, //0只有商品没有服务 1有服务
    isSend: 0,//0-快递  1-店内下单 2-自提
    shopName: '',
    shopId: '',
    customerId: '',//用户id
    areaId: '',//地区主键
    cityId: '',//城市主键
    provinceId: '',//省id
    address: '',//地址
    merchantId: '',//商户id
    totalMoney: 0, //合计(不加运费的总价)
    oldTotal: 0,//实际支付
    showLoading: true,
    deliveryMoney: 0, //运费
    deliveyArr: [],//运费数组
    isPay: 0,//是否微信支付（0未支付1-成功2-失败）
    secondskillActivityId: '',//秒杀id
    customerId: "",
    userCode: '',
    objectArray: [
      {
        id: 0,
        name: '快递配送'
      },
      {
        id: 2,
        name: '自提'
      }
    ],
    index: 0,
    total: 1,
    flag: true,
    flagOrder: true,
    userInfo: [],
    goods: [{
      goodsId: '',
      goodsType: '',
      remake: '',
      stockId: '',
      goodsName: '',
      stockName: '',
      goodsPrice: '',
      goodsNum: '',
      pictureUrl: ''
    }],
    contactMobile: '',
    contactName: '',
    username: '',
    areaName: '',
    cityName: '',
    ProvinceName: '',
    shopProvince: '',//店铺省id
    shopArea: '',//店铺区id
    shopCity: '',//店铺市id
    notInCityPrice: '',  //异城运费相关
    inCityPrice: '', //同城不同区运费
    inCityPriceDetails: '',//同城区列表
    isSeckill: '', //拼团还是秒杀
    groupId: '',//不拼团就传0  拼团传拼团id
    smallGroupId: '',// 参与拼团要传，秒杀传0就OK
    orderNo: '',//最后生成的订单号
    spellingType: '',//拼团订单0：拼主 1：参与拼团
    sure: false,
    sures: true
  },
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var ispay = wx.getStorageSync('isPay') || 0;
    var userid = wx.getStorageSync('scSysUser').id;
    var shopid = wx.getStorageSync('shop').id;
    var username = wx.getStorageSync('scSysUser').username;
    var userCode = wx.getStorageSync('scSysUser').usercode;
    //获取商品
    var goodsId = options.goodsId;
    var goodsType = options.goodsType; //（0 - 普通商品；1 - 服务；2 - 服务卡；3 - 服务套餐; 6 - 套盒）
    var remake = options.remake;
    var stockId = options.stockId;
    var goodsName = options.goodsName;
    var stockName = options.stockName;
    var goodsPrice = options.goodsPrice;
    var goodsNum = options.goodsNum;
    var pictureUrl = options.pictureUrl;
    var shopProvince = shop.provinceId;
    var shopArea = shop.areaId;
    var shopCity = shop.cityId;
    if (options.deliveryCalcContent == 'null') {
      var arr = 0;
    } else {
      var arr = JSON.parse(options.deliveryCalcContent);
    }

    var secondskillActivityId = options.secondskillActivityId || "";//秒杀id
    var shopName = shop.shopName;
    if (goodsType == 0) {
      var isService = 0
    } else {
      var isService = 1
    }
    console.log(options)

    this.setData({
      isService: isService, //0只有商品没有服务 1有服务
      spellingType: options.spellingType || "",
      isSeckill: options.isSeckill,//1秒杀 0拼团
      groupId: options.groupId || 0,//不拼团就传0  拼团传拼团id
      smallGroupId: options.SmallGroupId || 0,// 参与拼团要传，秒杀传0就OK
      customerId: userid,
      shopName: shopName,
      shopId: shopid,
      username: username,
      userCode: userCode,
      shopProvince: shopProvince,
      shopArea: shopArea,
      shopCity: shopCity,
      deliveyArr: arr,
      secondskillActivityId: secondskillActivityId,
      goods: [{
        goodsId: goodsId,
        goodsType: goodsType,
        remake: remake,
        stockId: stockId,
        goodsName: goodsName,
        stockName: stockName,
        goodsPrice: goodsPrice,
        goodsNum: goodsNum,
        pictureUrl: pictureUrl
      }],
    })
    if (arr != 0) {
      console.log(typeof (arr))
      this.setData({
        notInCityPrice: arr.notInCityPrice,
        inCityPrice: arr.inCityPrice,
        inCityPriceDetails: arr.inCityPriceDetails
      })
    } else {
      this.setData({
        notInCityPrice: '',
        inCityPrice: '',
        inCityPriceDetails: ''
      })
    }
    console.log("134")
    console.log(arr)

    //获取地址
    app.util.reqAsync('shop/getMyAddressAndCoupon', {
      customerId: this.data.customerId,
      shopId: this.data.shopId
    }).then((data) => {
      this.setData({
        userInfo: data.data.data
      })
      if (data.data.data.recvAddress) {
        var areaName = app.util.area.getAreaNameByCode(data.data.data.recvAddress.areaId);
        var cityName = app.util.area.getAreaNameByCode(data.data.data.recvAddress.cityId);
        var ProvinceName = app.util.area.getAreaNameByCode(data.data.data.recvAddress.provinceId);
        this.setData({
          areaId: data.data.data.recvAddress.areaId,//地区主键
          cityId: data.data.data.recvAddress.cityId,//城市主键
          provinceId: data.data.data.recvAddress.provinceId,//省id
          address: data.data.data.recvAddress.address,//地址
          contactMobile: data.data.data.recvAddress.phone, //收货人
          contactName: data.data.data.recvAddress.name, //电话
          areaName: areaName,
          cityName: cityName,
          ProvinceName: ProvinceName
        })
      } else {
        this.setData({
          areaId: "",//地区主键
          cityId: "",//城市主键
          provinceId: "",//省id
          address: "",//地址
          contactMobile: '',
          contactName: '',
          areaName: '',
          cityName: '',
          ProvinceName: ''
        })
      }

    }).catch((err) => {

      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
    this.setData({
      totalMoney: options.realMoney, //总价不加运费
      oldTotal: options.realMoney //实际支付，要加运费的（目前还未加运费）
    });
  },
  onShow: function (e) {
    //获取地址
    app.util.reqAsync('shop/getMyAddressAndCoupon', {
      customerId: this.data.customerId,
      shopId: this.data.shopId
    }).then((data) => {
      this.setData({
        userInfo: data.data.data
      })
      var adrs = data.data.data.recvAddress || ""
      if (adrs != "") {
        var areaName = app.util.area.getAreaNameByCode(data.data.data.recvAddress.areaId);
        var cityName = app.util.area.getAreaNameByCode(data.data.data.recvAddress.cityId);
        var ProvinceName = app.util.area.getAreaNameByCode(data.data.data.recvAddress.provinceId);
        this.setData({
          areaId: data.data.data.recvAddress.areaId,//地区主键
          cityId: data.data.data.recvAddress.cityId,//城市主键
          provinceId: data.data.data.recvAddress.provinceId,//省id
          address: data.data.data.recvAddress.address,//地址
          contactMobile: data.data.data.recvAddress.phone, //收货人
          contactName: data.data.data.recvAddress.name, //电话
          areaName: areaName,
          cityName: cityName,
          ProvinceName: ProvinceName
        })
      } else {
        this.setData({
          areaId: "",//地区主键
          cityId: "",//城市主键
          provinceId: "",//省id
          address: "",//地址
          contactMobile: '',
          contactName: '',
          areaName: '',
          cityName: '',
          ProvinceName: ''
        })
      }

      this.setData({
        isSend: this.data.isSend,//0-快递  1-店内下单 2-自提
        shopName: this.data.shopName,
        shopId: this.data.shopId,
        customerId: this.data.customerId,//用户id
        areaId: this.data.areaId,//地区主键
        cityId: this.data.cityId,//城市主键
        provinceId: this.data.provinceId,//省id
        address: this.data.address,//地址
        merchantId: this.data.merchantId,//商户id
        totalMoney: this.data.totalMoney, //合计
        oldTotal: this.data.oldTotal,//实际支付
        isPay: this.data.isPay,//是否微信支付（0未支付1-成功2-失败）
        customerId: this.data.customerId,
        total: this.data.total,
        flag: this.data.flag,
        flagOrder: this.data.flagOrder,
        userInfo: this.data.userInfo,
        goods: this.data.goods,
        contactMobile: this.data.contactMobile,
        contactName: this.data.contactName
      })
      //判断是普通商品还是服务
      if (this.data.isService == 0) {  //普通商品

        this.deliveryMone();//计算快递费

      } else {
        this.setData({
          isSend: 2,//0-快递  1-店内下单 2-自提
          array: ['自提'],
          isService: 1, //0只有商品没有服务 1有服务
          objectArray: [
            {
              id: 1,
              name: '自提'
            }
          ],
          index: 0
        })
      }


    })
    console.log(this.data.goods)
  },
  deliveryMone: function () {
    //计算运费
    if (this.data.isSend == 0) {
      var darr = this.data.deliveyArr;
      console.log(darr)
      if (darr != 0) {
        console.log(1)
        //比较是否在一个省
        if (this.data.provinceId == this.data.shopProvince) {  //在一个省
          if (this.data.cityId == this.data.shopCity) { //同一个市
            var detail = darr.inCityPriceDetails;
            var flagos = false; //默认不匹配区
            for (var k in detail) {
              if (this.data.areaId == detail[k].area) {
                flagos = true;
                console.log('匹配的区')
                this.setData({
                  deliveryMoney: darr.inCityPriceDetails[k].areaPrice
                })
                break;
              }
            }
            if (flagos == false) { //无匹配的区
              console.log('无匹配的区')
              this.setData({
                deliveryMoney: darr.inCityPrice
              })
            }

          } else { //不在一市
            console.log('不在一个市')
            this.setData({
              deliveryMoney: darr.notInCityPrice
            })
          }
        } else { //不在一个省
          console.log('不在一个省')
          this.setData({
            deliveryMoney: darr.notInCityPrice
          })
        }

      } else {
        this.setData({
          deliveryMoney: 0
        })
      }
      //加了运费之后的总合计
      var summoney = Number(this.data.deliveryMoney) + Number(this.data.totalMoney)
      this.setData({
        oldTotal: (summoney).toFixed(2)
      })
    } else {
      this.setData({
        oldTotal: this.data.totalMoney
      })
    }

  },
  addressSkip: function (e) {
    //跳到地址管理
    wx.navigateTo({
      url: '../../packageMyHome/pages/address/index/list?id=' + this.data.customerId + '&select=' + 1
    })
  },
  bindPickerChange: function (e) {
    var val = e.target.dataset.val,
      inx = e.detail.value;
    if (val[inx] == "快递配送") {
      //选择购买方式
      this.setData({
        index: e.detail.value,
        isSend: 0
      })
    } else {
      this.setData({
        index: e.detail.value,
        isSend: 2
      })
    }
    this.deliveryMone();
  },
  sum: function () {
    this.data.totalMoney = 0;
    console.log(this.data.goods)
    //合计
    for (var i = 0; i < this.data.goods.length; i++) {
      console.log(Number(this.data.goods[i].goodsPrice));

      console.log(Number(this.data.goods[i].goodsNum));
      this.data.totalMoney = this.data.totalMoney + (Number(this.data.goods[i].goodsPrice) * Number(this.data.goods[i].goodsNum));

    };
    this.setData({
      goods: this.data.goods,
      totalMoney: this.data.totalMoney
    });
    this.deliveryMone();
  },
  goShop: function (e) {
    wx.setStorageSync('isPay', 0);
    this.setData({
      flagOrder: true
    })
    wx.switchTab({
      url: '../proList/proList'
    });
  },
  look: function (e) {
    wx.setStorageSync('isPay', 0);
    this.setData({
      flagOrder: true
    })
    if (this.data.isSend == 1) { //店内下单
      //跳到店内下单
      wx.redirectTo({
        url: '../myHome/shopOrder/shopOrder'
      })
    } else {
      if (this.data.isSeckill == 1) {//秒杀
        //跳到线上订单
        wx.redirectTo({
          url: '../../../../../packageMyHome/pages/orderDetail/orderDetail?orderNo=' + this.data.orderNo + '&isGroupBuying=' + 0 + '&orderkind=' + 3
        })
      } else {
        //跳到线上订单
        wx.redirectTo({
          url: '../../../../../packageMyHome/pages/orderDetail/orderDetail?orderNo=' + this.data.orderNo + '&isGroupBuying=' + 1
        })
      }

    }

  },
  sumb: function (e) {
    //下单
    this.setData({
      goods: this.data.goods,
      showLoading: false
    });

    wx.setStorageSync('isPay', 0);
    //确认下单

    //判断是店内下单还是其他
    var isSd = this.data.isSend;
    if (isSd == 0) { //快递
      console.log("快递")
      // 地址是否为空
      var addre = this.data.address;
      if (addre == "") {
        wx.showToast({
          title: '请先添加地址',
          icon: 'none'
        })
        return false;


      }
      this.setData({
        sure: true,
        sures: false
      })
      this.sumb1(1);
    } else { //自取
      this.setData({
        sure: true,
        sures: false
      })
      console.log("自取")
      this.sumb1(1);
    }
  },
  sumb1: function (type) {
    console.log("快递或者自提")

    //快递或自提
    var goodsList = [];//店内下单商品传参
    var merchantId = this.data.merchantId;//商户主键
    var userName = this.data.username;//用户名
    var bussinessType = 1;
    if (this.data.isSend == 2) {
      var deliveryMoney = 0;
    } else {
      var deliveryMoney = this.data.deliveryMoney;//快递金额
    }

    console.log("快递金额" + deliveryMoney)
    // debugger
    if (this.data.oldTotal == "0" || this.data.oldTotal == "0.00") {//合计为0专用
      console.log("总价为0")
      var payStatus = 1;
    } else {
      console.log('总价不为0')
      var payStatus = this.data.isPay;//支付状态（未支付0，成功1，失败2）
    }


    if (this.data.isSeckill == 1) { //秒杀
      for (var i in this.data.goods) {

        var goos = this.data.goods[i];
        goodsList.push({
          goodsId: goos.goodsId,
          goodsPrice: goos.goodsPrice,
          goodsType: goos.goodsType,
          remake: goos.remake,
          stockId: goos.stockId,
          goodsName: goos.goodsName,
          stockName: goos.stockName,
          goodsPrice: goos.goodsPrice,
          goodsNum: goos.goodsNum,
          pictureUrl: goos.pictureUrl
        });
      }

      app.util.reqAsync('shopSecondskilActivity/saveSecondskillOrder', {
        secondskillActivityId: this.data.secondskillActivityId, //秒杀id
        payType: 3, //支付方式 （货到付款0，在线支付1，支付宝支付2，微信支付3）
        customerId: this.data.customerId, //顾客id
        shopId: this.data.shopId, //店铺id
        merchantId: merchantId,//商户id
        deliveryType: this.data.isSend,//配送方式(0-快递；1-送货上门；2-自取)
        deliveryTime: 0, //送货时间(0-不限，1只工作日送货，2-工作日不送货)
        deliveryMoney: deliveryMoney,
        shopOrderItemList: goodsList,
        amount: this.data.totalMoney,   //所有商品总价加运费（后来又说不加运费）
        source: "MOBILE",//订单来源
        address: this.data.address,
        contactName: this.data.contactName,
        contactMobile: this.data.contactMobile,
        bussinessId: this.data.shopId,
        bussinessType: 15,//秒杀15，拼团16
        extend4: '129',//版本
        groupId: 0, //不拼团就传0  拼团传拼团id
        smallGroupId: 0,//参与拼团要传，秒杀传0就OK
        payStatus: payStatus,//支付状态 
        realMoney: this.data.oldTotal,//所有商品总价 不加运费的（后来又说加运费）
        areaId: this.data.areaId,
        provinceId: this.data.provinceId,
        cityId: this.data.cityId
      }).then((res) => {
        this.setData({
          showLoading: true
        })
        if (res.data.code == 1) {
          this.setData({
            orderNo: res.data.data //生成订单号
          })
          if (this.data.oldTotal == "0.00" || this.data.oldTotal == 0 || this.data.oldTotal == "0") {  //金额为0直接成功下单绕过支付
            this.setData({
              flagOrder: false,
              isPay: 1
            })
          } else {
            if (type == 1) { //点击确认下单
              //微信支付弹窗
              var self = this;
              var dt = res.data.data;
              wx.showModal({
                title: '支付方式',
                content: '是否微信支付？',
                success: function (res) {
                  if (res.confirm) {
                    //用户点击确定（调微信支付接口）
                    self.setData({
                      showLoading: false
                    })
                    self.bindTestCreateOrder(dt);

                  } else if (res.cancel) {
                    //用户点击取消
                    wx.setStorageSync('isPay', 0);
                    self.setData({
                      isPay: 0
                    })

                    wx.navigateBack({ changed: true });//返回上一页

                  }
                }
              })
            }
          }

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          this.setData({
            sure: false,
            sures: true
          })
        }

      })

    } else { //拼团
      for (var i in this.data.goods) {

        var goos = this.data.goods[i];
        goodsList.push({
          goodsName: goos.goodsName,
          stockId: goos.stockId,
          goodsPic: goos.pictureUrl,
          goodsIndex: 0,
          balance: "",
          remake: goos.stockName,
          unitPrice: goos.goodsPrice,
          goodsId: goos.goodsId,
          goodsType: goos.goodsType,
          num: goos.goodsNum,
          goodsNum: goos.goodsNum,
          actualPayment: Number(goos.goodsPrice) * Number(goos.goodsNum),//实付单价
          goodsPrice: goos.goodsPrice,

        });
      }
      app.util.reqAsync('shop/submitOnlineOrderNew', {
        payType: 3, //支付方式 （货到付款0，在线支付1，支付宝支付2，微信支付3）
        customerId: this.data.customerId, //顾客id
        shopId: this.data.shopId, //店铺id
        merchantId: merchantId,//商户id
        deliveryType: this.data.isSend,//配送方式(0-快递；1-送货上门；2-自取)
        deliveryTime: 0, //送货时间(0-不限，1只工作日送货，2-工作日不送货)
        deliveryMoney: deliveryMoney,
        shopOrderItemList: goodsList,
        amount: this.data.totalMoney,   //所有商品总价加运费(后来又说是不加运费的)
        source: "MOBILE",//订单来源
        address: this.data.address,
        contactName: this.data.contactName,
        contactMobile: this.data.contactMobile,
        bussinessId: this.data.shopId,
        bussinessType: 16,
        extend4: '129',//版本
        groupId: this.data.groupId, //不拼团就传0  拼团传拼团id
        smallGroupId: this.data.smallGroupId,//参与拼团要传，秒杀传0就OK
        payStatus: payStatus,//支付状态 
        realMoney: this.data.oldTotal,//所有商品总价 不加运费的（后来又说是加了运费的）
        areaId: this.data.areaId,
        provinceId: this.data.provinceId,
        cityId: this.data.cityId,
        spellingType: this.data.spellingType //拼团订单0：拼主 1：参与拼团
      }).then((res) => {
        this.setData({
          showLoading: true
        })
        if (res.data.code == 1) {
          this.setData({
            orderNo: res.data.data //生成订单号
          })
          //先调拼团接口
          //this.groupBooking(res.data.data);



          if ((this.data.oldTotal == "0.00" || this.data.oldTotal == 0 || this.data.oldTotal == "0")) {  //金额为0直接成功下单绕过支付
            this.setData({
              flagOrder: false,
              isPay: 1
            })
          } else {
            if (type == 1) { //点击确认下单
              //微信支付弹窗
              var self = this;
              var dt = res.data.data;
              wx.showModal({
                title: '支付方式',
                content: '是否微信支付？',
                success: function (res) {
                  if (res.confirm) {
                    //用户点击确定（调微信支付接口）
                    self.setData({
                      showLoading: false
                    })
                    self.bindTestCreateOrder(dt);

                  } else if (res.cancel) {
                    //用户点击取消
                    wx.setStorageSync('isPay', 0);
                    self.setData({
                      isPay: 0
                    })

                    wx.navigateBack({ changed: true });//返回上一页

                  }
                }
              })
            }
          }

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          this.setData({
            sure: false,
            sures: true
          })
        }

      })
    }

  },
  // groupBooking:function(no){
  //   app.util.reqAsync('shop/insertSmallGroupYQ', {
  //     "groupId": this.data.groupId, //#拼团表id
  //     "type": this.data.spellingType,// #type:0创建拼组，1加入拼组
  //     "smallGroupId": this.data.smallGroupId,// #拼组表的id，当type为1的时候须传此参数否则无需传
  //     "orderId": no,// #订单号
  //     "cUser": this.data.customerId,//#参与用户者id
  //     "num": this.data.goods[0].goodsNum //#用户购买件数
  //   }).then((res) => {
  //     console.log(res)
  //       console.log("拼团成功")
  //    }).catch((err) => {
  //     wx.showToast({
  //       title: res.data.msg,
  //       icon: 'none'
  //     })
  //   })
  // },
  bindTestCreateOrder: function (code) {
    var data = {
      subject: this.data.goods[0].goodsName,
      requestBody: {
        body: '云店小程序普通订单',
        out_trade_no: code,
        //  notify_url: 'https://wxappprod.izxcs.com/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult',
        // notify_url: 'http://apptest.izxcs.com:81/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult',
        //  notify_url: app.globalData.notify_url,
        trade_type: 'JSAPI',
        openid: wx.getStorageSync('scSysUser').wxOpenId
      }
    };
    //发起网络请求 微信统一下单   
    app.util.reqAsync('payBoot/wx/pay/unifiedOrder', data).then((res) => {
      this.setData({
        showLoading: true
      })
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
            console.log('支付成功')
            self.getMessage(code);
            self.setData({
              flagOrder: false,
              isPay: 1
            })
          },
          'fail': function (res) {
            wx.setStorageSync('isPay', 0);
            //支付失败或者未支付跳到购物车
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
            self.setData({
              isPay: 0
            })
            setTimeout(function () {
              wx.navigateBack({ changed: true }, 3000);//返回上一页
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
  getMessage: function (no) {
    //支付成功调接口
    app.util.reqAsync('shop/getRoomIdSendMessage', {
      orderNo: no, //订单编号
      shopId: this.data.shopId, //店铺id
      userCode: this.data.userCode//云信账号
    }).then((data) => {
      if (data.data.code == 1) {

      } else {
        console.log(data.data.msg);
      }

    })
  }
})