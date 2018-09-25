//获取应用实例
import util from '../../utils/util.js';
const app = getApp();

Page({
  data: {
    array: ['快递配送', '自提'],
    isShop: 0,//0开通店内下单 1未开通
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
    totalMoney: 0, //合计
    oldTotal: 0,//实际支付
    showLoading: true,
    roomInx: '-1',
    deliveyMoney: 0, //运费
    deliveyArr: [],//运费数组
    isPay: 0,//是否微信支付（0未支付1-成功2-失败）
    oldroom: '-1',//未再次选择之前的index
    roomVal: "",
    oldroomVal: "",//未再次选择之前的房间名
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
    room: [],
    userInfo: [],
    goods: [],
    discount: [], //店铺优惠
    amountMin: 0, //优惠满
    amounts: 0, //优惠多少
    instruction: '',//优惠描述
    name: '',//优惠类型名称
    limtgood: '',//选择的优惠券若是指定商品传入指定商品id
    contactMobile: '',
    contactName: '',
    username: '',
    facilityId: '',
    oldfacilityId: '',
    areaName: '',
    cityName: '',
    ProvinceName: '',
    couponId: '',//礼包id
    shopProvince: '',//店铺省id
    shopArea: '',//店铺区id
    shopCity: '',//店铺市id
    notInCityPrice: '',
    inCityPrice: '',
    inCityPriceDetails: '',
    offline: '', //是否是扫码进来的 为1是扫码进来的
    scanRoom: '',//扫码进来的房间名
    sure: false,
    sures: true
  },
  onLoad: function (options) {
    console.log(options)
    var user = wx.getStorageSync('scSysUser');
    console.log('onload-user', user)
    var shop = wx.getStorageSync('shop');
    var ispay = wx.getStorageSync('isPay') || 0;
    var userid = wx.getStorageSync('scSysUser').id;
    var shopid = wx.getStorageSync('shop').id;
    var shopName = wx.getStorageSync('shop').shopName;
    var username = wx.getStorageSync('scSysUser').username;
    var offline = wx.getStorageSync('shop').offline || "";
    var userCode = wx.getStorageSync('scSysUser').usercode;
    //获取商品
    var goods = wx.getStorageSync('cart');
    var shopProvince = shop.provinceId;
    var shopArea = shop.areaId;
    var shopCity = shop.cityId;
    var goodsDev = [];
    //排序方法
    let hash = {};
    var goodNew = goods.reduce((preVal, curVal) => {
      hash[curVal.goodsId] ? '' : hash[curVal.goodsId] = true && preVal.push(curVal);
      return preVal
    }, [])
    

    console.log(goodNew)

    for (var k in goodNew) {
      if (typeof (goodNew[k].deliveryCalcContent) == 'string') {
        if (goodNew[k].deliveryCalcContent != "" && JSON.parse(goodNew[k].deliveryCalcContent) != null) {
          goodsDev.push(JSON.parse(goodNew[k].deliveryCalcContent))
        } else {
          goodsDev.push(0);
        }
      }
      
    }

    for (var d in goods){
      if (typeof (goods[d].deliveryCalcContent) == 'string') {}else{
        goods[d].actualPayment = Number(goods[d].actualPayment) * Number(goods[d].number);
      }
    }

    var arr = goodsDev;

    console.log(typeof (arr))
    this.setData({
      customerId: userid,
      shopId: shopid,
      username: username,
      shopProvince: shopProvince,
      shopArea: shopArea,
      shopCity: shopCity,
      deliveyArr: arr,
      offline: offline,
      shopName: shopName,
      goods: goods,
      userCode: userCode,
      ispay: ispay
    })


    this.setData({
      totalMoney: options.totalMoney,
      oldTotal: options.totalMoney,
      amountMin: options.amountMin || 0,
      amounts: options.amount || 0,
      instruction: options.instruction || "",
      name: options.name || "",
      couponId: options.counid || ""
    });
    console.log(options.limtgood)
    if (options.limtgood && options.limtgood != 'null') {
      this.setData({
        limtgood: options.limtgood.split(',')
      });
    } else {
      this.setData({
        limtgood: ""
      });
    }
    console.log("limtgood" + this.data.limtgood)
    console.log(this.data.goods)
    //是否可以店内下单并获得房间或者桌号
    app.util.reqAsync('shop/getShopTableNos', {
      shopId: this.data.shopId
    }).then((data) => {
      var goods = this.data.goods;
      var isSer = 0;
      for (var ins in goods) {
        if (goods[ins].goodsType != 0) {  //（0-普通商品；1-服务；2-服务卡；3-服务套餐;6-套盒）
          isSer = 1;
        }
      }

      if (data.data.code == 9) {   //未开通店内下单
        console.log('未开通店内下单')
        if (options.isSend) {
          if (options.isSend == 0) { //快递
            if (isSer == 0) { //普通商品
              this.setData({
                array: ['快递配送', '自提'],
                index: 0,
                isShop: 1,//0开通店内下单 1未开通
                isService: 0, //0只有商品没有服务 1有服务
                objectArray: [
                  {
                    id: 0,
                    name: '快递配送'
                  },
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            } else {
              this.setData({
                isSend: 2,//0-快递  1-店内下单 2-自提
                array: ['自提'],
                isShop: 1,//0开通店内下单 1未开通
                isService: 1, //0只有商品没有服务 1有服务
                index: 0,
                objectArray: [
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            }
          } else {
            if (isSer == 0) { //普通商品
              this.setData({
                array: ['快递配送', '自提'],
                isShop: 1,//0开通店内下单 1未开通
                isService: 0, //0只有商品没有服务 1有服务
                index: 1,
                objectArray: [
                  {
                    id: 0,
                    name: '快递配送'
                  },
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            } else {
              this.setData({
                isSend: 2,//0-快递  1-店内下单 2-自提
                array: ['自提'],
                isShop: 1,//0开通店内下单 1未开通
                isService: 1, //0只有商品没有服务 1有服务
                index: 0,
                objectArray: [
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            }
          }
        } else {
          if (isSer == 0) { //普通商品
            this.setData({
              array: ['快递配送', '自提'],
              isShop: 1,//0开通店内下单 1未开通
              isService: 0, //0只有商品没有服务 1有服务
              objectArray: [
                {
                  id: 0,
                  name: '快递配送'
                },
                {
                  id: 2,
                  name: '自提'
                }
              ]
            })
          } else {
            this.setData({
              isSend: 2,//0-快递  1-店内下单 2-自提
              array: ['自提'],
              isShop: 1,//0开通店内下单 1未开通
              isService: 1, //0只有商品没有服务 1有服务
              index: 0,
              objectArray: [
                {
                  id: 2,
                  name: '自提'
                }
              ]
            })
          }
        }

      } else { //开通店内下单线上线下分开所以不要店内下单
        if (data.data.data.length > 0) {
          console.log('开通店内下单')
          this.setData({
            room: data.data.data,
            merchantId: data.data.data[0].merchantId
          })
          if (options.isSend) {
            if (options.isSend == 0) {
              if (isSer == 0) { //普通商品
                this.setData({
                  array: ['快递配送', '自提'],
                  isShop: 0,//0开通店内下单 1未开通
                  index: 0,
                  isService: 0, //0只有商品没有服务 1有服务
                  objectArray: [
                    {
                      id: 0,
                      name: '快递配送'
                    },
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              } else {
                this.setData({
                  isSend: 2,//0-快递  1-店内下单 2-自提
                  array: ['自提'],
                  isShop: 0,//0开通店内下单 1未开通
                  isService: 1, //0只有商品没有服务 1有服务
                  index: 0,
                  objectArray: [
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              }
            } else {
              if (isSer == 0) { //普通商品
                this.setData({
                  array: ['快递配送', '自提'],
                  index: 1,
                  isShop: 0,//0开通店内下单 1未开通
                  isService: 0, //0只有商品没有服务 1有服务
                  objectArray: [
                    {
                      id: 0,
                      name: '快递配送'
                    },
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              } else {
                this.setData({
                  isSend: 2,//0-快递  1-店内下单 2-自提
                  array: ['自提'],
                  isShop: 0,//0开通店内下单 1未开通
                  isService: 1, //0只有商品没有服务 1有服务
                  index: 0,
                  objectArray: [
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              }
            }
          } else {
            if (isSer == 0) { //普通商品
              this.setData({
                array: ['快递配送', '自提'],
                isShop: 0,//0开通店内下单 1未开通
                isService: 0, //0只有商品没有服务 1有服务
                objectArray: [
                  {
                    id: 0,
                    name: '快递配送'
                  },
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            } else {
              this.setData({
                isSend: 2,//0-快递  1-店内下单 2-自提
                array: ['自提'],
                isShop: 0,//0开通店内下单 1未开通
                isService: 1, //0只有商品没有服务 1有服务
                index: 0,
                objectArray: [
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            }
          }

        }else{
          if (options.isSend) {
            if (options.isSend == 0) {
              if (isSer == 0) { //普通商品
                this.setData({
                  array: ['快递配送', '自提'],
                  isShop: 0,//0开通店内下单 1未开通
                  index: 0,
                  isService: 0, //0只有商品没有服务 1有服务
                  objectArray: [
                    {
                      id: 0,
                      name: '快递配送'
                    },
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              } else {
                this.setData({
                  isSend: 2,//0-快递  1-店内下单 2-自提
                  array: ['自提'],
                  isShop: 0,//0开通店内下单 1未开通
                  isService: 1, //0只有商品没有服务 1有服务
                  index: 0,
                  objectArray: [
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              }
            } else {
              if (isSer == 0) { //普通商品
                this.setData({
                  array: ['快递配送', '自提'],
                  index: 1,
                  isShop: 0,//0开通店内下单 1未开通
                  isService: 0, //0只有商品没有服务 1有服务
                  objectArray: [
                    {
                      id: 0,
                      name: '快递配送'
                    },
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              } else {
                this.setData({
                  isSend: 2,//0-快递  1-店内下单 2-自提
                  array: ['自提'],
                  isShop: 0,//0开通店内下单 1未开通
                  isService: 1, //0只有商品没有服务 1有服务
                  index: 0,
                  objectArray: [
                    {
                      id: 2,
                      name: '自提'
                    }
                  ]
                })
              }
            }
          } else {
            console.log(isSer)
            if (isSer == 0) { //普通商品
              console.log("普通商品")
              this.setData({
                array: ['快递配送', '自提'],
                isShop: 0,//0开通店内下单 1未开通
                isService: 0, //0只有商品没有服务 1有服务
                objectArray: [
                  {
                    id: 0,
                    name: '快递配送'
                  },
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            } else {
              console.log("非普通商品")
              this.setData({
                isSend: 2,//0-快递  1-店内下单 2-自提
                array: ['自提'],
                isShop: 0,//0开通店内下单 1未开通
                isService: 1, //0只有商品没有服务 1有服务
                index: 0,
                objectArray: [
                  {
                    id: 2,
                    name: '自提'
                  }
                ]
              })
            }
          }
        }

      }





      this.setData({
        goods: goods,
        total: goods.length,
        isService: isSer,
        isPay: this.data.ispay

      })
    })
    console.log("返回：" + options.isSend)
    if (options.isSend) {
      this.setData({
        isSend: options.isSend
      })
    }
  },
  onShow: function (e) {

    //获取地址
    app.util.reqAsync('shop/getMyAddressAndCoupon', {
      customerId: this.data.customerId,
      shopId: this.data.shopId
    }).then((data) => {
      console.log(data)
      if (data.data.code == 1) {
        this.setData({
          userInfo: data.data.data,
          shopName: this.data.shopName
        })

        console.log("地址")
        console.log("用户id：" + this.data.customerId)
        console.log("shopId" + this.data.shopId)
        console.log(data.data.data)
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
        if (data.data.data.couponList) {
          var counlits = [];//过滤掉新手礼包
          for (var i in data.data.data.couponList) {
            if (data.data.data.couponList[i].couponType != '06') {
              counlits.push(data.data.data.couponList[i]);
            }
          }
          this.setData({
            discount: counlits //优惠券
          })
        }
        this.setData({
          array: this.data.array,
          isShop: this.data.isShop,//0开通店内下单 1未开通
          isService: this.data.isService, //0只有商品没有服务 1有服务
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
          roomInx: this.data.roomInx,
          isPay: this.data.isPay,//是否微信支付（0未支付1-成功2-失败）
          oldroom: this.data.oldroom,//未再次选择之前的index
          roomVal: this.data.roomVal,
          oldroomVal: this.data.oldroomVal,//未再次选择之前的房间名
          objectArray: this.data.objectArray,
          index: this.data.index,
          total: this.data.total,
          flag: this.data.flag,
          flagOrder: this.data.flagOrder,
          room: this.data.room,
          userInfo: this.data.userInfo,
          goods: this.data.goods,
          discount: this.data.discount, //店铺优惠
          amountMin: this.data.amountMin,
          amounts: this.data.amounts,
          instruction: this.data.instruction,
          limtgood: this.data.limtgood,
          name: this.data.name,
          contactMobile: this.data.contactMobile,
          contactName: this.data.contactName
        })
        console.log("458行" + this.data.limtgood)
        this.deliveryMone();
        this.discounts();
      } else {
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
      }

    })

  },
  deliveryMone: function () {
    var darr = this.data.deliveyArr;
    console.log(darr)
    if (this.data.name == "包邮券") {
      this.setData({
        deliveyMoney: 0
      })
    } else {

      if (darr != 0) {
        var mony = [];//所有商品运费集合
        console.log(1)
        for (var a in darr) {
          //比较是否在一个省
          if (this.data.provinceId == this.data.shopProvince) {  //在一个省
            if (this.data.cityId == this.data.shopCity) { //同一个市
              var detail = darr[a].inCityPriceDetails;
              var flagos = false; //默认不匹配区
              for (var k in detail) {
                if (this.data.areaId == detail[k].area) {
                  flagos = true;
                  console.log('匹配的区')
                  this.setData({
                    deliveyMoney: darr[a].inCityPriceDetails[k].areaPrice
                  })
                  break;
                }
              }
              if (flagos == false) { //无匹配的区
                console.log('无匹配的区')
                this.setData({
                  deliveyMoney: darr[a].inCityPrice
                })
              }

            } else { //不在一市
              console.log('不在一个市')
              this.setData({
                deliveyMoney: darr[a].notInCityPrice
              })
            }
          } else { //不在一个省
            console.log('不在一个省')
            this.setData({
              deliveyMoney: darr[a].notInCityPrice
            })
          }

          mony.push(this.data.deliveyMoney)
        }

        if (mony.length > 1) {
          var bigmon = 0;
          for (var i = 0; i < mony.length; i++) {
            bigmon = Number(mony[i]) + Number(bigmon)
          }
        } else {
          var bigmon = mony[0]
        }

        console.log(bigmon)
        this.setData({
          deliveyMoney: bigmon
        })
      }



    }

  },
  compare: function (val1, val2) {
    return val2 - val1;
  },
  discounts: function (e) { //优惠券

    if (this.data.isSend == 0) {

      var newmoney = Number(this.data.totalMoney) + Number(this.data.deliveyMoney);
    } else {
      var newmoney = Number(this.data.totalMoney)
    }
    this.setData({
      oldTotal: newmoney.toFixed(2)
    })
    //优惠后合计

    if (this.data.name != "") {
      if (this.data.name == "优惠券") {

        if (this.data.limtgood != "") { //指定商品   //先筛选符合满减的指定商品
          console.log("有指定商品满减券")
          var limtarr = [];//有指定商品
          for (var a in this.data.goods) {
            for (var b in this.data.limtgood) {
              if (this.data.goods[a].goodsId == this.data.limtgood[b]) { //是指定商品
                limtarr.push({
                  goodsId: this.data.goods[a].goodsId,
                  actualPayment: this.data.goods[a].actualPayment,
                  numbers: this.data.goods[a].number,
                  total: Number(this.data.goods[a].actualPayment) * Number(this.data.goods[a].number)
                })
              }
            }
          }
          console.log(limtarr.length)
          if (limtarr.length > 0) { //有满减的制定商品
            var sumlit = 0;
            for (var b in limtarr) {
              sumlit += limtarr[b].total
            }
            if (sumlit >= this.data.amountMin) { //指定商品的总金额大于满减
              var countMoney = (Number(newmoney) - Number(this.data.amounts)).toFixed(2); //满减之后的总价
              if (countMoney > 0) {
                this.setData({
                  oldTotal: countMoney
                })
              } else {
                this.setData({
                  oldTotal: 0
                })
              }
            } else {
              this.setData({
                instruction: "",
                amountMin: 0, //优惠满
                amounts: 0, //优惠多少
                instruction: '',
                couponId: '',
                name: ''
              })
              wx.showToast({
                title: '未达到满减金额，不能使用',
                icon: 'none'
              })
              return false;
            }
          } else {
            this.setData({
              instruction: "",
              amountMin: 0, //优惠满
              amounts: 0, //优惠多少
              instruction: '',
              couponId: '',
              name: '',
              limtgood: ''
            })
            wx.showToast({
              title: '此优惠券只有指定商品可用',
              icon: 'none'
            })
          }
        } else { //没有指定商品
          console.log('没有指定商品')
          if (Number(this.data.totalMoney) >= Number(this.data.amountMin)) {

            var countMoney = (Number(newmoney) - Number(this.data.amounts)).toFixed(2);


            if (countMoney > 0) {
              this.setData({
                oldTotal: countMoney
              })
            } else {
              this.setData({
                oldTotal: 0
              })
            }
          } else {
            this.setData({
              instruction: "",
              amountMin: 0, //优惠满
              amounts: 0, //优惠多少
              instruction: '',
              couponId: '',
              name: ''
            })
            wx.showToast({
              title: '未达到满减金额，不能使用',
              icon: 'none'
            })
            return false;
          }
        }

      } else if (this.data.name == "代金券") {
        if (this.data.limtgood != "") { //指定商品代金券
          var limtarr = [];//有指定商品
          for (var a in this.data.goods) {
            for (var b in this.data.limtgood) {
              if (this.data.goods[a].goodsId == this.data.limtgood[b]) { //是指定商品
                limtarr.push({
                  goodsId: this.data.goods[a].goodsId,
                  actualPayment: this.data.goods[a].actualPayment,
                  numbers: this.data.goods[a].number,
                  total: Number(this.data.goods[a].actualPayment) * Number(this.data.goods[a].number)
                })
              }
            }
          }
          console.log(limtarr.length)
          if (limtarr.length > 0) { //有代金券的制定商品
            var sumlit = 0;
            for (var b in limtarr) {
              sumlit += limtarr[b].total
            }
            if (Number(sumlit) - Number(this.data.amounts) > -1) { //指定商品的总金额大于代金券
              var countMoney = (Number(newmoney) - Number(this.data.amounts)).toFixed(2);
            } else {
              var countMoney = (Number(newmoney) - Number(sumlit)).toFixed(2);
            }
            if (countMoney > 0) {
              this.setData({
                oldTotal: countMoney
              })
            } else {
              this.setData({
                oldTotal: 0
              })
            }
          } else { //此订单无指定商品
            this.setData({
              instruction: "",
              amountMin: 0, //优惠满
              amounts: 0, //优惠多少
              instruction: '',
              couponId: '',
              name: '',
              limtgood: ''
            })
            wx.showToast({
              title: '此代金券只有指定商品可用',
              icon: 'none'
            })
            return false;
          }
        } else {

          if (Number(this.data.totalMoney) - Number(this.data.amounts) > -1) {
            var countMoney = (Number(newmoney) - Number(this.data.amounts)).toFixed(2);
          } else {
            var countMoney = (Number(newmoney) - Number(this.data.totalMoney)).toFixed(2);
          }

          if (countMoney > 0) {
            this.setData({
              oldTotal: countMoney
            })
          } else {
            this.setData({
              oldTotal: 0
            })
          }

        }

      } else {
        if (Number(newmoney) < Number(this.data.amountMin)) {
          this.setData({
            instruction: "",
            amountMin: 0, //优惠满
            amounts: 0, //优惠多少
            instruction: '',
            couponId: '',
            name: ''
          })
          wx.showToast({
            title: '未达到包邮金额，不能使用',
            icon: 'none'
          })
          return false;
        } else {
          this.setData({
            oldTotal: (this.data.totalMoney).toFixed(2),
            deliveyMoney: 0
          })
        }
      }
    } else {
      this.setData({
        oldTotal: newmoney.toFixed(2)
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
        isSend: 0,
        instruction: "",
        amountMin: 0, //优惠满
        amounts: 0, //优惠多少
        instruction: '',
        couponId: '',
        name: '',
        limtgood: ''
      })
    } else {
      this.setData({
        index: e.detail.value,
        isSend: 2,
        instruction: "",
        amountMin: 0, //优惠满
        amounts: 0, //优惠多少
        instruction: '',
        couponId: '',
        name: '',
        limtgood: ''
      })
    }
    this.deliveryMone();
    this.discounts();
  },
  bindblur: function (e) {
    //填写数量
    var isInt = /^[1-9]+\d*$/;
    if (e.detail.value) {
      if (isInt.exec(e.detail.value)) {
        var val = e.detail.value;
        var index = parseInt(e.target.dataset.index);//当前index

        this.data.goods[index].number = val;

        this.setData({
          goods: this.data.goods
        });

        this.sum();//合计
      } else {
        wx.showToast({
          title: '请输入正确的数量',
          icon: 'none'
        })
        var index = parseInt(e.target.dataset.index);//当前index
        this.data.goods[index].number = this.data.goods[index].number;
        this.setData({
          goods: this.data.goods
        });
      }
    } else {
      var val = e.detail.value;
      wx.showToast({
        title: '请输入正确的数量',
        icon: 'none'
      })

    }

  },
  bindMinus: function (e) {
    //减数量
    var index = parseInt(e.target.dataset.index), //当前index
      num = this.data.goods[index].number; //数量
    if (num > 1) {
      num--;
    }
    this.data.goods[index].number = num;

    // 将数值与状态写回
    this.setData({
      goods: this.data.goods,

    });
    this.sum();//合计
    console.log(this.data.goods)
  },
  bindPlus: function (e) {
    //加数量
    var index = parseInt(e.target.dataset.index), //当前index
      num = this.data.goods[index].number; //数量
    num++;
    this.data.goods[index].number = num;


    // 将数值与状态写回
    this.setData({
      goods: this.data.goods,

    });
    this.sum();//合计
  },
  sum: function () {
    this.data.totalMoney = 0;
    console.log(this.data.goods)
    //合计
    for (var i = 0; i < this.data.goods.length; i++) {
      console.log(Number(this.data.goods[i].goodsPrice));

      console.log(Number(this.data.goods[i].number));
      if (this.data.goods[i].stockId) {
        this.data.totalMoney = this.data.totalMoney + (Number(this.data.goods[i].stockPrice) * Number(this.data.goods[i].number));
      } else {
        this.data.totalMoney = this.data.totalMoney + (Number(this.data.goods[i].goodsPrice) * Number(this.data.goods[i].number));
      }

    };
    this.setData({
      goods: this.data.goods,
      totalMoney: this.data.totalMoney
    });
    this.deliveryMone();
    this.discounts();
  },
  show: function () {
    //弹出窗显示房间 
    this.setData({
      flag: false,
    })
  },
  //消失房间
  hide: function () {
    this.setData({
      flag: true,
      roomInx: this.data.oldroom,
      roomVal: this.data.oldroomVal,
      facilityId: this.data.oldfacilityId
    })
  },
  selectRoom: function (e) {
    //选中房间
    this.setData({
      roomInx: e.currentTarget.dataset.index,
      roomVal: e.currentTarget.dataset.val,
      merchantId: e.currentTarget.dataset.merchant,
      facilityId: e.currentTarget.dataset.facilityid
    })
  },
  syre: function (e) {
    //确认房间
    this.setData({
      roomInx: e.currentTarget.dataset.index,
      oldroom: e.currentTarget.dataset.index,
      roomVal: e.currentTarget.dataset.val,
      oldroomVal: e.currentTarget.dataset.val,
      oldfacilityId: e.currentTarget.dataset.facilityid,
      merchantId: e.currentTarget.dataset.merchant,
      facilityId: e.currentTarget.dataset.facilityid,
      flag: true
    })
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
    //跳到线上订单
    wx.redirectTo({
      url: '../../../../../packageMyHome/pages/order/order'
    })


  },
  selectCounp: function (e) {
    var discount = this.data.discount;
    console.log(discount.length)
    if (discount.length > 0) {
      wx.setStorageSync('discount', discount);
      wx.navigateTo({
        url: '../orderBuy/discount/discount?shopId=' + this.data.shopId + '&shopName=' +
          this.data.shopName + '&customerId=' + this.data.customerId + '&totalMoney=' + this.data.totalMoney + '&isSend=' + this.data.isSend
      })
    } else {
      wx.showToast({
        title: '此店铺暂无优惠',
        icon: 'none'
      })
      return false;
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
    //自提或快递
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
        sures: false,
        sure: true
      })
      this.sumb1(1);
    } else { //自取
      console.log("自取")
      this.setData({
        sures: false,
        sure: true
      })
      this.sumb1(1);
    }

  },
  sumb1: function (type) {
    console.log("快递或者字体")
    //快递或自提
    var goodsList = [];//店内下单商品传参
    var merchantId = this.data.merchantId;//商户主键
    var userName = this.data.username;//用户名
    var bussinessType = 1;
    if (this.data.isSend == 2) { //自提
      var deliveryMoney = 0;//快递金额
    } else {
      var deliveryMoney = this.data.deliveyMoney;//快递金额
    }

    console.log("快递金额" + deliveryMoney)

    if (this.data.oldTotal == "0.00" || this.data.oldTotal == 0 || this.data.oldTotal == "0") {//总价为0专用
      console.log("总价为0")
      var payStatus = 1;
    } else {
      console.log('总价不为0')
      var payStatus = this.data.isPay;//支付状态（未支付0，成功1，失败2）
    }


    for (var i in this.data.goods) {

      var goos = this.data.goods[i];
      if (goos.stockId) {
        goodsList.push({
          goodsPrice: goos.stockPrice,
          goodsType: goos.goodsType,
          goodsNum: goos.number,
          goodsIndex: i,
          remake: goos.remake,
          num: goos.number,
          goodsName: goos.goodsName,
          actualPayment: goos.actualPayment,
          goodsPic: goos.goodsPic,
          unitPrice: goos.unitPrice,
          goodsId: goos.goodsId,
          stockId: goos.stockId || ""
        });
      } else {
        goodsList.push({
          goodsPrice: goos.goodsPrice,
          goodsType: goos.goodsType,
          goodsNum: goos.number,
          goodsIndex: i,
          remake: goos.remake,
          num: goos.number,
          goodsName: goos.goodsName,
          actualPayment: goos.actualPayment,
          goodsPic: goos.goodsPic,
          unitPrice: goos.unitPrice,
          goodsId: goos.goodsId,
          stockId: goos.stockId || ""
        });
      }

    }


    var xx = {
      deliveryType: this.data.isSend,//配送方式(0-快递；1-送货上门；2-自取)
      shopOrderItemList: goodsList,
      extend4: '129',//版本
      areaId: this.data.areaId,
      deliveryMoney: deliveryMoney,
      amount: this.data.totalMoney,
      deliveryTime: 0,
      contactMobile: this.data.contactMobile,
      contactName: this.data.contactName,
      bussinessId: this.data.shopId,
      source: "MOBILE",//订单来源
      customerId: this.data.customerId,
      payType: 3, //支付方式（货到付款0，在线支付1，支付宝支付2，微信支付3）目前只有微信支付
      bussinessType: bussinessType,
      payStatus: payStatus,////支付状态（未支付0，成功1，失败2）
      address: this.data.address,
      realMoney: this.data.oldTotal, //实际支付金额
      provinceId: this.data.provinceId,
      cityId: this.data.cityId,
      couponId: this.data.couponId  //优惠券id
    }
    console.log(xx)
    app.util.reqAsync('shop/submitOnlineOrder', xx).then((data) => {
      console.log(data)
      this.setData({
        showLoading: true
      })
      if (data.data.code == 1) {
        if (this.data.oldTotal == "0.00" || this.data.oldTotal == 0 || this.data.oldTotal == "0") {  //金额为0直接成功下单绕过支付
          this.setData({
            flagOrder: false,
            isPay: 1
          })
        } else {
          if (type == 1) { //点击确认下单
            //微信支付弹窗
            var self = this;
            var dt = data.data.data;
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

                  wx.switchTab({
                    url: '../shoppingCart/shoppingCart'
                  });

                }
              }
            })
          }
        }

      } else {
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
        this.setData({
          sures: true,
          sure: false
        })
      }
      wx.setStorageSync('discount', '');

    })

  },
  bindTestCreateOrder: function (code) {
    console.log(app.globalData.notify_url)
    var data = {
      subject: this.data.goods[0].goodsName,
      requestBody: {
        body: '云店小程序普通订单',
        out_trade_no: code,
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
              wx.switchTab({
                url: '../shoppingCart/shoppingCart'
              }, 3000);
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
        console.log(data.data.msg)
      }

    })
  }
})