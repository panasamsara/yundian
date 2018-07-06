//logs.js
const util = require('../../utils/util.js')


var app = getApp()
Page({
  data: {
    shopInformation: null, //店铺信息
    hasShopInfo: false,
    shopCategory: null,
    goodsInCategory: null,
    showStock: false,
    stocks: [],
    stockHighLightIndex: 0,
    logs: [],
    starbg: '../../static/img/drawable-xxdpi/title-bar_collection_normal.png',
    goodsH: 0,
    catHighLightIndex: 0,//左侧列表高亮的下标
    scrollToGoodsView: 0,
    toView: '',
    toViewType: '',
    GOODVIEWID: 'catGood_',
    animation: true,
    goodsNumArr: [0],//记录了每个类型商品占用的高度
    shoppingCart: {},//购物车物品id映射数量
    shoppingCartGoodsId: [],//购物车里面的物品的id
    goodMap: {},//所有物品的列表
    chooseGoodArr: [],//购物车的物品列表
    totalNum: 0,//总数量
    totalPay: 0,//总价
    showShopCart: false,//购物列表是否展示
    fromClickScroll: false,//标记左侧的滚动来源，false是来自于本身的滚动，true是点击引导的滚动,
    timeStart: "",
    timeEnd: "",
    hideCount: true,
    count: 0,
    needAni: false,
    hide_good_box: true,
    url: ""//wx.getStorageSync('url')
  },
  onReady: function () {
    // Do something when page ready.
  },
  onLoad: function (options) {
    //获取店铺信息
    if (app.globalData.shopInfo) {
      this.setData({
        shopInformation: app.globalData.shopInfo,
        hasShopInfo: true
      })
      //获取店铺类别列表
      this.getCategoryList(app.globalData.shopInfo.shopInfo.merchantId, app.globalData.shopInfo.shopInfo.id)
    }
    let systemInfo = wx.getStorageSync('systemInfo');
    let mechine = options;//wx.getStorageSync('mechine');
    let _that = this;

    this.busPos = {};
    this.busPos['x'] = 220;//购物车的位置
    this.busPos['y'] = app.globalData.hh - 56;

    this.setData({
      mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight  - 48
    });
    console.log(mechine)


  },
  onShareAppMessage: function () {
    let _that = this;
    return {
      title: _that.data.chessRoomDetail.shop.name,
      path: "/pages/orderdetail/orderdetail?shopId=" + _that.data.mechine.shopId + "&id=" + _that.data.mechine.id + "&address=" + _that.data.mechine.address
    }
  },

  //左侧列表点击事件
  catClickFn: function (e) {
    let that = this;
    let _index = e.target.id.split('_')[1];
    let categoryId = e.target.id.split('_')[2];

    // //左侧点击高亮
    this.setData({
      fromClickScroll: true
    });
    this.setData({
      catHighLightIndex: _index
    });
    //右侧滚动到相应的类型
    // this.setData({
    //   toView: that.data.GOODVIEWID + categoryId
    // });

    //获取某个类别的商品
    this.getShopGoodsMore(app.globalData.shopInfo.shopInfo.merchantId, app.globalData.shopInfo.shopInfo.id, categoryId)

  },
  //添加商品到购物车
  addGoodToCartFn: function (e) {
    
    let shoppingCart = JSON.parse(JSON.stringify(this.data.shoppingCart));
    let shoppingCartGoodsId = [];

    let _id = e.target.id.split('_')[1];
    let _index = -1;

    if (this.data.shoppingCartGoodsId.length > 0) {
      for (let i = 0; i < this.data.shoppingCartGoodsId.length; i++) {
        shoppingCartGoodsId.push(this.data.shoppingCartGoodsId[i])
        if (_id == this.data.shoppingCartGoodsId[i]) {
          _index = i;
        }
      }
    }

    if (_index > -1) {//已经存在购物车，只是数量变化
      shoppingCart[_id] = Number(shoppingCart[_id]) + 1;
    } else {//新增  
      shoppingCartGoodsId.push(_id);
      shoppingCart[_id] = 1;
    }

    //抛物线的动画
    //this.ballDrop(e);
    //this.touchOnGoods(e);

    this.setData({
      shoppingCart: shoppingCart,
      shoppingCartGoodsId: shoppingCartGoodsId
    });

    this._resetTotalNum();
  },
  touchOnGoods: function (e) {
    this.finger = {}; var topPoint = {};
    this.finger['x'] = e.touches["0"].clientX;//点击的位置
    this.finger['y'] = e.touches["0"].clientY;

    if (this.finger['y'] < this.busPos['y']) {
      topPoint['y'] = this.finger['y'] - 50;
    } else {
      topPoint['y'] = this.busPos['y'] - 50;
    }
    topPoint['x'] = Math.abs(this.finger['x'] - this.busPos['x']) / 2-100;

    if (this.finger['x'] > this.busPos['x']) {
      topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
    } else {//
      topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
    }

    //topPoint['x'] = this.busPos['x'] + 80
    //this.linePos = app.bezier([this.finger, topPoint, this.busPos], 30);
    // console.log(topPoint);
    // console.log(this.finger);
    this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);

    let _id = e.target.id.split('_')[1];
    if (this.data.goodMap[_id].stockList.length != 0){
      this.setData({
        showStock: true,
        stocks: this.data.goodMap[_id].stockList
      })
    }else{
      this.startAnimation(e);
    }
    console.log(1111111111)
    console.log(_id)
    console.log(1111111111)
    
  },
  choseStock: function(e){
    let _index = e.target.id.split('_')[1];
    this.setData({
      stockHighLightIndex: _index
    });
  },
  putInCart: function(){
    
  },
  startAnimation: function (e) {
    var index = 0, that = this,
      bezier_points = that.linePos['bezier_points'];
      
    this.setData({
      hide_good_box: false,
      bus_x: that.finger['x'],
      bus_y: that.finger['y']
    })
    var len = bezier_points.length;
    // console.log(len);
    index = len
    this.timer = setInterval(function () {
      index--;
      that.setData({
        bus_x: bezier_points[index]['x'],
        bus_y: bezier_points[index]['y']
      })
      if (index < 1) {
        clearInterval(that.timer);
        that.addGoodToCartFn(e);
        that.setData({
          hide_good_box: true
        })
      }
    }, 22);
  },
  //移除商品的事件
  decreaseGoodToCartFn: function (e) {
    console.log(e)
    let shoppingCart = JSON.parse(JSON.stringify(this.data.shoppingCart));
    let shoppingCartGoodsId = [];
    let _id = e.target.id.split('_')[1];
    let _index = -1;

    if (this.data.shoppingCartGoodsId.length > 0) {
      for (let i = 0; i < this.data.shoppingCartGoodsId.length; i++) {
        shoppingCartGoodsId.push(this.data.shoppingCartGoodsId[i]);
        if (_id == this.data.shoppingCartGoodsId[i]) {
          _index = i;
        }
      }
    }

    if (_index > -1) {//已经存在购物车，只是数量变化
      shoppingCart[_id] = Number(shoppingCart[_id]) - 1;
      if (shoppingCart[_id] <= 0) {
        shoppingCartGoodsId.splice(_index, 1);
      }
    }

    this.setData({
      shoppingCart: shoppingCart,
      shoppingCartGoodsId: shoppingCartGoodsId
    });

    this._resetTotalNum();
  },
  //重新计算选择的商品的总数和总价
  _resetTotalNum: function () {
    let shoppingCartGoodsId = this.data.shoppingCartGoodsId,
      totalNum = 0,
      totalPay = 0,
      chooseGoodArr = [];

    if (shoppingCartGoodsId) {
      for (let i = 0; i < shoppingCartGoodsId.length; i++) {
        let goodNum = Number(this.data.shoppingCart[shoppingCartGoodsId[i]]);
        totalNum += Number(goodNum);
        totalPay += Number(this.data.goodMap[shoppingCartGoodsId[i]].price) * goodNum;
        chooseGoodArr.push(this.data.goodMap[shoppingCartGoodsId[i]]);
      }
    }

    this.setData({
      totalNum: totalNum,
      totalPay: totalPay.toFixed(2),
      chooseGoodArr: chooseGoodArr
    });
  },
  //电器购物车，购物列表切换隐藏或者现实
  showShopCartFn: function (e) {
    if (this.data.totalPay > 0) {
      this.setData({
        showShopCart: !this.data.showShopCart
      });
    }
  },
  //清空购物车
  clearShopCartFn: function (e) {
    this.setData({
      shoppingCartGoodsId: [],
      totalNum: 0,
      totalPay: 0,
      chooseGoodArr: [],
      shoppingCart: {}
    });
  },
  //结算(无用)
  goPayFn: function (e) {
    let goodsIds = "",
      quantitys = "",
      _that = this;

    for (let i = 0; i < this.data.shoppingCartGoodsId.length; i++) {
      goodsIds += this.data.shoppingCartGoodsId[i] + ",";
      quantitys += this.data.shoppingCart[this.data.shoppingCartGoodsId[i]] + ","
    }

    goodsIds = goodsIds.substring(0, goodsIds.length - 1);
    quantitys = quantitys.substring(0, quantitys.length - 1);

    let param = {
      goodsIds: goodsIds,
      quantitys: quantitys,
      shopId: this.data.chessRoomDetail.shop.id,
      type: 0,//订单类型 0是商品 1是麻将机
      address: this.data.mechine.address
    };
    console.log(param)
    //TODO调用后台接口
    wx.request({
      url: _that.data.url + 'momolewx/wx/order/goods/submit.do',
      data: param,
      method: 'POST',
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        console.log(res)
      }
    })
  },
  goToCart: function(){
    wx.switchTab({
      url: '../shoppingCart/shoppingCart',
    })
  },
  //获取店铺下类别
  getCategoryList: function (merchantid, shopid){
    util.reqAsync('shop/getShopGoodsCategoryList', {
      merchantId: merchantid,
      shopId: shopid
    }).then((res) => {
      if (res.data.data) {
        this.setData({
          shopCategory: res.data.data
        })
        //默认获取第所有类别的商品
        if (this.data.shopCategory) {
          this.getShopGoodsMore(app.globalData.shopInfo.shopInfo.merchantId, app.globalData.shopInfo.shopInfo.id, null)
        }
      } else {}
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  //获取店铺类别下的商品，类别不传 则是所有商品
  getShopGoodsMore: function (merchantid, shopid, categoryid) {
    let _that = this;
    util.reqAsync('shop/getShopGoodsMore', {
      merchantId: merchantid,
      shopId: shopid,
      categoryId: categoryid
    }).then((res) => {
      if (res.data.data) {
        _that.setData({
          goodsInCategory: res.data.data
        })
        //首次进入 未传类别ID，将全部商品赋值给goodMap
        if (!categoryid && typeof categoryid != "undefined" && categoryid != 0){
          let goodMap= []
          for (let i = 0; i < res.data.data.length; i++){
            let goods = res.data.data
            goodMap[goods[i].id] = goods[i];
          }
          _that.setData({
            goodMap: goodMap
          })
          console.log(_that.data.goodMap)
        }
      } 
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  preventTouchMove: function(){

  }

})
