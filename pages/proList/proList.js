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
    chooseGoodEvent: null,
    chosenStockId: null,
    showLoading: true,
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
    var shop = wx.getStorageSync('shop')
    var user = wx.getStorageSync('scSysUser');
    console.log(user)
    //获取店铺类别列表
    this.getCategoryList()

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
    // console.log(mechine)

    this.shopCartList(user.id)
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
    var shop = wx.getStorageSync('shop')
    //获取某个类别的商品
    this.getShopGoodsMore(shop.merchantId, shop.id, categoryId)

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
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop')
    //添加至购物车，参数： 用户id、商品id、店铺id、规格id
    this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId)
    //获取购物车列表
    this.shopCartList(user.id)
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

    this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);

    let _id = e.target.id.split('_')[1];
    if (this.data.goodMap[_id].stockList.length != 0){
      this.setData({
        showStock: true,
        stocks: this.data.goodMap[_id].stockList,
        chooseGoodEvent: e
      })
    }else{
      this.startAnimation(e);
    }
    
  },
  //选择规格
  choseStock: function(e){
    let _index = e.target.id.split('_')[1];
    let _id = e.target.id.split('_')[2];
    this.setData({
      stockHighLightIndex: _index,
      chosenStockId: _id
    });
  },
  //选择规格的确认按钮
  choseStockYesBtn: function(){
    this.setData({
      showStock: false,
    });
    this.startAnimation(this.data.chooseGoodEvent);
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
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop')
    //参数： 用户id、商品id、店铺id、规格id
    this.delNewShopCartGoods(user.id, _id, shop.id, e.currentTarget.dataset['stockid'])
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
        // chooseGoodArr.push(this.data.goodMap[shoppingCartGoodsId[i]]);
      }
    }

    this.setData({
      totalNum: totalNum,
      totalPay: totalPay.toFixed(2),
      // chooseGoodArr: chooseGoodArr
    });
  },
  //购物列表切换隐藏或者现实
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

  goToCart: function(){
    wx.switchTab({
      url: '../shoppingCart/shoppingCart',
    })
  },
  //获取店铺下类别
  getCategoryList: function (){
    var shop = wx.getStorageSync('shop')
    util.reqAsync('shop/getShopGoodsCategoryList', {
      merchantId: shop.merchantId,
      shopId: shop.id
    }).then((res) => {
      if (res.data.data) {
        this.setData({
          shopCategory: res.data.data
        })
        //默认获取第所有类别的商品
        if (this.data.shopCategory) {
          this.getShopGoodsMore(shop.merchantId, shop.id, null)
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
          goodsInCategory: res.data.data,
          showLoading: false
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

  },
  //云店接口，添加商品到购物车
  updateNewShopCartV2: function (customerid, goodsid, shopid, stockid) {
    util.reqAsync('shop/updateNewShopCartV2', {
      customerId: customerid,
      goodsId: goodsid,
      number: 1,
      shopId: shopid,
      stockId: stockid
    }).then((res) => {
      // console.log(res.data.data)
      var user = wx.getStorageSync('scSysUser');
      this.shopCartList(user.id)
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  //云店接口，移除购物车商品
  delNewShopCartGoods: function (customerid, goodsid, shopid, stockid) {
    util.reqAsync('shop/delNewShopCartGoods', {
      shopCarts: [{
        customerId: customerid,
        goodsId: goodsid,
        number: 1,
        shopId: shopid,
        stockId: stockid
      }]
      
    }).then((res) => {
      // console.log(res.data.data)
      var user = wx.getStorageSync('scSysUser');
      this.shopCartList(user.id)
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  //云店接口，获取购物车列表
  shopCartList: function (customerid) {
    util.reqAsync('shop/shopCartList', {
        customerId: customerid
    }).then((res) => {
      console.log(res.data)
      let goods = res.data.data
      let totalNum = 0
      let totalPay = 0
      let chooseGoodArr = [];
      for (let i = 0; i < goods.length; i++){
        let lists = goods[i].goodsList
        for (let j = 0; j < lists.length; j++){
          totalNum += lists[j].number;
          totalPay += lists[j].number * lists[j].goodsPrice
          chooseGoodArr.push(lists[j])
        }
      }
      // console.log(totalNum)
      // console.log(totalPay)
      this.setData({
        chooseGoodArr: chooseGoodArr,
        totalNum: totalNum,
        totalPay: totalPay
      });
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  preventTouchMove: function(){}

})
