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
    attrList: {},
    cartGoodsList: [],
    attrid: null,

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
    stockMap: {},
    hasGoodMap: false,
    chooseGoodArr: [],//购物车的物品列表
    totalNum: 0,//总数量
    totalPay: 0,//总价
    cart_length: 0,
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
    
    let systemInfo = wx.getStorageSync('systemInfo');
    let mechine = options;//wx.getStorageSync('mechine');
    let _that = this;

    this.busPos = {};
    this.busPos['x'] = 40;//小球进购物车的位置
    this.busPos['y'] = app.globalData.hh - 56;

    this.setData({
      mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight  - 48
    });
    // console.log(mechine)

    //获取店铺类别列表
    // this.getCategoryList()
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
      this.setData({
        shopCategory: shopCategory
      })
      var goodMap = []
      var stockMap = []
      let goodsInCategory = []
      for (let i = 0; i < shopCategory.length; i++){
        // 根据每个类别 把所有商品查出来
        if (i != shopCategory.length-1){
          util.reqAsync('shop/getShopGoodsMore', {
            merchantId: shop.merchantId,
            shopId: shop.id,
            customerId: user.id,
            searchType: shopCategory[i].type,
            categoryId: shopCategory[i].categoryId
          }).then((res) => {
            let goods = res.data.data
            if (goods){
              if (goods.length != 0) {
                for (let j = 0; j < goods.length; j++) {
                  goodMap[goods[j].id] = goods[j];
                  goodMap[goods[j].id].number = 0
                  goodsInCategory.push(goods[j])

                  if (goods[j].stockList.length != 0) {
                    for (let k = 0; k < goods[j].stockList.length; k++) {
                      let goodStock = []
                      goodStock.goodsName = goods[j].goodsName
                      goodStock.goodsId = goods[j].id
                      goodStock.stockId = goods[j].stockList[k].id
                      goodStock.number = 0
                      goodStock.goodsPrice = goods[j].price
                      goodStock.stockPrice = goods[j].stockList[k].stockPrice
                      goodStock.stockPrice = goods[j].stockList[k].stockPrice
                      stockMap[goodStock.stockId] = goodStock
                    }
                  } else {
                    let goodStock = []
                    goodStock.goodsName = goods[j].goodsName
                    goodStock.goodsId = goods[j].id
                    goodStock.stockId = null
                    goodStock.number = 0
                    goodStock.goodsPrice = goods[j].price
                    goodStock.stockPrice = null
                    goodStock.stockBalance = goods[j].stockBalance
                    stockMap[goodStock.goodsId] = goodStock
                  }
                }
              }
            }
            

          }).catch((err) => {
            console.log(err)
          })
        }else{
          util.reqAsync('shop/getShopGoodsMore', {
            merchantId: shop.merchantId,
            shopId: shop.id,
            customerId: user.id,
            searchType: shopCategory[i].type,
            categoryId: shopCategory[i].categoryId
          }).then((res) => {
            let goods = res.data.data

            if (goods.length != 0) {
              for (let j = 0; j < goods.length; j++) {
                goodMap[goods[j].id] = goods[j];
                goodMap[goods[j].id].number = 0
                goodsInCategory.push(goods[j])

                if (goods[j].stockList.length != 0) {
                  for (let k = 0; k < goods[j].stockList.length; k++) {
                    let goodStock = {}
                    goodStock.goodsName = goods[j].goodsName
                    goodStock.goodsId = goods[j].id
                    goodStock.stockId = goods[j].stockList[k].id
                    goodStock.number = 0
                    goodStock.goodsPrice = goods[j].price
                    goodStock.stockPrice = goods[j].stockList[k].stockPrice
                    goodStock.stockPrice = goods[j].stockList[k].stockPrice
                    stockMap[goodStock.stockId] = goodStock
                  }
                } else {
                  let goodStock = {}
                  goodStock.goodsName = goods[j].goodsName
                  goodStock.goodsId = goods[j].id
                  goodStock.stockId = null
                  goodStock.number = 0
                  goodStock.goodsPrice = goods[j].price
                  goodStock.stockPrice = null
                  goodStock.stockBalance = goods[j].stockBalance
                  stockMap[goodStock.goodsId] = goodStock
                }
              }
            }
            this.setData({
              goodMap: goodMap,
              stockMap: stockMap,
              goodsInCategory: goodsInCategory,
              showLoading: false
            })
            // 获取购物车
            this.shopCartList()

          }).catch((err) => {
            console.log(err)
          })
        }
        
      }
      
      console.log('goodMap')
      console.log(goodMap)
      console.log('stockMap')
      console.log(stockMap)
      console.log('goodsInCategory')
      console.log(goodsInCategory)


    /*  util.reqAsync('shop/shopCartList', {
        customerId: user.id,
        shopId: shop.id
      }).then((res) => {
        if (res.data.data.length != 0){
          console.log('购物车')
          console.log(res.data.data[0].goodsList)
          let cartGoodsList = res.data.data[0].goodsList
          for (let i = 0; i < cartGoodsList.length; i++){
            console.log(goodMap[cartGoodsList[i].goodsId].number)

            goodMap[cartGoodsList[i].goodsId].number = cartGoodsList[i].number
            if (cartGoodsList[i].stockId){
              console.log(99999)
              stockMap[cartGoodsList[i].stockId].number = cartGoodsList[i].number
            }else{
              console.log(8888)
              // stockMap[cartGoodsList[i].goodsId].number = cartGoodsList[i].number
            }
            
          }
          this.setData({
            goodMap: goodMap,
            stockMap: stockMap
          })
          console.log('新的stockMap')
          console.log(this.data.stockMap)
        }

      }).catch((err) => {
        console.log(err)
      })*/

    }).catch((err) => {
      console.log(err)
    })
  },
  onShow: function(){
    // 获取购物车
    this.shopCartList()
    // 获取购物车信息
  /*  util.reqAsync('shop/shopCartList', {
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id
    }).then((res) => {
      wx.setStorageSync('shopCartList', res.data.data);

      //获取店铺类别列表
      this.getCategoryList()
    })*/
  },
  onHide: function () {
     // 清空购物车缓存
    // wx.removeStorageSync('shopCartList')
    // this.setData({
    //   goodStockMapArr: [],
    //   totalNum: 0,
    //   totalPay: 0,
    //   chooseGoodArr: [],
    //   shoppingCart: {}
    // });
    
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
    // let goods_number = 1
    // let chooseGoodArr = this.data.chooseGoodArr
   
    if (this.data.goodMap[_id].stockBalance == 0){
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return false
    }
    
    // let goodStockMapArr = this.data.goodStockMapArr
    let stockMap = this.data.stockMap
    console.log(stockMap)
    console.log(_id)
    if (stockId != 'null' && stockId && stockId != undefined){
      console.log(stockMap[stockId])
      let new_number = stockMap[stockId].number + 1
      this.updateNewShopCartV2(user.id, _id, shop.id, stockId, stockMap[stockId].goodsName, new_number )

    }else{
      if (this.data.chosenStockId){
        let new_number_a = stockMap[this.data.chosenStockId].number + 1
        this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, stockMap[this.data.chosenStockId].goodsName, new_number_a)
      }else{
        let new_number_b = stockMap[_id].number + 1
        this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, stockMap[_id].goodsName, new_number_b)
      }
      

    }

    // this.mathTotal(goodStockMapArr)

    // 添加成功后，清除之前选中的规格
    this.setData({
      chosenStockId: null
    })

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

    // let goodStockMapArr = this.data.goodStockMapArr
    let stockMap = this.data.stockMap
    let goodMap = this.data.goodMap

    console.log(stockId)
    if (stockId != 'null' && stockId && stockId != undefined) {
      console.log(7777)
      let new_number = stockMap[stockId].number - 1
      if (new_number <=0){
        this.deleteGoods(user.id, shop.id, stockId, stockMap[stockId].goodsId ) 
        // goodMap[stockMap[stockId].goodsId].number = 0
        // this.setData({
        //   goodMap: goodMap
        // })
        console.log(goodMap)
      }else{
        this.updateNewShopCartV2(user.id, _id, shop.id, stockId, stockMap[stockId].goodsName, new_number)
      }
      

    } else {
      console.log(888888)
      let new_number = stockMap[_id].number - 1
      if (new_number <= 0){
        console.log(888889)
        this.deleteGoods(user.id, shop.id, null, stockMap[_id].goodsId ) 
        // goodMap[stockMap[_id].goodsId].number = 0
        // this.setData({
        //   goodMap: goodMap
        // })
      }else{
        this.updateNewShopCartV2(user.id, _id, shop.id, null, stockMap[_id].goodsName, new_number)
      }
      
    }
    // 获取购物车
    // this.shopCartList()
    // this.mathTotal(goodStockMapArr)

  },

  touchOnGoods: function (e) {
    this.finger = {}; var topPoint = {};
    this.finger['x'] = e.touches[0].clientX;//点击的位置
    this.finger['y'] = e.touches[0].clientY;

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
    let goodMap = this.data.goodMap
    console.log(goodMap[_id])
    if (goodMap[_id].attrList){
      this.setData({
        hasAttrList: true
      })
      if (goodMap[_id].attrList.length != 0){
        let attrList = goodMap[_id].attrList
        let myStockTrueFalseArr = []
        let mychosenArr = []
        for(let i = 0; i<attrList.length; i++){
          myStockTrueFalseArr[i]=[]
          mychosenArr[i] = false
          for (let j = 0; j < attrList[i].attrIdAndNameList.length; j++){
            myStockTrueFalseArr[i][j] = false
            attrList[i].attrIdAndNameList[j].pindex = i
          }
        }

        console.log(attrList)
        
        this.setData({
          attrList: goodMap[_id].attrList,
          myStockTrueFalseArr: myStockTrueFalseArr,
          mychosenArr: mychosenArr
        })
      }
    }else{
      console.log("没有规格")
      this.setData({
        hasAttrList: false,
        stocks: this.data.goodMap[_id].stockList,
      })
    }

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
  //选择规格(有规格)
  choseStock: function(e){
    let p_index = e.target.id.split('_')[1];
    let _index = e.target.id.split('_')[2];
    // let _id = e.target.id.split('_')[2];
    let attrid = e.currentTarget.dataset['attrid']
    
    let myStockTrueFalseArr = this.data.myStockTrueFalseArr
    let mychosenArr = this.data.mychosenArr
    for (let i = 0; i < myStockTrueFalseArr[p_index].length; i ++){
      myStockTrueFalseArr[p_index][i] = false
    }
    myStockTrueFalseArr[p_index][_index] = true
    mychosenArr[p_index] = true
    let attrArr = []
    for (let i = 0; i < mychosenArr.length; i++){
      attrArr[i] = null
    }
    let attrList = this.data.attrList
    for (let i = 0; i < myStockTrueFalseArr.length; i++){
      for (let j = 0; j < myStockTrueFalseArr[i].length; j++){
        if (myStockTrueFalseArr[i][j] == true){
          attrArr[i] = attrList[i].attrIdAndNameList[j].attrId
        }
      }
    }

    console.log(attrArr)
    this.setData({
      myStockTrueFalseArr: myStockTrueFalseArr,
      mychosenArr: mychosenArr
    });
 
    for (let i = 0; i < attrArr.length; i++){
      if (attrArr[i] == null){
        console.log("无法选出规格")
        return false
      }
    }

    var newStr = ''
    attrArr.sort()
    for (let i = 0; i< attrArr.length; i++){
      attrArr[i] = parseInt(attrArr[i])
    }
    newStr = attrArr.toString()

    let stocks = this.data.stocks
    // 找stockId
    for (let i = 0; i < stocks.length; i++){
      
      if (stocks[i].attrIds.split(',').sort().toString() == newStr){
        console.log(stocks[i])
        if (stocks[i].balance == 0){
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
        }else{
          this.setData({
            chosenStockId: stocks[i].id,
            chosenStockPrice: stocks[i].stockPrice
          })
        }
        
      }
    }

  },
  // 没有规格时 选择默认规格
  choseDefaultStock: function(e){
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
    this.setData({
      showStock: false,
      attrList: [],
      stocks: [],
      stockHighLightIndex: -1
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
      attrList: [],
      stocks: [],
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
 
    if (this.data.cart_length > 0) {
      this.setData({
        showShopCart: !this.data.showShopCart
      });
    }
  },
  //清空购物车
  clearShopCartFn: function () {
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    let cartGoodsList = this.data.cartGoodsList

    for (let i = 0; i < cartGoodsList.length; i++){
      this.deleteGoods(user.id, shop.id, cartGoodsList[i].stockId, cartGoodsList[i].goodsId)
    }
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
        title: '商品类别获取失败……',
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
      
      if (res.data.data) {
        _that.setData({
          goodsInCategory: res.data.data,
          showLoading: false
        })
      } 
    }).catch((err) => {
      console.log(err)
      // wx.showToast({
      //   title: '获取商品失败……',
      //   icon: 'none'
      // })
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
        
      if(res.data.code ==1){
        // 获取购物车
        this.shopCartList()
      }
      
      if (res.data.code == 9){
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }

    }).catch((err) => {
      console.log(err)
      // wx.showToast({
      //   title: '失败……',
      //   icon: 'none'
      // })
    })
  },
  //云店接口，移除购物车商品
  deleteGoods: function (customerId, shopId, stockId, goodsId ) {
    util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
      customerId: customerId,
      shopId: shopId,
      goodsId: goodsId,
      stockId: stockId,
    }).then((res) => {
      console.log("进入删除方法")
      console.log(res)
      let goodMap = this.data.goodMap
      let stockMap = this.data.stockMap
      console.log(stockMap)
      if (stockId){
        goodMap[goodsId].number = 0
        stockMap[stockId].number = 0
      }else{
        goodMap[goodsId].number = 0
        stockMap[goodsId].number = 0
      }

      this.setData({
        goodMap: goodMap
      })

      // 获取购物车
      this.shopCartList()

    }).catch((err) => {
      console.log(err)
      // wx.showToast({
      //   title: '失败……',
      //   icon: 'none'
      // })
    })
  },  
  //云店接口，获取购物车列表
  shopCartList: function (customerid) {
    // this.setData({
    //   shoppingCart: {},
    //   chooseGoodArr: []
    // })
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var goodMap = this.data.goodMap
    var stockMap = this.data.stockMap
    util.reqAsync('shop/shopCartList', {
        customerId: user.id,
        shopId: shop.id
    }).then((res) => {
      console.log("购物车")
      console.log(res.data.data)
      if (res.data.data.length != 0) {

        let cartGoodsList = res.data.data[0].goodsList
        for (let i = 0; i < cartGoodsList.length; i++) {
          // console.log(goodMap[cartGoodsList[i].goodsId])

          goodMap[cartGoodsList[i].goodsId].number = cartGoodsList[i].number
          if (cartGoodsList[i].stockId) {
            // console.log(stockMap[cartGoodsList[i].stockId])
            stockMap[cartGoodsList[i].stockId].number = cartGoodsList[i].number
          } else {
            stockMap[cartGoodsList[i].goodsId].number = cartGoodsList[i].number
          }

        }
        this.setData({
          goodMap: goodMap,
          stockMap: stockMap,
          cartGoodsList: cartGoodsList
        })
        console.log('购物车')
        console.log(cartGoodsList)
        this.mathTotal(cartGoodsList)
      }else{
        this.setData({
          cartGoodsList: 0,
          totalNum: 0,//总数量
          totalPay: 0,
          showShopCart: false,
          cart_length: 0,
        })
      }
    
    }).catch((err) => {
      console.log(err)

    })
  },
  mathTotal: function (cartGoodsList){
    
    let totalNum = 0
    let totalPay = 0
    let cart_length = cartGoodsList.length
    for (let i = 0; i < cartGoodsList.length; i++){
      totalNum += cartGoodsList[i].number
      if (cartGoodsList[i].stockId) {       // 总金额
        totalPay += cartGoodsList[i].number * cartGoodsList[i].stockPrice;
      } else {
        totalPay += cartGoodsList[i].number * cartGoodsList[i].goodsPrice;
      }
    }
    this.setData({
      totalNum: totalNum,
      totalPay: totalPay,
      cart_length: cart_length
    })
    
  },

  preventTouchMove1: function(){},
  goToDetail: function(e){
    let goods_id = e.target.id
    let status = e.currentTarget.dataset['status']

    var shop = wx.getStorageSync('shop');
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?goodsId=' + goods_id + '&shopId=' + shop.id + '&status=' + status,
    })
  }
})
