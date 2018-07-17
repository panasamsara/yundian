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
    chosenStockPrice: null,
    showLoading: true,
    stockHighLightIndex: -1,
    cartData: null,
    goodsInfo: {},
    goodStockMapArr: [],

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
    hasGoodMap: false,
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
  onShow: function(){
    // var user = wx.getStorageSync('scSysUser');
    // this.shopCartList(user.id)
  },

  //左侧列表点击事件
  catClickFn: function (e) {
    let that = this;
    let _index = e.target.id.split('_')[1];
    let categoryId = e.target.id.split('_')[2];
    let searchType = e.target.id.split('_')[3];

    this.setData({
      catHighLightIndex: _index
    });

    var shop = wx.getStorageSync('shop')
    //获取某个类别的商品
    this.getShopGoodsMore(shop.merchantId, shop.id, searchType, categoryId)

  },
  //添加商品到购物车
  addGoodToCartFn: function (e) {
    let _id = e.target.id.split('_')[1];
    let stockId = e.target.id.split('_')[2];
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop')
    let shoppingCart = this.data.shoppingCart
    let goods_number = 1
    let chooseGoodArr = this.data.chooseGoodArr

    let goodStockMapArr = this.data.goodStockMapArr
    if (stockId){
      for (let i = 0; i < goodStockMapArr.length; i++) {
        if (goodStockMapArr[i].goodsId == _id && goodStockMapArr[i].stockId == stockId) {
          goodStockMapArr[i].number += 1
        }
      }
    }else{
      for (let i = 0; i < goodStockMapArr.length; i++) {
        if (goodStockMapArr[i].goodsId == _id && goodStockMapArr[i].stockId == this.data.chosenStockId) {
          goodStockMapArr[i].number += 1
        }
      }
    }

    
    this.mathTotal(goodStockMapArr)

    // 更新 商品数量后，添加到购物车
  /*  if (stockId){ 
      console.log('有stockId')
      if (stockId != 'null') { // 如果点击的商品有规格
        console.log(stockId)
        if (chooseGoodArr.length != 0) { //如果购物车有商品
          for (let i = 0; i < chooseGoodArr.length; i++) { //循环购物车所有商品
            console.log(333)
            if (chooseGoodArr[i].stockId) { // 如果购物车商品下 有分规格
              console.log(444)

              if (chooseGoodArr[i].stockId == stockId) { // 如果新增的是 已有规格商品
                console.log(555)
                goods_number = chooseGoodArr[i].number + 1
                this.updateNewShopCartV2(user.id, _id, shop.id, chooseGoodArr[i].stockId, this.data.goodMap[_id].goodsName, goods_number)
              } else { //如果是 新增规格 在购物车不存在
                console.log(666)

                this.updateNewShopCartV2(user.id, _id, shop.id, chooseGoodArr[i].stockId, this.data.goodMap[_id].goodsName, chooseGoodArr[i].number)
              }
            } else {  // 该商品下 无规格
              console.log(777)
              goods_number = chooseGoodArr[i].number + 1
              this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, goods_number)
            }

          }
        } else { //如果购物车无商品
          console.log(888)
          this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, 1)
        }

      } else { // 如果点击的商品无规格
        console.log(999)
        //添加至购物车，参数(   用户id、商品id、店铺id、规格id、goodsName、goods_number  )
        if (chooseGoodArr.length != 0) { //如果购物车有商品
          for (let i = 0; i < chooseGoodArr.length; i++) { //循环购物车所有商品
            console.log(333)
            if (chooseGoodArr[i].stockId) { // 如果购物车商品下 有分规格
              console.log(444)
              console.log(chooseGoodArr[i].stockId)
              if (chooseGoodArr[i].stockId == stockId) { // 如果新增的是 已有规格商品
                console.log(555)
                goods_number = chooseGoodArr[i].number + 1
                this.updateNewShopCartV2(user.id, _id, shop.id, chooseGoodArr[i].stockId, this.data.goodMap[_id].goodsName, goods_number)
              } else { //如果是 新增规格 在购物车不存在
                console.log(666)
                console.log(this.data.chosenStockId)
                this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, 1)
              }
            } else {  // 该商品下 无规格
              console.log(777)
              goods_number = chooseGoodArr[i].number + 1
              this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, goods_number)
            }

          }
        } else { //如果购物车无商品
          console.log(888)
          this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, 1)
        }

      }
    } else{ 
      console.log('无stockId')
      console.log(chooseGoodArr)
      if (chooseGoodArr.length != 0) { //如果购物车有商品
        for (let i = 0; i < chooseGoodArr.length; i++) { //循环购物车所有商品
          console.log("3333333进入for")
          if (chooseGoodArr[i].stockId) { // 如果购物车商品下 有分规格
            console.log(444)
            console.log(chooseGoodArr[i].stockId)
            console.log(this.data.chosenStockId)
            if (chooseGoodArr[i].stockId == this.data.chosenStockId) { // 如果新增的是 已有规格商品
              console.log(555)
              goods_number = chooseGoodArr[i].number + 1
              this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, goods_number)
            } else { //如果是 新增规格 在购物车不存在
              console.log(666)
              this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, chooseGoodArr[i].number)
            }
          } else {  // 该商品下 无规格
            console.log(777)
            goods_number = chooseGoodArr[i].number + 1
            this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, goods_number)
          }

        }
      } else { //如果购物车无商品
        console.log(888)
        this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, this.data.goodMap[_id].goodsName, 1)
      }
    }
    
    */

  },
  //移除商品的事件
  decreaseGoodToCartFn: function (e) {
    let _id = e.target.id.split('_')[1];
    let stockId = e.target.id.split('_')[2];
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop')
    let shoppingCart = this.data.shoppingCart
    let goods_number = 0
    let chooseGoodArr = this.data.chooseGoodArr

    let goodStockMapArr = this.data.goodStockMapArr
    for (let i = 0; i < goodStockMapArr.length; i++) {
      if (goodStockMapArr[i].goodsId == _id && goodStockMapArr[i].stockId == stockId) {
        goodStockMapArr[i].number -= 1
      }
    }
    this.mathTotal(goodStockMapArr)

  /*  if (stockId != 'null') { // 如果点击的商品有规
      for (let i = 0; i < chooseGoodArr.length; i++) { //循环购物车所有商品
        if (chooseGoodArr[i].stockId) {
          if (chooseGoodArr[i].stockId == stockId) { //找到该规格的商品
            goods_number = chooseGoodArr[i].number - 1
            this.updateNewShopCartV2(user.id, _id, shop.id, stockId, this.data.goodMap[_id].goodsName, goods_number)
          }
        }

      }
    } else {
      //添加至购物车，参数(   用户id、商品id、店铺id、规格id、goodsName、goods_number  )
      for (let i = 0; i < chooseGoodArr.length; i++) {
        if (chooseGoodArr[i].goodsId == _id) {
          goods_number = chooseGoodArr[i].number - 1
          this.updateNewShopCartV2(user.id, _id, shop.id, stockId, this.data.goodMap[_id].goodsName, goods_number)
        }
      }

    }*/

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
      chosenStockId: _id,
      chosenStockPrice: e.currentTarget.dataset['price']
    });
  },
  //选择规格的确认按钮
  choseStockYesBtn: function(){
    // 不能使用下面关闭方法， 否则规格会被清掉
    this.setData({
      showStock: false,
      stockHighLightIndex: -1,
    })
    if (this.data.chosenStockId){
      this.startAnimation(this.data.chooseGoodEvent);
    }
  },
  // 关闭 选择规格弹框
  closeMask: function () {
    this.setData({
      showStock: false,
      chosenStockId: null,
      stockHighLightIndex: -1,
      chosenStockPrice: null
    })
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
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    console.log(this.data.chooseGoodArr)
    let chooseGoodArr = this.data.chooseGoodArr
    for (let i = 0; i < this.data.chooseGoodArr.length; i++){
      this.updateNewShopCartV2(user.id, chooseGoodArr[i].goodsId, shop.id, chooseGoodArr[i].stockId, chooseGoodArr[i].goodsName, chooseGoodArr[i].number)
    }
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
      let shopCategory = res.data.data
      // 类别中加入 “全部”
      let allCategory = { sequence: 0, type: 1, categoryName: "全部", categoryId: null }
      shopCategory.unshift(allCategory)
      console.log('所有分类')
      console.log(shopCategory)
      if (res.data.data) {
        this.setData({
          shopCategory: res.data.data
        })
        //默认获取第所有类别的商品
        if (this.data.shopCategory) {
          this.getShopGoodsMore(shop.merchantId, shop.id, 1, null)
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
  getShopGoodsMore: function (merchantid, shopid, searchType, categoryid) {
    this.setData({
      showLoading: true
    })
    let _that = this;
    util.reqAsync('shop/getShopGoodsMore', {
      merchantId: merchantid,
      shopId: shopid,
      searchType: searchType,
      customerId: wx.getStorageSync('scSysUser').id,
      categoryId: categoryid
    }).then((res) => {
      console.log("所有商品")
      console.log(res.data.data)
      let goodStockMapArr = []
      
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
            if (goods[i].stockList.length != 0){
              for (let j = 0; j < goods[i].stockList.length; j++ ){
                let goodStockMap = {}
                goodStockMap.goodsName = goods[i].goodsName
                goodStockMap.goodsId = goods[i].id
                goodStockMap.stockId = goods[i].stockList[j].id
                goodStockMap.number = 0
                goodStockMap.goodsPrice = goods[i].price
                goodStockMap.stockPrice = goods[i].stockList[j].stockPrice
                goodStockMap.stockPrice = goods[i].stockList[j].stockPrice
                
                goodStockMapArr.push(goodStockMap)
              }
            }else{
              let goodStockMap = {}
              goodStockMap.goodsName = goods[i].goodsName
              goodStockMap.goodsId = goods[i].id
              goodStockMap.stockId = null
              goodStockMap.number = 0
              goodStockMap.goodsPrice = goods[i].price
              goodStockMap.stockPrice = null
              goodStockMap.stockBalance = goods[i].stockBalance

              goodStockMapArr.push(goodStockMap)
            }
            
          }
          console.log("goodMap")
          console.log(goodMap)
          console.log("goodStockMapArr")
          console.log(goodStockMapArr)

          _that.setData({
            goodMap: goodMap,
            hasGoodMap: true,
            goodStockMapArr: goodStockMapArr
          })
        }
        var user = wx.getStorageSync('scSysUser');
        this.shopCartList(user.id)
      } 
    }).catch((err) => {
      console.log(err)
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  preventTouchMove: function(){

  },
  //云店接口，添加商品到购物车
  updateNewShopCartV2: function (customerid, goodsid, shopid, stockid, goodsName, goods_number) {
    util.reqAsync('shop/updateNewShopCartV2', {
      customerId: customerid,
      goodsId: goodsid,
      number: goods_number,
      shopId: shopid,
      stockId: stockid, 
      goodsName: goodsName
    }).then((res) => {
      if (res.data.code == 9){
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
      // 库存不足弹出提示
      if (res.data.data.isLowStock == 1){
        wx.showModal({
          title: '库存不足',
          content: '请选购其他商品',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              // console.log('用户点击确定')
            } 
          }
        })
      }
      var user = wx.getStorageSync('scSysUser');
      this.shopCartList(user.id)
    }).catch((err) => {
      console.log(err)
      // wx.showToast({
      //   title: '失败……',
      //   icon: 'none'
      // })
    })
  },
  //云店接口，移除购物车商品
/*  delNewShopCartGoods: function (customerid, goodsid, shopid, stockid) {
    util.reqAsync('shop/delNewShopCartGoods', {
      shopCarts: [{
        customerId: customerid,
        goodsId: goodsid,
        number: 1,
        shopId: shopid,
        stockId: stockid
      }]
      
    }).then((res) => {

      var user = wx.getStorageSync('scSysUser');
      this.shopCartList(user.id)
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },  */
  //云店接口，获取购物车列表
  shopCartList: function (customerid) {
    this.setData({
      shoppingCart: {}
    })
    var shop = wx.getStorageSync('shop');
    util.reqAsync('shop/shopCartList', {
        customerId: customerid,
        shopId: wx.getStorageSync('shop').id
    }).then((res) => {
      console.log("购物车")
      console.log(res.data.data)
      console.log("获取购物车之后打印 goodStockMapArr")
      console.log(this.data.goodStockMapArr)

      
      let goodStockMapArr = this.data.goodStockMapArr
      if(res.data.data.length != 0){
        let cartData = res.data.data[0] //购物车商品（此商户下）
        
        let goodStockMapArr = this.data.goodStockMapArr
        
        if (cartData){
          let lists = cartData.goodsList
          let chooseGoodArr = []
          for (let i = 0; i < lists.length; i++) {
            chooseGoodArr.push(lists[i]) // 已选商品
          }

          for (let x = 0; x < goodStockMapArr.length; x++) {
            for (let y = 0; y < chooseGoodArr.length; y++) {
              if (goodStockMapArr[x].goodsId == chooseGoodArr[y].goodsId && goodStockMapArr[x].stockId == chooseGoodArr[y].stockId) {
                goodStockMapArr[x].number += chooseGoodArr[y].number
              }
            }
          }
          console.log("获取购物车之后打印 goodStockMapArr")
          console.log(this.data.goodStockMapArr)
          this.setData({
            chooseGoodArr: chooseGoodArr,
          });

          this.mathTotal(goodStockMapArr)

        }else{
          //购物车无数据 初始化底部结算的数据
          this.setData({
            chooseGoodArr: [],
            totalNum: 0,
            totalPay: 0,
            shoppingCart: {},
            cartData: null
          });
        }

      }else{
        //购物车无数据 初始化底部结算的数据
        this.setData({
          chooseGoodArr: [],
          totalNum: 0,
          totalPay: 0,
          shoppingCart: {}
        });
      }
      
    }).catch((err) => {
      console.log(err)
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  mathTotal: function (goodStockMapArr){
    
    let totalNum = 0
    let totalPay = 0
    let shoppingCart = JSON.parse(JSON.stringify(this.data.shoppingCart));
    let chooseGoodArr = []
    for (let x = 0; x < goodStockMapArr.length; x++){
      if (goodStockMapArr[x].number > 0){
        chooseGoodArr.push(goodStockMapArr[x])
      }

      totalNum += goodStockMapArr[x].number   // 总数量
      if (goodStockMapArr[x].stockId) {       // 总金额
        totalPay += goodStockMapArr[x].number * goodStockMapArr[x].stockPrice;
      } else {
        totalPay += goodStockMapArr[x].number * goodStockMapArr[x].goodsPrice;
      }
    }
    
    let goodsIdArr = []
    var uniqGoodsIdArrnew = [] // 商品ID 去重后的数组
    for (let i = 0; i < chooseGoodArr.length; i++){
      goodsIdArr.push(chooseGoodArr[i].goodsId)
      for (let i = 0; i < goodsIdArr.length; i++) {
        if (uniqGoodsIdArrnew.indexOf(goodsIdArr[i]) == -1) {
          uniqGoodsIdArrnew.push(goodsIdArr[i])
        }
      }
    }
    // 计算一个 商品（包含不同规格）的总数量
    var goodsObj = JSON.parse(JSON.stringify(this.data.shoppingCart));
    for (let i = 0; i < uniqGoodsIdArrnew.length; i++) {
      goodsObj[uniqGoodsIdArrnew[i]] = []
      for (let j = 0; j < chooseGoodArr.length; j++) {
        if (chooseGoodArr[j].goodsId == uniqGoodsIdArrnew[i]) {
          goodsObj[uniqGoodsIdArrnew[i]].push(chooseGoodArr[j])
        }
      }
    }
    for (let i = 0; i < uniqGoodsIdArrnew.length; i++) {
      let goodid = uniqGoodsIdArrnew[i]
      shoppingCart[goodid] = 0
      for (let k = 0; k < goodsObj[goodid].length; k++) {
        shoppingCart[goodid] += goodsObj[goodid][k].number
      }
    }

    this.setData({
      goodStockMapArr: goodStockMapArr,
      totalNum: totalNum,
      totalPay: totalPay,
      chooseGoodArr: chooseGoodArr,
      shoppingCart: shoppingCart
    })
    console.log("99999999999 计算数量")
    console.log(goodStockMapArr)
    console.log("99999999999 已选商品")
    console.log(chooseGoodArr)
    
  },

  preventTouchMove1: function(){},
  goToDetail: function(e){
    let goods_id = e.target.id
    var shop = wx.getStorageSync('shop');
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?goodsId=' + goods_id + '&shopId=' + shop.id,
    })
  }
})
