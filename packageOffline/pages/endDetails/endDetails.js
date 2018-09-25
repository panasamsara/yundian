import util from '../../../utils/util.js';
var app = getApp();
Page({
  data: {
    orderList: [],
    flag: false, //手机系统是否是ios
    shopId: '',
    userId: '',
    presaleId: '', //订单id
    facilityId: '', //座位号
    facilityName: '',
    shopName: '',
    scPresaleInfoList: [],
    suPrice: 0,//有会员消费限制时的总价
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
    actualPay: '', //实付
    card: '请选择会员卡',
    discountDerate: '',
    memberDerate: '',
    totalAccout: 0,  //已优惠金额
    principal: '',
    principalFormat: '',
    shadeIfshow: true,
    ispayCard: true,
    payway: '',
    paywayshow: true,
    limitBalance: 0, //0不限方式消费 1仅限会员卡余额消费
    userCardPayWay: 0, //0 选择会员卡后 ==>使用会员卡余额支付  1 后使用微信支付 
    payStatus: 0,
    statuHid: true,
    statuHids: true,
    shopLogoUrl: '',
    price: '',
    accountInfo: {},//会员相关信息
    sumPrice: 0, //原价总和
    additionalMoney: 0, //附加餐费
    salesman: '',//服务员名字
    salesmanId: 0,//服务员id
    phone: 0, //用户手机号
    commodityGoods: [],//会员自带留店商品
    leaveGood: [],//下单超出的留店
    gradePrice: [], //会员价相关
    isMember: 0, //是否使用了会员卡 0-没使用 1- 使用
    newPrice: 0,//选用会员卡之后的实付
    hasMemberCard: true, //是否会员
    subaccountId: 0, //结算完再次查看订单时使用，看是否用了会员
    overCard: '',//结算完再次查看订单时用的会员名
    payStatus: ''
  },
  onLoad: function (options) {
    console.log(options);
    var shop = wx.getStorageSync('shop');
    var user = wx.getStorageSync('scSysUser');
    var facilityId = wx.getStorageSync('facilityId');
    this.setData({
      shopId: shop.id,
      userId: user.id,
      shopName: shop.shopName,
      presaleId: options.presaleId,
      //facilityId:1101,
      // phone:13612345678,
      facilityId: facilityId,
      merchantId: shop.merchantId,
      phone: user.phone,
      selectMember: options.selectMember || 1
    })
    this.getInfo();

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
  // onShow: function (e) {

  //   var _this = this
  //   wx.onSocketMessage(function (res) {
  //     // _this.onPullDownRefresh()
  //     _this.getInfo(); // 重新获取页面数据
  //     var msg = res.data
  //     if (msg && msg.length >= 5 && msg.substring(msg.length - 5) == '_over') {

  //     } else if (msg && msg.substring(msg.length - 3) == '已下单') {

  //     }
  //   })
  // },
  appSkip: function (e) { //点击跳转到app下载页
    wx.navigateTo({ url: "/pages/myHome/downLoadIos/downLoadIos?flag=" + this.data.flag });
  },
  offlineSkip: function (e) { //跳到云店首页
    wx.switchTab({ url: "../../../pages/index/index" });
  },
  goOn: function (e) { //继续添加
    var facilityId = e.currentTarget.dataset.facilityid,
      presaleId = e.currentTarget.dataset.no,
      userId = e.currentTarget.dataset.userid,
      shopId = e.currentTarget.dataset.shopid
    wx.navigateBack();
  },
  // buyOrder: function (e) { //结算支付
  //   console.log(this.data.scPresaleInfoList)
  //   var code = this.data.presaleId;//订单编号
  //   var name = this.data.scPresaleInfoList[0].purchaseName;//商品名
  //   var shopid = this.data.shopId;
  //   var isMember = this.data.isMember;
  //   if (isMember == 1) { //使用了会员卡
  //     var accountInfo = this.data.accountInfo;//会员相关信息
  //     var subaccountId = accountInfo.accountId || 3834;//会员id
  //     var supportLimitBalance = accountInfo[0].supportLimitBalance;  //1是会员价仅限余额支付，0是不限制(若为1只有会员卡选择才享受优惠，0都享受折扣)
  //     this.setData({
  //       shadeIfshow: false,
  //       ispayCard: false,
  //       limitBalance: supportLimitBalance   // 0不限方式消费 1仅限会员卡余额消费 
  //     })
  //   } else { //非会员
  //     this.bindTestCreateOrder(code, name, this.data.sumPrice, shopid);
  //   }
  // },
  // memberWecheat: function () {
  //   if (this.data.limitBalance) {
  //     if (this.data.limitBalance == 0) { //不限制会员消费
  //       var orderPay = this.data.newPrice;
  //     } else if (this.data.limitBalance == 1) { //限制
  //       var orderPay = this.data.sumPrice;
  //     }
  //   } else {
  //     var orderPay = this.data.sumPrice;
  //   }
  //   //用会员的时候选择微信支付
  //   app.util.reqAsync('foodBoot/wechat/verification', {
  //     "shopId": this.data.shopId, //店铺id
  //     "presaleId": this.data.presaleId, //订单id
  //     "memberId": this.data.accountInfo[0].accountId, //会员id
  //     "orderPay": orderPay, //支付金额
  //   }).then((res) => {
  //     if (res.data.code == 1) {
  //       if (this.data.limitBalance) {
  //         if (this.data.limitBalance == 0) { //不限制会员消费
  //           this.bindTestCreateOrder(this.data.presaleId, this.data.scPresaleInfoList[0].purchaseName, this.data.newPrice, this.data.shopId, this.data.accountInfo[0].accountId);
  //         } else if (this.data.limitBalance == 1) { //限制
  //           this.bindTestCreateOrder(this.data.presaleId, this.data.scPresaleInfoList[0].purchaseName, this.data.sumPrice, this.data.shopId);
  //         }
  //       } else {
  //         this.bindTestCreateOrder(this.data.presaleId, this.data.scPresaleInfoList[0].purchaseName, this.data.sumPrice, this.data.shopId);
  //       }

  //     } else {
  //       wx.showToast({
  //         title: res.data.msg,
  //         icon: 'none'
  //       })
  //     }

  //   })
  // },
  // bindTestCreateOrder: function (code, name, price, shopid, memberId) {
  //   var data = {
  //     subject: name, //商品名
  //     shopId: shopid, //店铺id
  //     amount: price,
  //     requestBody: {
  //       body: '云店小程序店内下单',
  //       out_trade_no: code, //订单编号
  //       trade_type: 'JSAPI',
  //       sub_openid: wx.getStorageSync('scSysUser').wxOpenId,
  //       memberId: memberId
  //     }
  //   };
  //   //发起网络请求 微信统一下单   
  //   util.reqAsync('payBoot/wx/pay/food/unifiedOrderInSpMode', data).then((res) => {
  //     console.log(res);


  //     if (res.data.code == 1) {
  //       //获取预支付信息
  //       var wxResult = res.data.data.wxResult;
  //       var prepayInfo = res.data.data.prepayInfo;
  //       //预支付参数
  //       var timeStamp = '';
  //       var nonceStr = '';
  //       var packages = '';
  //       var paySign = '';

  //       if (wxResult) {
  //         timeStamp = res.data.data.timeStamp;
  //         nonceStr = wxResult.nonceStr;
  //         packages = 'prepay_id=' + wxResult.prepayId;
  //         paySign = res.data.data.paySign;
  //       } else if (prepayInfo) {
  //         timeStamp = prepayInfo.timestamp;
  //         nonceStr = prepayInfo.nonceStr;
  //         packages = prepayInfo.packages;
  //         paySign = prepayInfo.paySign;
  //       }
  //       //发起支付
  //       var that = this;
  //       wx.requestPayment({
  //         'timeStamp': timeStamp,
  //         'nonceStr': nonceStr,
  //         'package': packages,
  //         'signType': 'MD5',
  //         'paySign': paySign,
  //         'success': function (res) {
  //           that.sendMessage();
  //           console.log("支付成功")

  //           // 支付成功 发socket消息
  //           wx.sendSocketMessage({
  //             data: code + ',over'
  //           })
  //           that.setData({
  //             flagOrder: false,
  //             shadeIfshow: false
  //           })
  //           that.closePaycard();
  //           that.getInfo()

  //         },
  //         'fail': function (res) {
  //           // 支付成功 发socket消息
  //           wx.sendSocketMessage({
  //             data: code + ',over'
  //           })
  //           that.getInfo()
  //         },
  //         'complete': function (res) {
  //           console.log(res);
  //         }
  //       })
  //     } else {
  //       if (res.data.data == 'overdue payment') {
  //         wx.showToast({
  //           title: res.data.msg,
  //           icon: 'none'
  //         })
  //         wx.navigateTo({
  //           url: "../proList/proList"
  //         });
  //       } else {
  //         wx.showToast({
  //           title: res.data.msg,
  //           icon: 'none'
  //         })
  //       }

  //     }

  //   })
  // },
  // 支付成功推送消息
  // sendMessage: function () {
  //   wx.removeStorageSync("orderNo");
  //   app.util.reqAsync('shop/getRoomIdSendMessage', {
  //     orderNo: this.data.presaleId,
  //     shopId: this.data.shopId,
  //     userCode: wx.getStorageSync('scSysUser').usercode,
  //     type: 1
  //   }).then((res) => {

  //   }).catch((err) => {
  //     wx.showToast({
  //       title: '',
  //       icon: 'none'
  //     })
  //   })
  // },
  getInfo: function () {
    console.log("getInfo================================>")
    this.setData({
      hidden: false
    })
    this.getPresale();
  },
  // orderid 订单id，actualprice 实际需支付金额,sign是否为暂不选择会员卡，0 暂不选择会员卡 1选择会员卡
  getPresale: function () {
    wx.showLoading({
      title: '加载中'
    })
    var facilityId = this.data.facilityId;
    app.util.reqAsync('foodBoot/findFoodPresale', {
      id: this.data.presaleId
    }).then((res) => {
      wx.hideLoading();
      if (res.data.code == 9) {
        if (res.data.msg == '此桌无未结算订单') {

        }
      } else if (res.data.code == 1) {
        var data = res.data.data;
        var actualPay = Number(data.actualPay) + Number(data.additionalMoney);
        this.setData({
          hidden: true,
          payStatus: data.payStatus,// 0-未完成支付（未处理） 1-已完成支付（已支付，全额付款时为已完成支付）新增状态：2-处理中（服务中）3-待支付（服务完成未支付）;4-(定金预售)已退定; 5-订单待支付(订单已提交给微信); 6-超时未支付',
          facilityName: data.title,
          orderStatus: data.orderStatus,//订单状态: 0-待处理；1-处理中；2-待结算；3-已结算； 4-已取消',
          actualPay: actualPay,
          additionalMoney: data.additionalMoney,
          totalAccout: 0, //会员折扣
          scPresaleInfoList: data.scPresaleInfos,
          presaleId: data.id,
          sumPrice: actualPay,
          subaccountId: data.subaccountId
        })
        if (data.payStatus == 5) {
          this.setData({
            statuHid: true,
            statuHids: false,
          })
        } else {
          this.setData({
            statuHid: false,
            statuHids: true,
          })
        }

        if (data.orderStatus == 3) { //已结算
          if (data.subaccountId == 0) { //没用会员
            this.setData({
              showCard: true
            })
          } else {
            this.setData({
              showCard: false
            })
          }
        } 
        this.getusercard();
      }

    })
  },
  // look: function (e) {
  //   //查看详情
  //   this.setData({
  //     flagOrder: true
  //   })
  //   this.getInfo();
  //   var hasMemberCard = this.data.hasMemberCard;
  //   if (hasMemberCard) { //是会员
  //     this.setData({
  //       showCard: false
  //     })
  //   } else {
  //     this.setData({
  //       showCard: true
  //     })
  //   }
  // },
  // 店内下单查询用户会员子账户
  opencard: function (e) {

    if (this.data.orderStatus != 3 && this.data.statuHids) {
      this.setData({
        cShadeifshow: false,
        cardpop: false
      })

    } else {
      return false;
    }
  },
  // 查询用户会员子账户
  getusercard: function () {
    console.log("getusercard================================>")
    var that = this;
    var shop = wx.getStorageSync('shop');
    var user = wx.getStorageSync('scSysUser');
    app.util.reqAsync('foodBoot/findStoreRetentionListsAndMembercard', {
      "shopId": this.data.shopId,   //店铺Id,
      "merchantId": this.data.merchantId,  //商户id
      "presaleId": this.data.presaleId,   //订单id
      "mobile": this.data.phone  //手机号码
    }).then((res) => {

      if (res.data.code == 1) {
        if (res.data.data) {
          if (res.data.data.accountList.length > 0) {
            console.log(res.data.data.accountList.length)
            that.setData({
              showCard: false,
              hasMemberCard: true
            })
            var cardlist = [];

            for (var i = 0; i < res.data.data.accountList.length; i++) {
              var data = res.data.data.accountList[i];
              if (data.status == 1) {

                data.principalFormat = Number(data.principal).toFixed(2);
                data.businessInfo.discountFormat = that.discountFormat(data.businessInfo.discount);
                if (this.data.actualPay <= data.principalFormat) {
                  var ishort = 1  //1 会员卡余额充足  0 余额不足
                } else {
                  var ishort = 0
                }
                if (data.businessInfo.discount == 100) {
                  var discount = '无'
                } else {
                  var discount = (data.businessInfo.discount) / 10
                }
                var obj = {
                  id: data.id,//子账户id
                  accountId: data.memberId, //会员id
                  accountName: data.accountName,//会员名
                  discount: discount,
                  discountFormat: data.businessInfo.discountFormat,
                  money: data.principal, //剩余金额
                  principalFormat: data.principalFormat,
                  actualPaymemnt: res.data.data.actualPaymemnt,//使用会员卡返参的实付
                  status: data.status,//子卡状态（1正常、2暂停、3销户）",
                  supportLimitBalance: data.businessInfo.supportLimitBalance,//是否有消费限制
                  ishort: ishort
                }
                cardlist.push(obj);
              }

            }
            that.setData({
              accountInfo: cardlist,
              gradePrice: res.data.data.accrecord
            })
            console.log(cardlist)
          }
          //会员卡留店商品
          var lgoods = [];
          for (var k = 0; k < res.data.data.goodsList.length; k++) {
            var leaveGoods = res.data.data.goodsList[k];
            if (leaveGoods.storeRetention == 1) { //0否1是
              lgoods.push(leaveGoods);
            }
          }
          that.setData({
            commodityGoods: lgoods
          })
        }
        /*这里要加留店商品判断包括刷新和结算后*/
        if (that.data.isMember == 1) { //使用了会员卡
          if (that.data.orderStatus != 3) {
            that.refreshCard(cardlist[0].accountName, cardlist[0].principalFormat);
          }

        }

        if (that.data.orderStatus == 3) { //已结算
          if (that.data.subaccountId == 0) { //没用会员
            that.setData({
              showCard: true
            })
          } else {
            for (var i = 0; i < cardlist.length; i++) { //已结算用了会员卡
              if (that.data.subaccountId == cardlist[i].id) {
                that.setData({
                  overCard: cardlist[i].accountName
                })
              }
            }
          }
        } else {
          that.setData({
            showCard: false,
            hasMemberCard: true
          })
        }
      } else {
        that.setData({
          showCard: true,
          hasMemberCard: false
        })
      }
    })
  },
  closepop: function () {
    this.setData({
      cShadeifshow: true,
      cardpop: true
    })
  },
  // 金额格式化，保留2位小数
  // getMoneyFormat: function (num) {
  //   var num = num.toString().replace(/\$|\,/g, '');
  //   if (isNaN(num)) {
  //     wx.showToast({
  //       title: '金额传参数有误',
  //       icon: 'none'
  //     })
  //   }
  //   var result = Math.round(num * 100) / 100;
  //   var xsd = result.toString().split(".");
  //   // console.log(xsd.length);
  //   if (xsd.length == 0) {
  //     var value = result.toString() + ".00";
  //     return value;
  //   }
  //   if (xsd.length == 1) {
  //     var value = xsd[0].toString() + ".00";
  //     return value;
  //   }
  //   if (xsd.length > 1) {
  //     if (xsd[1].length < 2) {
  //       var value = xsd[1].toString() + "0";
  //     }
  //     if (xsd[1].length == 2) {
  //       var value = result;
  //     }
  //     return value;
  //   }
  // },
  // 折扣格式化
  discountFormat: function (num) {
    var num = num.toString().replace(/\$|\,/g, '');
    if (isNaN(num)) {
      wx.showToast({
        title: '金额传参数有误',
        icon: 'none'
      })
    }
    var result = num / 100;
    return result;
  },
  // 暂不使用会员卡
  // nouseCard: function () {
  //   this.closeSelCard()
  //   this.setData({
  //     card: '暂不使用会员卡',
  //     hasdiscount: false,
  //     hasdisnumber: false,
  //     isMember: 0,
  //     leaveGood: []
  //   })
  //   this.getPresale();
  // },
  // sortBuy: function (id, obj1, obj2) {
  //   //数组排序
  //   var val1 = obj1.id;
  //   var val2 = obj2.id;
  //   if (val1 < val2) {
  //     return -1;
  //   } else if (val1 > val2) {
  //     return 1;
  //   } else {
  //     return 0;
  //   }
  // },
  // refreshCard: function (businessname, principalFormat) {
  //   console.log('使用了刷新')
  //   var businessname = businessname;
  //   //刷新时重新计算会员折扣
  //   var scPresaleInfoList = this.data.scPresaleInfoList;//商品列表
  //   var gradePrice = this.data.gradePrice;//会员价
  //   var commodityGoods = this.data.commodityGoods;//会员留店商品
  //   console.log(scPresaleInfoList)
  //   console.log(gradePrice)
  //   console.log(commodityGoods)
  //   var moreGoods = [];//超出剩余数量的留店商品，按会员价来
  //   if (this.data.isMember == 1) { //使用了会员卡
  //     for (var b = 0; b < scPresaleInfoList.length; b++) {
  //       scPresaleInfoList[b].gradePrice = gradePrice[b].gradePrice;
  //       scPresaleInfoList[b].presaleInfoId = gradePrice[b].presaleInfoId;

  //       for (var c = 0; c < commodityGoods.length; c++) { //留店商品减数量
  //         if (scPresaleInfoList[b].goodsServiceId == commodityGoods[c].goodsId) { //是留店商品
  //           console.log(scPresaleInfoList[b].purchaseName)
  //           if (Number(scPresaleInfoList[b].purchaseNum) - Number(commodityGoods[c].remainNum) <= 0) { //在剩余数量范围内
  //             console.log('未超出留店范围')
  //             scPresaleInfoList[b].gradePrice = 0;
  //             scPresaleInfoList[b].purchaseType = 6;
  //           } else { //超出剩余数量
  //             console.log("超出留店")
  //             var num = Number(scPresaleInfoList[b].purchaseNum) - Number(commodityGoods[c].remainNum);//超出的数量
  //             scPresaleInfoList[b].purchaseNum = num;
  //             scPresaleInfoList[b].gradePrice = (Number(scPresaleInfoList[b].gradePrice) / Number(scPresaleInfoList[b].purchaseNum)) * num
  //             moreGoods.push(scPresaleInfoList[b]);
  //             scPresaleInfoList[b].gradePrice = 0;
  //             scPresaleInfoList[b].purchaseType = 6;
  //           }

  //         }
  //       }
  //     }
  //     console.log("用完会员卡留店是否变化")
  //     console.log(scPresaleInfoList)
  //     var newPrice = 0;
  //     if (moreGoods && moreGoods.length > 0) { //留店有超出
  //       console.log("留店有超")
  //       var leaveGood = moreGoods;
  //       var newgooList = scPresaleInfoList.contact(moreGoods);
  //       for (var i = 0; i < newgooList.length; i++) {
  //         newPrice = Number(newPrice) + newgooList[i].gradePriceUnit
  //       }
  //     } else {
  //       console.log("留店wei超")
  //       var leaveGood = [];
  //       for (var a = 0; a < scPresaleInfoList.length; a++) {
  //         newPrice = Number(newPrice) + Number(scPresaleInfoList[a].gradePrice)
  //       }
  //     }
  //     console.log('newPrice:' + newPrice)
  //     this.setData({
  //       cShadeifshow: true,
  //       cardpop: true,
  //       hasdiscount: true,
  //       hasdisnumber: true,
  //       isMember: 1,
  //       principalFormat: principalFormat,
  //       scPresaleInfoList: scPresaleInfoList,
  //       leaveGood: leaveGood,
  //       newPrice: (Number(newPrice) + Number(this.data.additionalMoney)).toFixed(2),
  //       card: businessname
  //     })
  //   }

  // },
  // 选择会员卡判断优惠后余额是否足够
  // iuseCard: function (e) {
  //   console.log('使用了会员卡')
  //   var cardData = e.currentTarget.dataset.card;
  //   console.log(cardData)
  //   var id = cardData.id;// e.currentTarget.id.split('_')[1];
  //   var principal = cardData.principal;// e.currentTarget.id.split('_')[2];
  //   var principalFormat = cardData.principalFormat;// e.currentTarget.id.split('_')[3];
  //   var discount = cardData.discount;//e.currentTarget.id.split('_')[4];
  //   var discountFormat = cardData.discountFormat;// e.currentTarget.id.split('_')[5];
  //   var ishort = cardData.ishort;// e.currentTarget.id.split('_')[6];
  //   var businessname = e.currentTarget.dataset.businessname;
  //   // if (ishort==0){
  //   //   this.setData({
  //   //     isMember: 0
  //   //   })
  //   //   wx.showToast({
  //   //     title: "此卡余额不足，请去收银台充值",
  //   //     icon: 'none'
  //   //   })
  //   // }else{
  //   var scPresaleInfoList = this.data.scPresaleInfoList;//商品列表
  //   var gradePrice = this.data.gradePrice;//会员价
  //   var commodityGoods = this.data.commodityGoods;//会员留店商品
  //   console.log(scPresaleInfoList)
  //   console.log(gradePrice)
  //   console.log(commodityGoods)
  //   var moreGoods = [];//超出剩余数量的留店商品，按会员价来
  //   for (var b = 0; b < scPresaleInfoList.length; b++) {
  //     scPresaleInfoList[b].gradePrice = gradePrice[b].gradePrice;
  //     scPresaleInfoList[b].presaleInfoId = gradePrice[b].presaleInfoId;

  //     for (var c = 0; c < commodityGoods.length; c++) { //留店商品减数量
  //       if (scPresaleInfoList[b].goodsServiceId == commodityGoods[c].goodsId) { //是留店商品
  //         console.log(scPresaleInfoList[b].purchaseName)
  //         if (Number(scPresaleInfoList[b].purchaseNum) - Number(commodityGoods[c].remainNum) <= 0) { //在剩余数量范围内
  //           console.log('未超出留店范围')
  //           scPresaleInfoList[b].gradePrice = 0;
  //           scPresaleInfoList[b].purchaseType = 6;
  //         } else { //超出剩余数量
  //           console.log("超出留店")
  //           var num = Number(scPresaleInfoList[b].purchaseNum) - Number(commodityGoods[c].remainNum);//超出的数量
  //           scPresaleInfoList[b].purchaseNum = num;
  //           scPresaleInfoList[b].gradePrice = (Number(scPresaleInfoList[b].gradePrice) / Number(scPresaleInfoList[b].purchaseNum)) * num
  //           scPresaleInfoList[b].purchaseType
  //           moreGoods.push(scPresaleInfoList[b]);
  //           scPresaleInfoList[b].gradePrice = 0;
  //           scPresaleInfoList[b].purchaseType = 6;
  //         }

  //       }
  //     }
  //   }
  //   console.log("用完会员卡留店是否变化")
  //   console.log(scPresaleInfoList)
  //   var newPrice = 0;
  //   if (moreGoods && moreGoods.length > 0) { //留店有超出
  //     var leaveGood = moreGoods;
  //     var newgooList = scPresaleInfoList.contact(moreGoods);
  //     for (var i = 0; i < newgooList.length; i++) {
  //       newPrice = Number(newPrice) + Number(newgooList[i].gradePriceUnit)
  //     }
  //   } else {
  //     var leaveGood = [];
  //     for (var a = 0; a < scPresaleInfoList.length; a++) {

  //       newPrice = Number(newPrice) + Number(scPresaleInfoList[a].gradePrice)
  //     }
  //   }

  //   this.setData({
  //     cShadeifshow: true,
  //     cardpop: true,
  //     hasdiscount: true,
  //     hasdisnumber: true,
  //     isMember: 1,
  //     principalFormat: principalFormat,
  //     scPresaleInfoList: scPresaleInfoList,
  //     leaveGood: leaveGood,
  //     newPrice: (Number(newPrice) + Number(this.data.additionalMoney)).toFixed(2),
  //     card: businessname
  //   })
  //   // }



  // },
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
  // 选用会员卡后更换支付方式
  // UserCardchangePayway: function (e) {
  //   console.log(e)
  //   var userCardPayWay = e.currentTarget.dataset.statu; //0会员卡 1-微信
  //   console.log(userCardPayWay);
  //   if (userCardPayWay == 0) {
  //     console.log('会员卡')
  //     this.setData({
  //       userCardPayWay: 0
  //     })
  //   }
  //   if (userCardPayWay == 1) {
  //     console.log('微信')
  //     this.setData({
  //       userCardPayWay: 1
  //     })
  //     console.log(this.data.limitBalance)
  //     if (this.data.limitBalance == 1) { //是否限制消费 0-不限制 1-限制
  //       var levGood = this.data.leaveGood; //超出部分留店商品
  //       var normalList = this.data.scPresaleInfoList; //普通商品
  //       var suPrice = 0;
  //       if (levGood.length > 0) {
  //         var newgd = normalList.contact(levGood);
  //       } else {
  //         var newgd = normalList;
  //       }
  //       console.log(newgd)
  //       for (var i = 0; i < newgd.length; i++) {
  //         console.log(newgd[i].unitPrice)
  //         if (newgd[i].purchaseType == 6) {
  //           suPrice = Number(suPrice);
  //         } else {
  //           suPrice = Number(suPrice) + Number(newgd[i].unitPrice)
  //         }
  //       }
  //       console.log('suPrice' + suPrice)
  //       this.setData({
  //         suPrice: suPrice //有会员消费限制时的总价、
  //       })
  //     }
  //   }
  //   console.log("userCardPayWay=====>" + this.data.userCardPayWay + "limitBalance=========> " + this.data.limitBalance)
  // },
  // 确定支付
  // confirmPay: function () {
  //   var userCardPayWay = this.data.userCardPayWay;
  //   var presaleId = this.data.presaleId;
  //   var purchaseName = this.data.scPresaleInfoList[0].purchaseName;
  //   var accountInfo = this.data.accountInfo[0];
  //   var discountedPrice = 0;//整单优惠
  //   // 0 会员卡余额支付
  //   if (userCardPayWay == 0) {
  //     console.log("会员卡余额支付=======================")
  //     if (this.data.newPrice > accountInfo.money) { //余额不足
  //       wx.showToast({
  //         title: '余额不足请去前台充值',
  //         icon: 'none'
  //       })
  //     } else { //足额支付
  //       app.util.reqAsync('foodBoot/member/please', {
  //         "shopId": this.data.shopId, //店铺id
  //         "presaleId": this.data.presaleId, //订单id
  //         "memberId": this.data.accountInfo[0].accountId, //会员id
  //         "orderPay": this.data.newPrice, //支付金额
  //         "discountedPrice": discountedPrice.toFixed(2), //优惠金额
  //         "operatorId": 0, //操作员id
  //         "operatorName": "小程序", //操作员名称
  //         "memberPay": 0,//是否会员余额结账  0 会员余额 2 现金会员
  //         "waiterId": 0, //服务员id
  //         "waiterName": '',//服务员名称"
  //         "deviceId": this.data.facilityId,
  //         "additionalMoney": this.data.additionalMoney //服务费
  //       }).then((res) => {
  //         console.log(res.data.code)
  //         if (res.data.code == 1) {
  //           this.sendMessage();
  //           this.setData({
  //             flagOrder: false,
  //             showCard: false,
  //             payway: "会员卡",
  //             paywayshow: true
  //           })
  //           // this.getusercard();
  //           this.closePaycard();
  //         } else {
  //           wx.showToast({
  //             title: res.data.msg,
  //             icon: 'none'
  //           })
  //           this.closePaycard();
  //         }
  //       })
  //     }

  //   }
  //   // 1 微信支付
  //   else if (userCardPayWay == 1) {
  //     console.log("微信支付=======================" + this.data.actualPay)

  //     this.memberWecheat(this.data.newPrice);

  //   }
  // },
  myCatchTouch: function () {
    console.log("阻止下方页面滚动");
    return;
  },
  onPullDownRefresh: function () {//下拉刷新
    this.getInfo();
    wx.stopPullDownRefresh();
  }
})