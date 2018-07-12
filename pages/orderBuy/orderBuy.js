//获取应用实例(确认下单就只剩下微信支付接口调试以及在店内扫码直接显示房间以及店铺优惠选择)
const app = getApp();
var user = wx.getStorageSync('scSysUser');
console.log(user)
var ispay = wx.getStorageSync('isPay') || 0;
Page({
  data: {
    array: ['快递配送', '店内下单','自提'],
    isShop:0,//0开通店内下单 1未开通
    isService:0, //0只有商品没有服务 1有服务
    isSend:0,//0-快递  1-店内下单 2-自提
    shopName:'',
    shopId:'',
    customerId:'',//用户id
    areaId: '',//地区主键
    cityId: '',//城市主键
    provinceId: '',//省id
    address:'',//地址
    merchantId:'',//商户id
    totalMoney:0, //合计
    roomInx:'-1',
    isPay:0,//是否微信支付（0未支付1-成功2-失败）
    oldroom: '-1',//未再次选择之前的index
    roomVal:"",
    oldroomVal: "",//未再次选择之前的房间名
    customerId:"",
    objectArray: [
      {
        id: 0,
        name: '快递配送'
      },
      {
        id: 1,
        name: '店内下单'
      },
      {
        id: 2,
        name: '自提'
      }
    ],
    index: 0,
    total:1,
    flag:true,
    flagOrder:true,
    room:[],
    userInfo:[],
    goods: [],
    orderGood:[] //用于结算传参
  },
  onLoad: function (options) {
    //是否可以店内下单并获得房间或者桌号
    app.util.reqAsync('shop/getShopTableNos', {
      shopId: options.shopId
    }).then((res) => {
      //获取商品
      var goods = wx.getStorageSync('cart');
      var orderGood = wx.getStorageSync('buyCart');
      var isSer = 0;
      for (var ins in goods) {
        if (goods[ins].goodsType != 0) {  //（0-普通商品；1-服务；2-服务卡；3-服务套餐;6-套盒）
          isSer = 1;
        }
      }
      if (res.data.code == 9) {   //未开通店内下单
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
      } else { //开通店内下单
        this.setData({
          room:res.data.data,
          merchantId: res.data.data[0].merchantId
        })
        if (isSer == 0) { //普通商品
          this.setData({
            array: ['快递配送', '店内下单', '自提'],
            isShop: 0,//0开通店内下单 1未开通
            isService: 0, //0只有商品没有服务 1有服务
            objectArray: [
              {
                id: 0,
                name: '快递配送'
              },
              {
                id: 1,
                name: '店内下单'
              },
              {
                id: 2,
                name: '自提'
              }
            ]
          })
        } else {
          this.setData({
            isSend: 1,//0-快递  1-店内下单 2-自提
            array: ['店内下单', '自提'],
            isShop: 0,//0开通店内下单 1未开通
            isService: 1, //0只有商品没有服务 1有服务
            index: 0,
            objectArray: [
              {
                id: 1,
                name: '店内下单'
              },
              {
                id: 2,
                name: '自提'
              }
            ]
          })
        }
      }
      
      this.setData({
        goods: goods,
        orderGood:orderGood,
        total: goods.length,
        isService: isSer,
        shopName: options.shopName,
        totalMoney: options.totalMoney,
        shopId: options.shopId,
        customerId: options.customerId,
        isPay: ispay
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })

    //获取地址
    app.util.reqAsync('shop/getMyAddressAndCoupon', {
      customerId: options.customerId,
      shopId: options.shopId
      }).then((data) => {
        this.setData({
          userInfo: data.data.data,
          shopName: options.shopName,
          areaId: data.data.data.recvAddress.areaId,//地区主键
          cityId: data.data.data.recvAddress.cityId,//城市主键
          provinceId: data.data.data.recvAddress.provinceId,//省id
          address: data.data.data.recvAddress.address,//地址
        })
      }).catch((err) => {
        wx.showToast({
          title: '失败……',
          icon: 'none'
      })
    })
  },
  addressSkip: function(e){
    //跳到地址管理
    wx.navigateTo({
      url: '../myHome/address/index/list?id=' + user.id 
    })
  },
  bindPickerChange: function (e) {
    var val = e.target.dataset.val,
    inx = e.detail.value;
    if (val[inx]=="快递配送"){
      //选择购买方式
      this.setData({
        index: e.detail.value,
        isSend: 0
      })
    } else if (val[inx] == "店内下单"){
      this.setData({
        index: e.detail.value,
        isSend: 1
      })
    }else{
      this.setData({
        index: e.detail.value,
        isSend: 2
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
    this.data.orderGood[index].goodsNum = num;
    this.data.orderGood[index].num = num;
    this.sum();//合计

    // 将数值与状态写回
    this.setData({
      goods: this.data.goods,
      orderGood: this.data.orderGood,
      totalMoney: this.data.totalMoney
    });
  },
  bindPlus: function (e) {
    //加数量
    var index = parseInt(e.target.dataset.index), //当前index
      num = this.data.goods[index].number; //数量
    num++;
    this.data.goods[index].number = num;
    this.data.orderGood[index].goodsNum = num;
    this.data.orderGood[index].num = num;
    this.sum();//合计

    // 将数值与状态写回
    this.setData({
      goods: this.data.goods,
      orderGood: this.data.orderGood,
      totalMoney: this.data.totalMoney
    });
  },
  sum: function () {
    this.data.totalMoney = 0;
    //合计
    for (var i = 0; i < this.data.goods.length; i++) {
      this.data.totalMoney = this.data.totalMoney + (parseInt(this.data.goods[i].goodsPrice) * parseInt(this.data.goods[i].number));  
    };
    this.setData({
      goods: this.data.goods,
      orderGood:this.data.orderGood,
      totalMoney: this.data.totalMoney
    });
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
      roomVal: this.data.oldroomVal
   })
  },
  selectRoom: function(e){
    //选中房间
    this.setData({ 
      roomInx: e.target.dataset.index,
      roomVal: e.target.dataset.val,
      merchantId: e.target.merchant
     })
  },
  syre: function(e){
    //确认房间
    this.setData({
      roomInx: e.target.dataset.index,
      oldroom: e.target.dataset.index,
      roomVal: e.target.dataset.val,
      oldroomVal: e.target.dataset.val,
      merchantId: e.target.dataset.merchant,
      flag: true
    })
  },
  goShop: function(e){
    wx.setStorageSync('isPay', 0);
    this.setData({
      flagOrder: true
    })
    //跳到首页
    wx.navigateTo({
      url: '../index/index'
    })
  },
  look:function(e){
    wx.setStorageSync('isPay', 0);
    this.setData({
      flagOrder: true
    })
    //跳到线上订单
    wx.navigateTo({
      url: '../myHome/order/order'
    })
  },
  default: function(e){
   // 地址是否为空
   var addre = this.data.address;
   if (addre==""){
     wx.showToast({
       title: '请先添加地址',
       icon: 'none'
     })
     return false;
   }
  //是否微信支付弹窗
   var self = this;
    wx.showModal({
      title: '支付方式',
      content: '是否微信支付？',
      success: function (res) {
        if (res.confirm) {
          //用户点击确定（调微信支付接口）

        } else if (res.cancel) {
          //用户点击取消
          wx.setStorageSync('isPay', 0);
          //确认下单
          //判断是店内下单还是其他
          var isSd = self.data.isSend;

          if (isSd == 1) { //店内下单
            self.sumb2();
          } else { //自提或快递
            self.sumb();
          }
        }
      }
    })
    this.setData({
      isPay: ispay
    })
  },
  sumb2:function(e){
    //店内下单
    var goodsList = [];//店内下单商品传参
    var merchantId = this.data.merchantId;//商户主键
    var userName = '';//用户名(不知道哪里获得)
    var bussinessType = 1;
    var payStatus = this.data.isPay;//支付状态（未支付0，成功1，失败2）
    for (var i in this.data.orderGood) {
      var goos = this.data.orderGood[i];
      goodsList.push({
        actualPayment: goos[i].actualPayment,
        goodsId: goos[i].goodsId,
        goodsName: goos[i].goodsName,
        goodsNum: goos[i].goodsNum,
        goodsPrice: goos[i].goodsPrice,
        goodsType: goos[i].goodsType,
        id: goos[i].id,
        num: goos[i].num,
        shopId: goos[i].shopId,
        unitPrice: goos[i].unitPrice,
        shouldPay: parseInt(goos[i].goodsNum) * parseInt(goos[i].unitPrice)
      });
    }
    app.util.reqAsync('shop/submitShopOrderV2', {
      goodsList: goodsList,
      userId: this.data.customerId,
      shopId: this.data.shopId,
      userName: userName,
      merchantId: merchantId,
      price: this.data.totalMoney
    }).then((data) => {
      if (data.data.code==9){ //
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
        wx.navigateTo({
          url: '../shoppingCart/shoppingCart'
        })
      }else{
        if (payStatus==1){
          this.setData({
            flagOrder: false
          })
        }else{ //支付失败或者未支付跳到购物车
          wx.showToast({
            title: '支付失败',
            icon: 'none'
          })
          wx.navigateTo({
            url: '../shoppingCart/shoppingCart'
          })
        }
        
      }
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  sumb:function(e){
    //快递或自提
    var goodsList = [];//店内下单商品传参
    var merchantId = this.data.merchantId;//商户主键
    var userName = '';//用户名(不知道哪里获得)
    var bussinessType = 1;
    var deliveryMoney = 0;//快递金额不知道哪里获得
    var payStatus = this.data.isPay;//支付状态（未支付0，成功1，失败2）

      for (var i in this.data.orderGood) {

        var goos = this.data.orderGood[i];
       
        goodsList.push({
          actualPayment: goos.actualPayment,
          goodsId: goos.goodsId,
          goodsName: goos.goodsName,
          goodsNum: goos.goodsNum,
          goodsPrice: goos.goodsPrice,
          goodsType: goos.goodsType,
          id: goos.id,
          num: goos.num,
          shopId: goos.shopId,
          unitPrice: goos.unitPrice,
          shouldPay: parseInt(goos.goodsNum) * parseInt(goos.unitPrice),
          remake: "",
          stockId: goos.stockId
        });
      }
    
    
    app.util.reqAsync('shop/submitOnlineOrder', {
      goodsList: goodsList,
      source: "MOBILE",//订单来源
      amount: this.data.totalMoney,
      areaId: this.data.areaId,
      bussinessId: this.data.shopId,
      bussinessType: bussinessType,
      cityId: this.data.cityId,
      customerId: this.data.customerId,
      deliveryMoney: deliveryMoney,
      deliveryType: this.data.isSend,//配送方式(0-快递；1-送货上门；2-自取)
      extend4: '1',//版本
      userName: userName,
      payStatus: payStatus,////支付状态（未支付0，成功1，失败2）
      merchantId: merchantId,
      payType: 3, //支付方式（货到付款0，在线支付1，支付宝支付2，微信支付3）目前只有微信支付
      price: this.data.totalMoney,//价格
      provinceId: this.data.provinceId,
      realMoney: this.data.totalMoney //实际支付金额(目前不知道优惠所以先未算优惠)
    }).then((data) => {
      if (data.data.code==9){
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
        wx.navigateTo({
          url: '../shoppingCart/shoppingCart'
        })
      }else{
        console.log(payStatus)
        if (payStatus==1){ //支付成功
          this.setData({
            flagOrder: false
          })
        }else{ //到订单详情页
          wx.showToast({
            title: '支付失败',
            icon: 'none'
          })
          wx.navigateTo({
            url: '../shoppingCart/shoppingCart'
          })
        }
      }
     
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  }

})