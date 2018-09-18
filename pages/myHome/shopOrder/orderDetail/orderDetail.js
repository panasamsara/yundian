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
    merchantId: '',
    showCard: false, //是否显示会员选择区
    cShadeifshow: true, //选择会员卡下方黑色遮罩
    cardpop: true,
    cardList: '',
    selectMember: 0, //页面跳转传参判断是否显示会员选择
    ifSelectCard: true,
    hasdiscount: true, //是否有选择会员卡
    hasdisnumber: true,//是否折扣100%,默认为true，折扣为非100%
    hasDiscountPrice: false,
    actualPay: '',
    card: '请选择会员卡',
    discountDerate: '',
    memberDerate: '',
    totalAccout: '0.00',  //已优惠金额
    principal: '',
    principalFormat: '',
    shadeIfshow: true,
    ispayCard: true,
    payway: '',
    paywayshow: false,
    limitBalance: 0, //0不限方式消费 1仅限会员卡余额消费
    userCardPayWay: 0, //0 选择会员卡后 ==>使用会员卡余额支付  1 后使用微信支付 
    payStatus: 0,
    statuHid: true,
    statuHids: true,
    shopLogoUrl: '',
    price: '',
    usecard:false,
  },
  onLoad: function (options) {
    console.log(options);
    var shop = wx.getStorageSync('shop');
    this.setData({
      activeIndex: options.activeIndex,
      shopId: shop.id,
      userId: options.userId,
      presaleId: options.presaleId,
      facilityId: options.facilityId,
      selectMember: options.selectMember
    })

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

  },
  onShow: function (e) {
    // debugger
    this.getusercard();
    this.getInfo();
    var _this = this
    wx.onSocketMessage(function (res) {
      var msg = res.data
      if (msg && msg.length >= 5 && msg.substring(msg.length - 5) == '_over') {

      } else if (msg && msg.substring(msg.length - 3) == '已下单') {

      }
    })
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
    this.setData({
      flagOrder: true
    })
  },
  goOn: function (e) { //继续添加
    var facilityId = e.currentTarget.dataset.facilityid,
      presaleId = e.currentTarget.dataset.no,
      userId = e.currentTarget.dataset.userid,
      shopId = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: "../../../../packageOffline/pages/proList/proList?discount=" + this.data.discount
    });
  },
  buyOrder: function (e) { //结算支付
    var code = e.currentTarget.dataset.no;//订单编号
    var name = e.currentTarget.dataset.name;//商品名
    var shopid = e.currentTarget.dataset.shopid;

    if (this.data.subaccountId) {
      this.setData({
        shadeIfshow: false,
        ispayCard: false
      })
      this.getShopsPayway();
    } else {
      this.bindTestCreateOrder(code, name, this.data.actualPay, shopid);
    }
  },
  bindTestCreateOrder: function (code, name, price, shopid) {
    var data = {
      subject: name, //商品名
      shopId: shopid, //店铺id
      amount: price,
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
      // debugger;

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
            that.sendMessage();
            console.log("支付成功")
            // 支付成功 发socket消息
            wx.sendSocketMessage({
              data: code + ',over'
            })
            that.setData({
              flagOrder: false,
              shadeIfshow: false
            })
            that.closePaycard();
            that.getInfo()
            
          },
          'fail': function (res) {
            // 支付成功 发socket消息
            wx.sendSocketMessage({
              data: code + ',over'
            })
            that.getInfo()
          },
          'complete': function (res) {
            console.log(res);
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
  // 支付成功推送消息
  sendMessage: function () {
    //获取订单详情
    app.util.reqAsync('shop/getRoomIdSendMessage', {
      orderNo: this.data.presaleId,
      shopId: this.data.shopId,
      userCode: wx.getStorageSync('scSysUser').usercode,
      type: 1
    }).then((res) => {

    }).catch((err) => {
      wx.showToast({
        title: '',
        icon: 'none'
      })
    })
  },
  getInfo: function () {

    console.log("getInfo================================>")
    this.setData({
      hidden: false
    })
    this.getPresale(this.data.presaleId, 1, true);
  },
  // orderid 订单id，actualprice 实际需支付金额,sign是否为暂不选择会员卡，0 暂不选择会员卡 1选择会员卡
  getPresale: function (orderid, sign, flag) {
    var sign = sign;
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');

    console.log("getPresale================================>")
    app.util.reqAsync('shopOrder/getPresaleByCondition', {
      shopId: this.data.shopId,
      userId: wx.getStorageSync('hostId'),
      // userId: this.data.userId,
      presaleId: orderid, //订单id
      facilityId: this.data.facilityId
    }).then((res) => {
      if (res.data.code == 1) {
        this.setData({
          facilityName: res.data.data.facilityName,
          shopName: res.data.data.shopName,
          scPresaleInfoList: res.data.data.scPresaleInfoList,
          shouldPay: res.data.data.shouldPay,
          actualPay: res.data.data.actualPay.toFixed(2),
          total: res.data.data.scPresaleInfoList.length,
          memberId: res.data.data.memberId,
          subaccountId: res.data.data.subaccountId,
          discount: res.data.data.discount,
          orderStatus: res.data.data.orderStatus,
          hidden: true,
          discountDerate: res.data.data.discountDerate.toFixed(2),
          memberDerate: res.data.data.memberDerate.toFixed(2),
          shopLogoUrl: res.data.data.shopLogoUrl || '',
          totalAccout: (Number(res.data.data.discountDerate.toFixed(2)) + Number(res.data.data.memberDerate.toFixed(2))).toFixed
        })
        console.log("shouldPay===============>" + this.data.shouldPay)
        for (var i in this.data.scPresaleInfoList) {
          // 重置留店商品价格
          if (this.data.scPresaleInfoList[i].purchaseType == 6) {
            this.data.scPresaleInfoList[i].unitPrice = 0;
            this.data.scPresaleInfoList[i].preferentialAmount = 0;
          }
          this.data.scPresaleInfoList[i].unitPrice = Number(this.data.scPresaleInfoList[i].unitPrice).toFixed(2);
          if (this.data.scPresaleInfoList[i].preferentialAmount) {
            this.data.scPresaleInfoList[i].preferentialAmount = Number(this.data.scPresaleInfoList[i].preferentialAmount).toFixed(2);
          }
          // 是否有折扣商品，有则显示指定商品优惠
          if (this.data.scPresaleInfoList[i].enableType == 1) {
            var enList = [];
            enList.push(this.data.scPresaleInfoList[i]);
            console.log(enList)
            if (enList.length >= 1) {
              this.setData({
                hasDiscountPrice: true
              })
            }
          }
        }
        // 判断会员卡余额是否充足
        if (this.data.cardlist) {
          for (var j in this.data.cardlist) {
            if (this.data.cardlist[j].principal <= 0) {
              this.data.cardlist[j].ishort = 0   // 1 会员卡余额充足  0 余额不足
            }
          }
        }
        this.setData({
          cardlist: this.data.cardlist || '',
          scPresaleInfoList: this.data.scPresaleInfoList
        })
        //判断订单当前是否有打折
        // debugger;
        if (!this.data.usecard) {
          this.setData({
            hasdiscount: false,
            hasdisnumber: true
          })
        } else {
          this.setData({
            hasdiscount: true,
            hasdisnumber: true
          })
        }
        console.log(res.data.data.payStatus == 5)
        //状态为5按钮变为立即结算
      
        if (res.data.data.payStatus == 5) {
          // debugger
         
          this.setData({
            statuHid: true,
            statuHids: false,
            payStatus: res.data.data.payStatus
          })
        } else {
          this.setData({
            statuHid: false,
            statuHids: true,
            payStatus: res.data.data.payStatus
          })
        }
        if (sign == 1) {
          // 判断默认是否有选择会员卡
          var businname = '', discountFormat = '', principalFormat = '', principal = '';
          if (res.data.data.subaccountId) {
            console.log("有会员卡====================>" + res.data.data.subaccountId)
            console.log(this.data.cardlist)
            if (this.data.cardlist) {
              for (var i in this.data.cardlist) {
                if (this.data.cardlist[i].id == res.data.data.subaccountId) {
                  businname = this.data.cardlist[i].businessName;
                  discountFormat = this.data.cardlist[i].discountFormat;
                  principalFormat = this.data.cardlist[i].principalFormat;
                  principal = this.data.cardlist[i].principal
                }
              }
            }
            //判断折扣后的会员卡余额是否充足
            // debugger
            if (flag) {
              app.util.reqAsync('shop/updateShopOrderMoney', {
                subaccountId: res.data.data.subaccountId,  //子账户主键
                discount: res.data.data.discount,  //会员折扣
                customerId: user.id,  //用户id
                memberMoney: this.data.actualPay, //应支付总金额
                shopId: this.data.shopId || shop.id,  //店铺id
                presaleId: this.data.presaleId  //店内订单id
              }).then((resdata) => {
                if (resdata.data.code == 1) {

                  console.log(resdata.data.data.price)
                  var price = resdata.data.data.price;
                  var orderId = resdata.data.data.orderId;
                  this.getPresale(orderId, 1, false);

                  // this.getPresale(orderId, 1);
                  // if (discount!=100){
                  // this.setData({
                  //   hasdiscount: true,
                  //   hasdisnumber:true,
                  //   price: price
                  // })
                  // }
                  // debugger;

                  if (resdata.data.data.price != 0) {
                    // debugger
                    var reducedata = (Number(this.data.shouldPay) - Number(resdata.data.data.price)).toFixed(2);
                    console.log(reducedata)
                    if (resdata.data.data.price <= principal) {
                      this.setData({
                        hasdiscount: true,
                        hasdisnumber: true,
                        price: price,
                        totalAccout: reducedata,
                        usecard:true,
                        hasdiscount: true,
                        hasdisnumber: true

                      })
                      // if ( !this.data.usecard) {
                      //   this.setData({
                      //     hasdiscount: false,
                      //     hasdisnumber: true
                      //   })
                      // } else {
                        // this.setData({
                        //   hasdiscount: true,
                        //   hasdisnumber: true
                        // })
                      // }
                    } else {
                      wx.showToast({
                        title: "此卡余额不足，暂时无法使用",
                        icon: 'none'
                      })

                    }
                  } else {
                    if (this.data.shouldPay <= principal) {
                      this.setData({
                        hasdiscount: true,
                        hasdisnumber: true,
                        price: price,
                        usecard:true,
                        totalAccout: this.data.shouldPay
                      })
                    } else {
                      wx.showToast({
                        title: "此卡余额不足，暂时无法使用",
                        icon: 'none'
                      })
                      this.setData({
                        card: "请选择会员卡",
                        usecard: false,
                        hasdiscount: false,
                        hasdisnumber: true,
                      })
                    }
                    // this.setData({
                    //   totalAccout: this.data.shouldPay
                    // })
                  }

                  this.setData({
                    card: businname,
                    actualPay: Number(price).toFixed(2),
                    principal: principal,
                    principalFormat: principalFormat,
                    cShadeifshow: true,
                    cardpop: true,
                    // discount: this.data.discount
                  })
                  if (discountFormat != 10) {
                    this.setData({
                      usecard: true
                    })
                  }
                } else if (resdata.data.code == 9 && resdata.data.msg == '当前会员卡余额不足 ') {
                  // debugger;
                  this.nouseCard()

                  this.setData({
                    card: "请选择会员卡",
                    usecard: false
                  })
                  wx.showToast({
                    title: resdata.data.msg,
                    icon: 'none'
                  })
                } else {
                  wx.showToast({
                    title: resdata.data.msg,
                    icon: 'none'
                  })
                }
              }).catch((err) => {
                // debugger
                console.log(err)
                wx.showToast({
                  title: '',
                  icon: 'none'
                })
              })
            }

            console.log("会员卡名称====================>" + businname)
            this.setData({
              card: businname,
              principalFormat: principalFormat
            })
          } else {
            console.log("无会员卡")
            // debugger
            if (res.data.data.payStatus == 5 || res.data.data.payStatus == 1) {
              this.setData({
                showCard: false
              })
            }else{
              this.setData({
                showCard: true
              })
            }
            this.setData({
              card: "请选择会员卡",
              usecard: false
              // showCard: false
              
            })
          }
        } else {
          console.log("暂不使用会员卡")
          this.setData({
            card: "暂不使用会员卡",
            usecard: false
          })
        }

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
        title: err,
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
    this.setData({
      showCard: true
    })
  },
  // 店内下单查询用户会员子账户
  opencard: function (e) {
    // debugger;
    if (this.data.orderStatus != 3 &&this.data.statuHids) {
      this.setData({
        cShadeifshow: false,
        cardpop: false
      })
    }else{
      return false;
    }
  },
  // 查询用户会员子账户
  getusercard: function () {
    console.log("getusercard================================>")
    var that = this;
    var shop = wx.getStorageSync('shop');
    var user = wx.getStorageSync('scSysUser');
    app.util.reqAsync('shop/getMemberInfoForOrder', {
      userId: that.data.userId || user.id,
      merchantId: that.data.merchantId || shop.merchantId
    }).then((res) => {
      if (res.data.code == 1) {
        if (res.data.data.length > 0) {
          // that.setData({
          //   showCard: true
          // })
          if (that.data.selectMember == 1) {
            that.setData({
              showCard: true
            })
          }
          var cardlist = new Array();
          for (var i = 0; i < res.data.data.length; i++) {
            res.data.data[i].principalFormat = Number(res.data.data[i].principal).toFixed(2);
            res.data.data[i].discountFormat = that.discountFormat(res.data.data[i].discount);
            var obj = {
              id: res.data.data[i].id,
              discount: res.data.data[i].discount,
              discountFormat: res.data.data[i].discountFormat,
              principal: res.data.data[i].principal,
              principalFormat: res.data.data[i].principalFormat,
              businessName: res.data.data[i].businessName,
              ishort: 1   // 1 会员卡余额充足  0 余额不足
            }
            cardlist.push(obj);
          }

          that.setData({
            cardlist: cardlist
          })
          console.log("会员卡列表==========>");
          console.log(this.data.cardlist);
          // // debugger
          // // for (var i in this.data.cardlist){
          // //   if (this.data.cardlist[i].id == this.data.subaccountId){
          // //     var businessname = this.data.cardlist[i].businessName
          // //   }
          // // }
          // this.setData({
          //   card: this.data.shopName + businname
          // })
        }
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      console.log(err)
      wx.showToast({
        title: '失败',
        icon: 'none'
      })
    })
  },
  closepop: function () {
    this.setData({
      cShadeifshow: true,
      cardpop: true
    })
  },
  // 金额格式化，保留2位小数
  getMoneyFormat: function (num) {
    var num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
      wx.showToast({
        title: '金额传参数有误',
        icon: 'none'
      })
    }
    var result = Math.round(num * 100) / 100;
    var xsd = result.toString().split(".");
    // console.log(xsd.length);
    if (xsd.length == 0) {
      var value = result.toString() + ".00";
      return value;
    }
    if (xsd.length == 1) {
      var value = xsd[0].toString() + ".00";
      return value;
    }
    if (xsd.length > 1) {
      if (xsd[1].length < 2) {
        var value = xsd[1].toString() + "0";
      }
      if (xsd[1].length == 2) {
        var value = result;
      }
      return value;
    }
  },
  // 折扣格式化
  discountFormat: function (num) {
    var num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
      wx.showToast({
        title: '金额传参数有误',
        icon: 'none'
      })
    }
    var result = num / 10;
    return result;
  },
  // 暂不使用会员卡
  nouseCard: function () {
    app.util.reqAsync('shop/updateShopOrderMoney', {
      subaccountId: 0,  //子账户主键
      discount: 100,  //会员折扣
      customerId: wx.getStorageSync('scSysUser').id,  //用户id
      memberMoney: this.data.actualPay, //应支付总金额
      shopId: this.data.shopId || wx.getStorageSync('shop').id,  //店铺id
      presaleId: this.data.presaleId  //店内订单id
    }).then((res) => {
      if (res.data.code == 1) {
        this.closeSelCard()
        this.setData({
          shouldPay: res.data.data.price,
          card: '暂不使用会员卡',
          hasdiscount: false,
          hasdisnumber: false,
          usecard:false
        })
        console.log(this.data.hasdiscount)
        this.getPresale(res.data.data.orderId, 0, false);
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '',
        icon: 'none'
      })
    })
  },
  // 选择会员卡判断优惠后余额是否足够
  iuseCard: function (e) {
    // debugger
    var cardData = e.currentTarget.dataset.card;

    var id = cardData.id;// e.currentTarget.id.split('_')[1];
    var principal = cardData.principal;// e.currentTarget.id.split('_')[2];
    var principalFormat = cardData.principalFormat;// e.currentTarget.id.split('_')[3];
    var discount = cardData.discount;//e.currentTarget.id.split('_')[4];
    var discountFormat = cardData.discountFormat;// e.currentTarget.id.split('_')[5];
    var ishort = cardData.ishort;// e.currentTarget.id.split('_')[6];
    var businessname = e.currentTarget.dataset.businessname;
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    if (ishort == 1) {
      app.util.reqAsync('shop/updateShopOrderMoney', {
        subaccountId: id,  //子账户主键
        discount: discount,  //会员折扣
        customerId: user.id,  //用户id
        memberMoney: this.data.actualPay, //应支付总金额
        shopId: this.data.shopId || shop.id,  //店铺id
        presaleId: this.data.presaleId  //店内订单id
      }).then((res) => {
        
        if (res.data.code == 1) {
          console.log(res.data.data.price)
          var price = res.data.data.price;
          var orderId = res.data.data.orderId;
          this.getPresale(orderId, 1, false);
          // if (discount!=100){
          // this.setData({
          //   hasdiscount: true,
          //   hasdisnumber:true,
          //   price: price
          // })
          // }
          if (res.data.data.price != 0) {
            var reducedata = (Number(this.data.shouldPay) - Number(res.data.data.price)).toFixed(2);
            console.log(reducedata)
            if (res.data.data.price <= principal) {
              this.setData({
                price: price,
                totalAccout: reducedata
              })
            } else {
              wx.showToast({
                title: "此卡余额不足，暂时无法使用",
                icon: 'none'
              })
            }
          } else {
            if (this.data.shouldPay <= principal) {
              this.setData({
                price: price,
                totalAccout: this.data.shouldPay
              })
            } else {
              wx.showToast({
                title: "此卡余额不足，暂时无法使用",
                icon: 'none'
              })
            }

            // this.setData({
            //   totalAccout: this.data.shouldPay
            // })
          }
          // if ( !this.data.usecard) {
            // this.setData({
            //   hasdiscount: true,
            //   hasdisnumber: true
            // })
          // }

          if (price != 0) {
            var reducedata = Number(this.data.shouldPay) - Number(price);
            console.log(reducedata)
            this.setData({
              totalAccout: reducedata.toFixed(2)
            })
          } else {
            this.setData({
              totalAccout: (this.data.shouldPay).toFixed(2),
              hasdiscount: true,
              hasdisnumber: true
            })
          }
          this.setData({
            card: businessname,
            actualPay: Number(price).toFixed(2),
            principal: principal,
            principalFormat: principalFormat,
            cShadeifshow: true,
            cardpop: true,
            discount: discount
          })
          if (discountFormat) {
            this.setData({
              usecard: true,
              hasdiscount: true,
              hasdisnumber: true
            })
          }
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }).catch((err) => {
        console.log(err)
        wx.showToast({
          title: '',
          icon: 'none'
        })
      })
    } else {
      wx.showToast({
        title: "此卡余额不足，暂时无法使用",
        icon: 'none'
      })
      this.closeSelCard();
    }
  },
  // 关闭会员卡列表
  closeSelCard: function () {
    this.setData({
      cShadeifshow: true,
      cardpop: true
    })
  },
  // 关闭会员卡支付
  closePaycard: function () {
    this.setData({
      shadeIfshow: true,
      ispayCard: true
    })
  },
  // 判断使用会员卡，商家是否限制消费方式
  getShopsPayway: function () {
    console.log("获取商家是否限制消费方式")
    app.util.reqAsync('shop/getLimitBalanceCheckout', {
      subaccountId: this.data.subaccountId //int 会员卡id
    }).then((res) => {
      console.log(res)
      if (res.data.code == 1) {
        this.setData({
          limitBalance: res.data.data.limitBalance   // 0不限方式消费 1仅限会员卡余额消费 
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '',
        icon: 'none'
      })
    })
  },
  // 选用会员卡后更换支付方式
  UserCardchangePayway: function (e) {
    if (this.data.limitBalance) {
      return false
    }
    var userCardPayWay = this.data.userCardPayWay;
    if (userCardPayWay == 0) {
      this.setData({
        userCardPayWay: 1
      })
    } else {
      this.setData({
        userCardPayWay: 0
      })
    }
    console.log("userCardPayWay=====>" + this.data.userCardPayWay + "limitBalance=========> " + this.data.limitBalance)
  },
  // 确定支付
  confirmPay: function () {
    var userCardPayWay = this.data.userCardPayWay;
    var presaleId = this.data.presaleId;
    var purchaseName = this.data.scPresaleInfoList[0].purchaseName;
    var shopId = this.data.shopid || wx.getStorageSync('shop').id;

    // 0 会员卡余额支付
    if (userCardPayWay == 0) {
      console.log("会员卡余额支付=======================")

      app.util.reqAsync('shop/checkoutMiniProgram', {
        presaleId: this.data.presaleId, //int 店内订单主键
        orderMoney: this.data.actualPay //double 订单实际支付金额
      }).then((res) => {
        console.log(res.data.code)
        if (res.data.code == 1) {
          this.setData({
            flagOrder: false,
            showCard: false,
            payway: "会员卡",
            paywayshow: true
          })
          this.getusercard();
          this.closePaycard();
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
          this.closePaycard();
        }
      }).catch((err) => {
        wx.showToast({
          title: '',
          icon: 'none'
        })
      })
    }
    // 1 微信支付
    else if (userCardPayWay == 1) {
      console.log("微信支付=======================" + this.data.actualPay)
      // debugger;
      this.bindTestCreateOrder(presaleId, purchaseName, this.data.actualPay, shopId);
    }
  },
  myCatchTouch: function () {
    console.log("阻止下方页面滚动");
    return;
  },
  // closeMask:function(){
  //   this.setData({
  //     ispayCard:true
  //   })
  // }
})