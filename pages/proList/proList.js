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
    // hasChooseStock: false,

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
    var shopId = wx.getStorageSync('shopId')
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
    if(!shop){
      util.getShop(user.id, shopId).then(res=>{
        if(res.data.code==1){
          wx.setStorageSync('shop', res.data.data.shopInfo);
          shop = wx.getStorageSync('shop')
          util.reqAsync('shop/getShopGoodsCategoryList', {
            merchantId: shop.merchantId,
            shopId: shop.id
          }).then((resCategory) => {
            let shopCategory = resCategory.data.data
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
            let goods = []

            // 新的获取所有商品
            util.reqAsync('shop/getShopGoodsMore', {
              merchantId: shop.merchantId,
              shopId: shop.id,
              customerId: user.id,
              searchType: 1,
              categoryId: null
            }).then((resGoods) => {
              goods = resGoods.data.data

              if (shopCategory[1]) {
                if (shopCategory[1].type == 3) {
                  util.reqAsync('shop/getShopGoodsMore', {
                    merchantId: shop.merchantId,
                    shopId: shop.id,
                    customerId: user.id,
                    searchType: shopCategory[1].type,
                    categoryId: shopCategory[1].categoryId
                  }).then((res) => {

                    let newData = res.data.data
                    if (newData.length != 0) {
                      for (let i = 0; i < newData.length; i++) {
                        goods.push(newData[i])
                      }
                    }
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
                    } else { // 没有商品
                      wx.showToast({
                        title: '暂无商品',
                        icon: 'none'
                      })
                      this.setData({
                        showLoading: false
                      })
                      return
                    }
                    let g = {}
                    for (let j = 0; j < goodMap.length; j++) {
                      if (goodMap[j] && goodMap[j])
                        g[j] = goodMap[j]
                    }
                    let h = {}
                    for (let i = 0; i < stockMap.length; i++) {
                      if (stockMap[i] && stockMap[i])
                        h[i] = stockMap[i]
                    }
                    this.setData({
                      goodMap: g,
                      stockMap: h,
                      goodsInCategory: goodsInCategory,
                      showLoading: false
                    })

                  }).catch((err) => {
                    console.log(err)
                  })
                } else {
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
                  } else { // 没有商品
                    wx.showToast({
                      title: '暂无商品',
                      icon: 'none'
                    })
                    this.setData({
                      showLoading: false
                    })
                    return
                  }
                  let g = {}
                  for (let j = 0; j < goodMap.length; j++) {
                    if (goodMap[j] && goodMap[j])
                      g[j] = goodMap[j]
                  }
                  let h = {}
                  for (let i = 0; i < stockMap.length; i++) {
                    if (stockMap[i] && stockMap[i])
                      h[i] = stockMap[i]
                  }
                  this.setData({
                    goodMap: g,
                    stockMap: h,
                    goodsInCategory: goodsInCategory,
                    showLoading: false
                  })
                  this.shopCartList()
                }

              } else {
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
                } else { // 没有商品
                  wx.showToast({
                    title: '暂无商品',
                    icon: 'none'
                  })
                  this.setData({
                    showLoading: false
                  })
                  return
                }
                let g = {}
                for (let j = 0; j < goodMap.length; j++) {
                  if (goodMap[j] && goodMap[j])
                    g[j] = goodMap[j]
                }
                let h = {}
                for (let i = 0; i < stockMap.length; i++) {
                  if (stockMap[i] && stockMap[i])
                    h[i] = stockMap[i]
                }
                this.setData({
                  goodMap: g,
                  stockMap: h,
                  goodsInCategory: goodsInCategory,
                  showLoading: false
                })

                this.shopCartList()
              }

            }).catch((err) => {
              console.log(err)
            })

            console.log('goodMap')
            console.log(goodMap)

          }).catch((err) => {
            console.log(err)
          })
        }
      })
    }else{
      util.reqAsync('shop/getShopGoodsCategoryList', {
        merchantId: shop.merchantId,
        shopId: shop.id
      }).then((resCategory) => {
        let shopCategory = resCategory.data.data
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
        let goods = []

        // 新的获取所有商品
        util.reqAsync('shop/getShopGoodsMore', {
          merchantId: shop.merchantId,
          shopId: shop.id,
          customerId: user.id,
          searchType: 1,
          categoryId: null
        }).then((resGoods) => {
          goods = resGoods.data.data

          if (shopCategory[1]) {
            if (shopCategory[1].type == 3) {
              util.reqAsync('shop/getShopGoodsMore', {
                merchantId: shop.merchantId,
                shopId: shop.id,
                customerId: user.id,
                searchType: shopCategory[1].type,
                categoryId: shopCategory[1].categoryId
              }).then((res) => {

                let newData = res.data.data
                if (newData.length != 0) {
                  for (let i = 0; i < newData.length; i++) {
                    goods.push(newData[i])
                  }
                }
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
                } else { // 没有商品
                  wx.showToast({
                    title: '暂无商品',
                    icon: 'none'
                  })
                  this.setData({
                    showLoading: false
                  })
                  return
                }
                let g = {}
                for (let j = 0; j < goodMap.length; j++) {
                  if (goodMap[j] && goodMap[j])
                    g[j] = goodMap[j]
                }
                let h = {}
                for (let i = 0; i < stockMap.length; i++) {
                  if (stockMap[i] && stockMap[i])
                    h[i] = stockMap[i]
                }
                this.setData({
                  goodMap: g,
                  stockMap: h,
                  goodsInCategory: goodsInCategory,
                  showLoading: false
                })

              }).catch((err) => {
                console.log(err)
              })
            } else {
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
              } else { // 没有商品
                wx.showToast({
                  title: '暂无商品',
                  icon: 'none'
                })
                this.setData({
                  showLoading: false
                })
                return
              }
              let g = {}
              for (let j = 0; j < goodMap.length; j++) {
                if (goodMap[j] && goodMap[j])
                  g[j] = goodMap[j]
              }
              let h = {}
              for (let i = 0; i < stockMap.length; i++) {
                if (stockMap[i] && stockMap[i])
                  h[i] = stockMap[i]
              }
              this.setData({
                goodMap: g,
                stockMap: h,
                goodsInCategory: goodsInCategory,
                showLoading: false
              })
              this.shopCartList()
            }

          } else {
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
            } else { // 没有商品
              wx.showToast({
                title: '暂无商品',
                icon: 'none'
              })
              this.setData({
                showLoading: false
              })
              return
            }
            let g = {}
            for (let j = 0; j < goodMap.length; j++) {
              if (goodMap[j] && goodMap[j])
                g[j] = goodMap[j]
            }
            let h = {}
            for (let i = 0; i < stockMap.length; i++) {
              if (stockMap[i] && stockMap[i])
                h[i] = stockMap[i]
            }
            this.setData({
              goodMap: g,
              stockMap: h,
              goodsInCategory: goodsInCategory,
              showLoading: false
            })

            this.shopCartList()
          }

        }).catch((err) => {
          console.log(err)
        })

        console.log('goodMap')
        console.log(goodMap)

      }).catch((err) => {
        console.log(err)
      })
    }
    //获取店铺类别列表
    // this.getCategoryList()
 
  },
  onShow: function(){
    // 获取购物车
    this.shopCartList()

  },
  onHide: function () {
     // 清空购物车缓存
    // wx.removeStorageSync('shopCartList')
    let goodMap = this.data.goodMap
    for (var prop in goodMap){
      goodMap[prop].number = 0
    }
    let stockMap = this.data.stockMap
    for (let item in stockMap){
      stockMap[item].number = 0
    }
    this.setData({
      goodStockMapArr: [],
      totalNum: 0,
      totalPay: 0,
      chooseGoodArr: [],
      shoppingCart: {},
      cartGoodsList: [],
      goodMap: goodMap,
      stockMap: stockMap
    });

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
        title: '已达库存上限，不能添加',
        icon: 'none'
      })
      return false
    }
    
    // let goodStockMapArr = this.data.goodStockMapArr
    let stockMap = this.data.stockMap

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
      chosenStockId: null,
      // hasChooseStock: false
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

      let new_number = stockMap[_id].number - 1
      if (new_number <= 0){

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

  /*  this.finger = {}; var topPoint = {};
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

    this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);*/

    let _id = e.target.id.split('_')[1];
    let goodMap = this.data.goodMap

    if (goodMap[_id].attrList){
      this.setData({
        hasAttrList: true
      })
      if (goodMap[_id].attrList.length != 0){
        let attrList = goodMap[_id].attrList
        let myStockTrueFalseArr = []  // 决定属性高亮的数组
        let mychosenArr = []  //已选属性
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
      console.log("没有属性列表")
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
      this.addGoodToCartFn(e)
      // this.startAnimation(e); 
    }
    
  },
  //选择规格(有规格)
  choseStock: function(e){
    var _this = this
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
                _this.setData({
                  chosenStockId: null,
                  chosenStockPrice: null,
                  hasChooseStock: false
                })
              } 
            }
          })
        }else{
          this.setData({
            chosenStockId: stocks[i].id,
            chosenStockPrice: stocks[i].stockPrice,
            // hasChooseStock: true
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
   
    if (this.data.chosenStockId){
      this.setData({
        showStock: false,
        attrList: [],
        stocks: [],
        stockHighLightIndex: -1,
        chosenStockPrice: null
      })

      this.addGoodToCartFn(this.data.chooseGoodEvent)
      // this.startAnimation(this.data.chooseGoodEvent);
    }else{
      wx.showToast({
        title: '请选择规格',
        icon: 'none'
      })
    }
  },
  // 关闭 选择规格弹框
  closeMask: function () {
    this.setData({
      showStock: false,
      chosenStockId: null,
      // hasChooseStock: false,
      attrList: [],
      stocks: [],
      stockHighLightIndex: -1,
      chosenStockPrice: null
    })
  },

  // startAnimation: function (e) {
  //   var index = 0, that = this,
  //     bezier_points = that.linePos['bezier_points'];
      
  //   this.setData({
  //     hide_good_box: false,
  //     bus_x: that.finger['x'],
  //     bus_y: that.finger['y']
  //   })
  //   var len = bezier_points.length;

  //   index = len
  //   this.timer = setInterval(function () {
  //     index--;
  //     that.setData({
  //       bus_x: bezier_points[index]['x'],
  //       bus_y: bezier_points[index]['y']
  //     })
  //     if (index < 1) {
  //       clearInterval(that.timer);
  //       that.addGoodToCartFn(e);
  //       that.setData({
  //         hide_good_box: true
  //       })
  //     }
  //   }, 22);
  // },

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
    let shopCategory = this.data.shopCategory
    util.reqAsync('shop/getShopGoodsMore', {
      merchantId: merchantid,
      shopId: shopid,
      searchType: searchType,
      customerId: wx.getStorageSync('scSysUser').id,
      categoryId: categoryid
    }).then((res) => {

      // 类别中有套盒，选择全部商品 ( 再次获取套盒 合并到所有商品中去 )
      if (categoryid == 'null' && shopCategory[1].type == 3){
        console.log('全部')
        let goods = res.data.data
        util.reqAsync('shop/getShopGoodsMore', {
          merchantId: merchantid,
          shopId: shopid,
          // customerId: user.id,
          searchType: shopCategory[1].type,
          categoryId: shopCategory[1].categoryId
        }).then((newRes) => {
          let newData = newRes.data.data
          if (newData.length != 0) {
            for (let i = 0; i < newData.length; i++) {
              goods.push(newData[i])
            }
          }
          _that.setData({
            goodsInCategory: goods,
            showLoading: false
          })

        })
      }else{
        if (res.data.data) {
          _that.setData({
            goodsInCategory: res.data.data,
            showLoading: false
          })
        } 
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
        if (res.data.data.isLowStock == 1){
          wx.showToast({
            title: '已达库存上限，不能添加',
            icon: 'none'
          })
        }
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
      shopId: shop.id,
      cartType: 0 // 0:店外下单购物车 1:店内和留店购物车
    }).then((res) => {
      console.log("开始计算")
      console.log(goodMap)

      if (res.data.data.length != 0) {

        let cartGoodsList = res.data.data[0].goodsList
        for (let i = 0; i < cartGoodsList.length; i++) {

          if(goodMap[cartGoodsList[i].goodsId]) {
            if (cartGoodsList[i].stockId) {
              // console.log(stockMap[cartGoodsList[i].stockId])
              stockMap[cartGoodsList[i].stockId].number = cartGoodsList[i].number
            } else {
              stockMap[cartGoodsList[i].goodsId].number = cartGoodsList[i].number
            }
          }

        }
        // 先清零 goodMap里的数量， 然后将数量加总
        for (let stockIndex in stockMap) {
          let goodsId = stockMap[stockIndex].goodsId
          goodMap[goodsId].number = 0
        }
        for(let stockIndex in stockMap){
          let goodsId = stockMap[stockIndex].goodsId
          goodMap[goodsId].number += stockMap[stockIndex].number
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
      totalPay: totalPay.toFixed(2),
      cart_length: cart_length
    })
    
  },

  preventTouchMove1: function(){},
  goToDetail: function(e){
    let goods_id = e.currentTarget.dataset.id
    // let status = e.currentTarget.dataset.status

    var shop = wx.getStorageSync('shop');
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?goodsId=' + goods_id + '&shopId=' + shop.id + '&status=' + 3, // 3 普通商品
    })
  },
  jiesuan: function () {
    var user = wx.getStorageSync('scSysUser')
    var shop = wx.getStorageSync('shop')

    let cartGoodsList = this.data.cartGoodsList

    if (cartGoodsList.length > 0) {
      for (let i = 0; i < cartGoodsList.length; i++){
        if (cartGoodsList[i].stockPrice){
          cartGoodsList[i].actualPayment = cartGoodsList[i].stockPrice
          cartGoodsList[i].unitPrice = cartGoodsList[i].stockPrice
        }else{
          cartGoodsList[i].actualPayment = cartGoodsList[i].goodsPrice
          cartGoodsList[i].unitPrice = cartGoodsList[i].goodsPrice
        }
      }

      wx.setStorageSync('cart', cartGoodsList);
      wx.navigateTo({
        url: '../orderBuy/orderBuy?shopId=' + shop.id + '&shopName=' + shop.shopName + '&customerId=' + user.id + '&totalMoney=' + this.data.totalPay
      })

    } 

  }
})
