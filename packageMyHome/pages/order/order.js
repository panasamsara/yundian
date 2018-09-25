//shopping-cart.js


//获取应用实例
const app = getApp();

Page({
  data: {
    winHeight: "",//窗口高度
    currentPage: 1,  // 当前页数  默认是1
    currentTab: 0, //预设当前项的值
    scrollLeft: 0, //tab标题的滚动条位置
    goodlist: [], //"orderStatus" 订单状态（待发货0，配送中1，已收货2， 配送失败3, 取消4，异常订单5）
    length: 0,
    customerId: '',
    shopId: '', 
    userCode: ''
  },
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var userid = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;
    var userCode = wx.getStorageSync('scSysUser').usercode;
    var that = this;
    // 高度自适应
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          rpxR = 750 / clientWidth;
        var calc = (clientHeight - 58) * rpxR;
        that.setData({
          winHeight: calc
        });
      }
    });
    that.setData({
      currentTab: options.index || 0,
      customerId: userid,
      shopId: shopId,
      userCode: userCode
    });
    that.getData(); //全部
    console.log(userid)
  },
  // onShow:function(e){
  //   this.getData(); 
  // },
  // 滚动切换标签样式
  // switchTab: function (e) {
  //   this.setData({
  //     currentTab: e.detail.current,
  //     currentPage:1,
  //     goodlist: [], //"orderStatus" 订单状态（待发货0，配送中1，已收货2， 配送失败3, 取消4，异常订单5）
  //     length: 0
  //   });
  //   this.checkCor();
  //   this.getData();
  // },
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
      this.getData();
    }
  },
  onPullDownRefresh: function () {//下拉刷新
    this.setData({
      list: [],
      currentPage: 1
    })
    this.getData();
    wx.stopPullDownRefresh();
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
  getData: function (type) {
    wx.showLoading({
      title: '加载中',
    });
    //调接口
    if (type == 1) {
      app.util.reqAsync('shop/getShopOrderListNews', {
        customerId: this.data.customerId,
        orderStatusVo: this.data.currentTab,
        shopId: this.data.shopId,
        pageNo: Number(this.data.currentPage) + 1,
        pageSize: 10
      }).then((res) => {
        wx.hideLoading();
        console.log(res)
        if (res.data.code == 1) {
          //下拉加载
          var oldData = this.data.goodlist;
          var data = res.data.data;
          
          for (var ins in data) {
            if (data[ins].bussinessType != 18) {//积分商品不精确到两位
              data[ins].amount = data[ins].amount.toFixed(2);
            }
            data[ins].total = 0;
            for (var z in data[ins].orderItemList){
              data[ins].total += Number(data[ins].orderItemList[z].goodsNum);
            }
            oldData.push(data[ins]);
          }
          wx.hideLoading();

          this.data.currentPage = ++this.data.currentPage;
          this.setData({
            goodlist: oldData,
            length: oldData.length
          })

        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }).catch((err) => {
        console.log(err)
        wx.showToast({
          title: '到底了哟',
          icon: 'none'
        })
      })
    } else {
      app.util.reqAsync('shop/getShopOrderListNews', {
        customerId: this.data.customerId,
        orderStatusVo: this.data.currentTab,
        shopId: this.data.shopId,
        pageNo: 1,
        pageSize: 10
      }).then((res) => {
        wx.hideLoading();
        if (res.data.code == 1) {
          for (var i in res.data.data) {
            res.data.data[i].total = 0;
            if (res.data.data[i].bussinessType != 18) {//积分商品不精确到两位
              res.data.data[i].amount = res.data.data[i].amount.toFixed(2);
            }
            for (var z in res.data.data[i].orderItemList) {
              res.data.data[i].total += res.data.data[i].orderItemList[z].goodsNum;
            }
          }
          this.setData({
            goodlist: res.data.data,
            length: res.data.data.length
          })
          console.log(res.data.data)
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
        console.log(this.data.length)
      }).catch((err) => {
        wx.showToast({
          title: '失败……',
          icon: 'none'
        })
      })
    }

  },
  delete: function (e) {
    var orderNo = e.currentTarget.dataset.no;
    var that = this;
    //删除订单
    wx.showModal({
      title: '提示',
      content: '确定删除订单？',
      success: function (res) {
        if (res.confirm) {
          app.util.reqAsync('shop/delOrder', {
            orderNo: orderNo
          }).then((res) => {
            if (res.data.code == 1) {
              wx.showToast({
                title: '成功删除订单',
                icon: 'none'
              })
              setTimeout(function () {
                that.getData();
                that.setData({
                  currentPage: 1
                })
              }, 2000);
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

        }
      }
    })
  },
  cancel: function (e) {
    var orderNo = e.currentTarget.dataset.no;
    //取消订单
    var that = this;
    wx.showModal({
      title: '取消订单',
      content: '是否取消订单？',
      success: function (res) {
        if (res.confirm) {
          app.util.reqAsync('shop/cancelOnlineOrder', {
            orderNo: orderNo
          }).then((res) => {
            if (res.data.code == 1) {
              that.getData();
              that.setData({
                currentPage: 1
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
        } else if (res.cancel) {
          //用户点击取消

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
      url: '../../pages/appraise/appraise?shopId=' + shopId + '&goodsId=' + goodId
    })
  },
  returnGood: function (e) {
    //申请退货
    var self = this;
    var phone = e.currentTarget.dataset.phone;
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
    // var orderNo = e.currentTarget.dataset.no,
    //   orderStatus = e.currentTarget.dataset.statu,
    //   returnAmount = e.currentTarget.dataset.money;
    // wx.navigateTo({
    //   url: 'applyRefund/applyRefund?orderNo=' + orderNo + '&orderStatus=' + orderStatus + '&returnAmount=' + returnAmount
    // })
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
    var phone = e.currentTarget.dataset.phone;
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
    var orderNo = e.currentTarget.dataset.no,
      customerId = e.currentTarget.dataset.customerid;//"fromBarCode":1 //是否扫码确认收货。可不填 ，不填则不是扫码确认收货
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定收货？',
      success: function (res) {
        if (res.confirm) {
          app.util.reqAsync('shop/confirmRecv', {
            orderNo: orderNo,
            customerId: customerId
          }).then((res) => {
            console.log(res)
            if (res.data.code == 1) {
              that.getData();
              that.setData({
                currentPage: 1
              })
            } else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }

          })

        }
      }
    })
  },
  shipments: function (e) {
    var orderNo = e.currentTarget.dataset.no,
      userId = this.data.customerId;//用户id
    //提醒发货
    app.util.reqAsync('shop/orderRemind', {
      orderNo: orderNo,
      userId: userId
    }).then((res) => {
      if (res.data.code == 1) {
        wx.showToast({
          title: '已提醒卖家发货',
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
  // shopSkip: function(e){
  //   var shopId = e.currentTarget.dataset.shopid;
  //   var currUserId = this.data.customerId;//用户id
  //   console.log(shopId)
  //   console.log(currUserId)
  //   //跳到店铺
  //   wx.navigateTo({
  //     url: '../../store/store?shopId=' + shopId + '&currUserId=' + currUserId
  //   })
  // },
  orderSkip: function (e) {
    var orderNo = e.currentTarget.dataset.no;
    var isGroupBuying = e.currentTarget.dataset.isgrop;//是否拼单 0不是 1是
    var remark = e.currentTarget.dataset.remark;//是否秒杀活动

    //跳转积分商品订单详情
    if (e.currentTarget.dataset.type == 18) {//积分商品
      wx.redirectTo({
        url: "../../../packageIntegral/pages/orderdetail/orderdetail?orderNo=" + orderNo
      })
      return
    }

    //跳转到订单详情
    if (isGroupBuying == 1) { //拼团
      wx.redirectTo({
        url: '../orderDetail/orderDetail?orderNo=' + orderNo + '&isGroupBuying=' + 1
      })
    } else {
      if (remark && remark != null) {
        if (remark.indexOf("秒杀") == -1) { //普通商品
          console.log("普通")
          wx.redirectTo({
            url: '../orderDetail/orderDetail?orderNo=' + orderNo + '&isGroupBuying=' + 0
          })
        } else { //秒杀
          console.log("秒杀")
          wx.redirectTo({
            url: '../orderDetail/orderDetail?orderNo=' + orderNo + '&isGroupBuying=' + 0 + '&orderkind=' + 3
          })
        }
      } else {
        console.log("普通")
        wx.redirectTo({
          url: '../orderDetail/orderDetail?orderNo=' + orderNo + '&isGroupBuying=' + 0
        })
      }

    }

  },
  onReachBottom: function () {
    //下拉加载
    var newpage = Math.ceil(this.data.length / this.data.currentPage);
    if (this.data.currentPage <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.getData(1);
    } else {
      wx.showToast({
        title: '到底了哦',
        icon: "none"
      })
    }
  },
  // onPullDownRefresh: function () {
  //   wx.showToast({
  //     title: '刷新中',
  //     icon: "none"
  //   })
  //   //上拉刷新
  //   this.getData();
  // },
  pay: function (e) {
    var self = this;
    var dt = e.currentTarget.dataset.no;
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
        body: '云店小程序普通订单',
        out_trade_no: code,
        // notify_url: 'https://wxappprod.izxcs.com/zxcity_restful/ws/payBoot/wx/pay/parseOrderNotifyResult',
        // notify_url: app.globalData.notify_url,
        trade_type: 'JSAPI',
        openid: wx.getStorageSync('scSysUser').wxOpenId
      }
    };
    //发起网络请求 微信统一下单   
    app.util.reqAsync('payBoot/wx/pay/unifiedOrder', data).then((res) => {
      console.log(res.data.data.data);
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
            console.log('成功' + res)
            wx.showToast({
              title: '支付成功',
              icon: 'none'
            })
            self.getMessage(code);
            self.getData();
          },
          'fail': function (res) {
            console.log('失败' + res)
            //支付失败
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
            self.getData();


          },
          'complete': function (res) {

            self.getData();
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


  //         self.getData(); 

  //       },
  //       'complete': function (res) {
  //         wx.showToast({
  //           title: '支付成功',
  //           icon: 'none'
  //         })

  //         self.getData(); 
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