//logs.js
// const util = require('../../../utils/util.js')
import util from '../../../utils/util.js';
const app = getApp()

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
    goodsHs: 0,
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
    url: "",//wx.getStorageSync('url')
    shopId: '',
    userId: '', 
    merchantId: '',
    isShow: false,
    isShows: true,
    showLoadings: false,
    facilityId: '',
    userName:'',//用户名
    buyopen:false,
    buyclose:true,
    closeheight:540, //整体弹窗高度
    buyheight:80,
    bugGoods:[], //已下单商品
    isBuy:1,//是否下单商品已经结算完毕 0 未结算 1已结算
    presaleId:'',
    memberid:'',
    subaccountid:'',
    discount:'',
    shopName:'',
    buyMoney:0,
    other: [], //去掉重复后的数组
    ifstore: 0, //是否为留店
    purchase: [], //留店商品数据
    purchaseData:[], // 留店商品缓存
    page:1, //留店商品数据请求页码
    rows:5,//留店数据加载每页条数
    hasMoreData:true,//当前数据是否超过每页条数，如果超过，则为true，page加1
    focus: false,
    shop:''
  },
  onReady: function () {
    // Do something when page ready.
  },
  onLoad: function (e) {
    let _this = this
    let systemInfo = wx.getStorageSync('systemInfo');
    this.setData({
      // mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight - 48,
      goodsHs: systemInfo.windowHeight -102
    })

    if (e && e.q) {
      console.log('二维码编译')
      // debugger
      util.checkWxLogin('offline').then((res) => {//判断是否已注册
          _this.setData({
            userId: res.id,
            userName: res.username,
          })
        // debugger
        // 返回登录信息
        if (e.q || e.shopId) {
          var uri = decodeURIComponent(e.q)
          var p = util.getParams(uri)
        }
        let shopId = p.s || e.shopId;
        if (shopId&&res.id) {
          util.getShop(res.id, shopId).then((res) => {
            if (this.onLaunchCallback)
              this.onLaunchCallback(res.data.data)
          })
        }
      });
    }else{
      // debugger
      console.log('扫码进')
      if (!util.hasShop()) {//判断是否有店铺
        wx.redirectTo({ url: '/pages/scan/scan' });
        return
      } else {
        util.checkWxLogin('offline').then((res) => {//判断是否已注册
            _this.setData({
              userId: res.id,
              userName: res.username,
            })
          // debugger
          // 返回登录信息
          console.log(res.id)
          console.log(wx.getStorageSync('shop').id)
          util.getShop(res.id, wx.getStorageSync('shop').id).then((res) => {
            console.log(res)
            let shopInfo=res.data.data.shopInfo;
            goodsInfos = res.data.data.goodsInfos
            _this.getShopInfo({ shopInfo: shopInfo, goodsInfos: goodsInfos })
            _this.getIndexAllInfo(shop.id)
            _this.checkCoupon()
            if (this.data.outQrCodeParam && this.data.outQrCodeParam.offline === '1') {
              wx.switchTab({
                url: '/pages/proList/proList'
              })
            }
          })
        });
      }
    }

    // util.checkWxLogin().then((res) => {
    //   _this.setData({
    //     userId: res.id,
    //     userName: res.username,
    //   })
    //    // 返回登录信息
    //
    //    if (e.q || e.shopId) {
    //      if(e.q){
    //      var uri = decodeURIComponent(e.q)
    //      var p = util.getParams(uri)
    //      }
    //      shopId = p.s || e.shopId
    //
    //      if (res.id && shopId ) {
    //        util.getShop(res.id, shopId).then((res) => {
    //          if (this.onLaunchCallback)
    //            this.onLaunchCallback(res.data.data)
    //        })
    //      }
    //
    //    }
    //
    //  });



    var user = wx.getStorageSync('scSysUser');
    var params, shopId, facilityId;
    // 【扫码进入】，获取店铺ID，存入本地，请求店铺数据
    if (e && e.q) {
      var uri = decodeURIComponent(e.q);
      console.log("通过二维码加载", uri);
      this.data.outQrCodeParam = util.getParams(uri)
      shopId = this.data.outQrCodeParam.s;
      facilityId = this.data.outQrCodeParam.f;
      wx.setStorageSync("facilityId", facilityId);
      this.setData({
        facilityId: facilityId,
        shopId: shopId,
      })
      //util.checkWxLogin().then((res) => {
    }

      this.onLaunchCallback = (shopp) => {
        // 无shopId不设置，有shopId修改shop对象
        // shopId && wx.setStorageSync('shops', { id: shopId, facilityId: facilityId });
        let shop = shopp.shopInfo
        console.log('进入回调---------0999999')
        console.log(shop)
        _this.setData({
          merchantId: shop.merchantId || "",
          // presaleId: presaleId,
          // memberid: orderInfo.memberId || "",
          // subaccountid: orderInfo.subaccountId || "",
          // discount: orderInfo.discount || "",
          shopName: shop.shopName || ""
        });

        /*************** */
        //获取店铺类别列表
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
          _this.setData({
            shopCategory: shopCategory
          })
          var goodMap = []
          var stockMap = []
          let goodsInCategory = []
          let goods = []

          // 新的获取所有商品
          util.reqAsync('shop/getShopGoodsMore', {
            merchantId: shop.merchantId,
            shopId: this.data.shopId,
            customerId: user.id,
            searchType: 1,
            categoryId: null
          }).then((res) => {
            goods = res.data.data
            console.log(goods);
            
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
            _this.setData({
              goodMap: g,
              stockMap: h,
              goodsInCategory: goodsInCategory,
              showLoading: false
            })
            _this.shopCartList()


          }).catch((err) => {
            console.log(err)
          })
          console.log(goodMap)
          console.log(this.data.goodMap)

         


        }).catch((err) => {
          console.log(err)
        })
      }
  },
 
  onShow: function () {
    // this.onLoad()
    // this.getData();
   let _this = this
    // 获取购物车
    // setTimeout(function(){
    //   _this.shopCartList();
    //   _this.bought(); //调用已购订单
    // } , 1000)
    var user = wx.getStorageSync('scSysUser');
    var facilityId = wx.getStorageSync("facilityId");
    
    var orderInfo = wx.getStorageSync('orderInfo'); //订单详情相关
    var presaleId = orderInfo.id || "";
    this.setData({
      presaleId: presaleId,
      memberid: orderInfo.memberId || "",
      subaccountid: orderInfo.subaccountId || "",
      discount: orderInfo.discount || "",
    })

    var shop = wx.getStorageSync('shop');
    if (shop && user){
      this.getData(shop, user)
      
    }

  },
  getData: function (shop, user){
    let _this = this
    let systemInfo = wx.getStorageSync('systemInfo');
    this.setData({
      // mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight - 48,
      goodsHs: systemInfo.windowHeight - 102
    })
    /*************** */
    //获取店铺类别列表
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
      _this.setData({
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
      }).then((res) => {
        goods = res.data.data
        console.log(goods);
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
        _this.setData({
          goodMap: g,
          stockMap: h,
          goodsInCategory: goodsInCategory,
          showLoading: false
        })
        _this.shopCartList()
        _this.bought() 

      }).catch((err) => {
        console.log(err)
      })
      console.log(goodMap)
      console.log(this.data.goodMap)



    }).catch((err) => {
      console.log(err)
    })
        /************* */
  },
  onHide: function () {
    // 清空购物车缓存
    // wx.removeStorageSync('shopCartList')
    let goodMap = this.data.goodMap
    for (var prop in goodMap) {
      goodMap[prop].number = 0
    }
    let stockMap = this.data.stockMap
    for (let item in stockMap) {
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
    this.setData({
      ifstore: 0
    });

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

    // if (this.data.goodMap[_id].stockBalance == 0) {
    //   wx.showToast({
    //     title: '库存不足',
    //     icon: 'none'
    //   })
    //   return false
    // }

    // let goodStockMapArr = this.data.goodStockMapArr
    let stockMap = this.data.stockMap
    console.log(stockMap)
    console.log(_id)
    if (stockId != 'null' && stockId && stockId != undefined) {
      console.log(stockMap[stockId])
      let new_number = stockMap[stockId].number + 1
      this.updateNewShopCartV2(user.id, _id, shop.id, stockId, stockMap[stockId].goodsName, new_number)

    } else {
      if (this.data.chosenStockId) {
        let new_number_a = stockMap[this.data.chosenStockId].number + 1
        this.updateNewShopCartV2(user.id, _id, shop.id, this.data.chosenStockId, stockMap[this.data.chosenStockId].goodsName, new_number_a)
      } else {
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
    // 区分是否为留店商品
    let purchaseType = e.target.id.split('_')[3];
    let purchase_number = e.target.id.split('_')[4];
    var accountRecordId = e.target.id.split('_')[5];
    let cartType = 1;
    var purchaseName;
    console.log(purchaseType);

    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop')
    let shoppingCart = this.data.shoppingCart
    let goods_number = 0
    let chooseGoodArr = this.data.chooseGoodArr;
    var purchaseName = e.target.dataset.goodsName;
    console.log("shoppingCart");
    console.log(shoppingCart);
    // let goodStockMapArr = this.data.goodStockMapArr
    let stockMap = this.data.stockMap
    let goodMap = this.data.goodMap

    console.log(stockId)

    if (stockId != 'null' && stockId && stockId != undefined) {
      console.log(7777)
      // 判断留店商品
      if (purchaseType==6){
        console.log(parseInt(purchase_number));
        var new_number = parseInt(purchase_number) - 1
      }else{
        var new_number = stockMap[stockId].number - 1
      }
      console.log(new_number);
      if (new_number <= 0) {
        if (purchaseType == 6){
          this.deleteGoods(user.id, shop.id, stockId, _id)     
        }else{
          this.deleteGoods(user.id, shop.id, stockId, stockMap[stockId].goodsId)          
        }
        // goodMap[stockMap[stockId].goodsId].number = 0
        // this.setData({
        //   goodMap: goodMap
        // })
        console.log(goodMap)
      } else {
        // 如果是留店商品
        if (purchaseType == 6) {
          this.updatePurchaseNewShopCartV2(user.id, _id, shop.id, stockId, purchaseName, new_number, accountRecordId, purchaseType, cartType);
        } else {
          this.updateNewShopCartV2(user.id, _id, shop.id, stockId, stockMap[stockId].goodsName, new_number)
        }
      }


    } else {
      console.log(888888)
      let new_number = stockMap[_id].number - 1
      if (new_number <= 0) {
        console.log(888889)
        this.deleteGoods(user.id, shop.id, null, stockMap[_id].goodsId)
        // goodMap[stockMap[_id].goodsId].number = 0
        // this.setData({
        //   goodMap: goodMap
        // })
      } else {
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
    console.log(goodMap[_id])
    if (goodMap[_id].attrList) {
      this.setData({
        hasAttrList: true
      })
      if (goodMap[_id].attrList.length != 0) {
        let attrList = goodMap[_id].attrList
        let myStockTrueFalseArr = []  // 决定属性高亮的数组
        let mychosenArr = []  //已选属性
        for (let i = 0; i < attrList.length; i++) {
          myStockTrueFalseArr[i] = []
          mychosenArr[i] = false
          for (let j = 0; j < attrList[i].attrIdAndNameList.length; j++) {
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
    } else {
      console.log("没有规格")
      this.setData({
        hasAttrList: false,
        stocks: this.data.goodMap[_id].stockList,
      })
    }

    if (this.data.goodMap[_id].stockList.length != 0) {
      this.setData({
        showStock: true,
        stocks: this.data.goodMap[_id].stockList,
        chooseGoodEvent: e
      })
    } else {
      this.addGoodToCartFn(e)
      // this.startAnimation(e);
    }

  },
  //选择规格(有规格)
  choseStock: function (e) {
    let p_index = e.target.id.split('_')[1];
    let _index = e.target.id.split('_')[2];
    // let _id = e.target.id.split('_')[2];
    let attrid = e.currentTarget.dataset['attrid']

    let myStockTrueFalseArr = this.data.myStockTrueFalseArr
    let mychosenArr = this.data.mychosenArr
    for (let i = 0; i < myStockTrueFalseArr[p_index].length; i++) {
      myStockTrueFalseArr[p_index][i] = false
    }
    myStockTrueFalseArr[p_index][_index] = true
    mychosenArr[p_index] = true
    let attrArr = []
    for (let i = 0; i < mychosenArr.length; i++) {
      attrArr[i] = null
    }
    let attrList = this.data.attrList
    for (let i = 0; i < myStockTrueFalseArr.length; i++) {
      for (let j = 0; j < myStockTrueFalseArr[i].length; j++) {
        if (myStockTrueFalseArr[i][j] == true) {
          attrArr[i] = attrList[i].attrIdAndNameList[j].attrId
        }
      }
    }

    console.log(attrArr)
    this.setData({
      myStockTrueFalseArr: myStockTrueFalseArr,
      mychosenArr: mychosenArr
    });

    for (let i = 0; i < attrArr.length; i++) {
      if (attrArr[i] == null) {
        console.log("无法选出规格")
        return false
      }
    }

    var newStr = ''
    attrArr.sort()
    for (let i = 0; i < attrArr.length; i++) {
      attrArr[i] = parseInt(attrArr[i])
    }
    newStr = attrArr.toString()

    let stocks = this.data.stocks
    // 找stockId
    for (let i = 0; i < stocks.length; i++) {

      if (stocks[i].attrIds.split(',').sort().toString() == newStr) {
        console.log(stocks[i])
        if (stocks[i].balance == 0) {
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
        } else {
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
  choseDefaultStock: function (e) {
    let _index = e.target.id.split('_')[1];
    let _id = e.target.id.split('_')[2];

    this.setData({
      stockHighLightIndex: _index,
      chosenStockId: _id,
      chosenStockPrice: e.currentTarget.dataset['price']
    });
  },
  //选择规格的确认按钮
  choseStockYesBtn: function () {
    this.setData({
      showStock: false,
      attrList: [],
      stocks: [],
      stockHighLightIndex: -1
    })
    if (this.data.chosenStockId) {
      this.addGoodToCartFn(this.data.chooseGoodEvent)
      // this.startAnimation(this.data.chooseGoodEvent);
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
    console.log("cartGoodsList");
    console.log(cartGoodsList);
    for (let i = 0; i < cartGoodsList.length; i++) {
      this.deleteGoods(user.id, shop.id, cartGoodsList[i].stockId, cartGoodsList[i].goodsId, cartGoodsList[i].purchaseType)
    }
  },

  goToCart: function () {
    wx.switchTab({
      url: '../shoppingCart/shoppingCart',
    })

  },

  //获取店铺下类别
  getCategoryList: function () {
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

      } else { }
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
  preventTouchMove: function () {

  },
  //云店接口，添加商品到购物车
  updateNewShopCartV2: function (customerid, goodsid, shopid, stockid, goodsName, goods_number) {
    util.reqAsync('shop/updateNewShopCartV2', {
      customerId: customerid,
      goodsId: goodsid,
      number: goods_number,
      shopId: shopid,
      stockId: stockid,
      goodsName: goodsName,
      cartType:1,
      purchaseType: 0
    }).then((res) => {

      if (res.data.code == 1) {
        // 获取购物车
        this.shopCartList()
        if (res.data.data.isLowStock == 1) {
          wx.showToast({
            title: '库存不足……',
            icon: 'none'
          })
        }
      }

      if (res.data.code == 9) {
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
  deleteGoods: function (customerId, shopId, stockId, goodsId, purchaseType) {
    // debugger
    var purchaseType = purchaseType;
    util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
      customerId: customerId,
      shopId: shopId,
      goodsId: goodsId,
      stockId: stockId,
      cartType :1
    }).then((res) => {
      console.log("进入删除方法")
      console.log(res)
      let goodMap = this.data.goodMap
      let stockMap = this.data.stockMap
      console.log(stockMap)
      // 留店商品
      if (purchaseType == 6){
        console.log("11");
      }else{
        console.log("22");
        if (stockId) {
          goodMap[goodsId].number = 0
          stockMap[stockId].number = 0
        } else {
          goodMap[goodsId].number = 0
          stockMap[goodsId].number = 0
        }
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
      cartType: 1 //0:店外下单购物车 1:店内和留店购物车
    }).then((res) => {

      if (res.data.data.length != 0) {

        let cartGoodsList = res.data.data[0].goodsList
        for (let i = 0; i < cartGoodsList.length; i++) {
          // console.log(goodMap[cartGoodsList[i].goodsId])

          if (goodMap[cartGoodsList[i].goodsId]) {
            console.log("留店商品价格置为0");
            // 留店商品 价格为0
            if (cartGoodsList[i].purchaseType == 6){
              cartGoodsList[i].stockPrice = 0;
              cartGoodsList[i].goodsPrice = 0;
            }
            else{
              if (cartGoodsList[i].stockId) {
                stockMap[cartGoodsList[i].stockId].number = cartGoodsList[i].number
              } else {
                stockMap[cartGoodsList[i].goodsId].number = cartGoodsList[i].number
              }
            }
          }

        }
        // 先清零 goodMap里的数量， 然后将数量加总
        for (let stockIndex in stockMap) {
          let goodsId = stockMap[stockIndex].goodsId
          goodMap[goodsId].number = 0
        }
        for (let stockIndex in stockMap) {
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
      } else {
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
  mathTotal: function (cartGoodsList) {
    console.log("cartGoodsList")
    console.log(cartGoodsList)
    let totalNum = 0
    let totalPay = 0
    let cart_length = cartGoodsList.length
    for (let i = 0; i < cartGoodsList.length; i++) {
      totalNum += cartGoodsList[i].number
      // 留店商品价格为0
      if (cartGoodsList[i].purchaseType==6){
        cartGoodsList[i].stockPrice = 0;
        cartGoodsList[i].goodsPrice = 0;
      }

      if (cartGoodsList[i].stockId) {       // 总金额
        totalPay += cartGoodsList[i].number * cartGoodsList[i].stockPrice;
      } else {
        totalPay += cartGoodsList[i].number * cartGoodsList[i].goodsPrice;
      }
    }
    this.setData({
      totalNum: totalNum,
      totalPay: totalPay.toFixed(2),
      cart_length: cart_length,
      cartGoodsList: cartGoodsList
    })

  },

  preventTouchMove1: function () { },
  goToDetail: function (e) {
    let goods_id = e.currentTarget.dataset.id
    // let status = e.currentTarget.dataset.status

    wx.navigateTo({
      url: '../goods/goods?goodsId=' + goods_id + '&shopId=' + this.data.shopId + '&status=' + 3 + '&sacn=' + 0, // 3 普通商品
    })
  },
  jiesuan: function () {

    var user = wx.getStorageSync('scSysUser')
    var shop = wx.getStorageSync('shop')

    let cartGoodsList = this.data.cartGoodsList

    if (cartGoodsList.length > 0) {
      for (let i = 0; i < cartGoodsList.length; i++) {
        if (cartGoodsList[i].stockPrice) {
          cartGoodsList[i].actualPayment = cartGoodsList[i].stockPrice
          cartGoodsList[i].unitPrice = cartGoodsList[i].stockPrice
        } else {
          cartGoodsList[i].actualPayment = cartGoodsList[i].goodsPrice
          cartGoodsList[i].unitPrice = cartGoodsList[i].goodsPrice
        }
      }

      wx.setStorageSync('carts', cartGoodsList);
      if (this.data.isBuy == 1) {  //是否下单商品已经结算完毕 0 未结算 1已结算
        this.oneBuy();
      }else{ //修改订单
        this.changeOrdr();
      }


    }

  },
  navShow: function (e) {

    //导航展开
    this.setData({
      isShow: true,
      isShows: false,
      showLoadings: true
    })
  },
  navhide: function (e) {
    //导航收起
    this.setData({
      isShow: false,
      isShows: true,
      showLoadings: false
    })
  },
  changeOrdr:function(e){
    this.setData({
      cart_length: 0
    })
    var cartMoney = this.data.totalPay; //购物车总费
    var buyMoney = this.data.buyMoney; //已下单商品总费用

    var arrList = [];
    for (var a in this.data.bugGoods){ //已下单商品
      if (this.data.bugGoods[a].stockId){
        arrList.push({
          goodsServiceId: this.data.bugGoods[a].goodsServiceId,
          purchaseName: this.data.bugGoods[a].purchaseName,
          purchaseNum: this.data.bugGoods[a].purchaseNum,
          unitPrice: this.data.bugGoods[a].unitPrice,
          actualPayment: Number(this.data.bugGoods[a].purchaseNum) * Number(this.data.bugGoods[a].unitPrice),
          stockId: this.data.bugGoods[a].stockId,
          ids: this.data.bugGoods[a].stockId,
        })
      }else{
        arrList.push({
          goodsServiceId: this.data.bugGoods[a].goodsServiceId,
          purchaseName: this.data.bugGoods[a].purchaseName,
          purchaseNum: this.data.bugGoods[a].purchaseNum,
          unitPrice: this.data.bugGoods[a].unitPrice,
          actualPayment: Number(this.data.bugGoods[a].purchaseNum) * Number(this.data.bugGoods[a].unitPrice),
          stockId: this.data.bugGoods[a].stockId,
          ids: this.data.bugGoods[a].goodsServiceId
        })
      }

    }
    console.log(this.data.cartGoodsList)

    for (var b in this.data.cartGoodsList){
      if (this.data.cartGoodsList[b].stockId && this.data.cartGoodsList[b].stockId != undefined && this.data.cartGoodsList[b].stockId != 'undefined' && this.data.cartGoodsList[b].stockId != null && this.data.cartGoodsList[b].stockId!="null"){
        console.log(1)
        console.log("this.data.cartGoodsList[b].purchaseType");
        console.log(this.data.cartGoodsList[b].purchaseType);
        arrList.push({
          goodsServiceId: this.data.cartGoodsList[b].goodsId,
          purchaseName: this.data.cartGoodsList[b].goodsName,
          purchaseNum: this.data.cartGoodsList[b].number,
          unitPrice: this.data.cartGoodsList[b].stockPrice,
          actualPayment: Number(this.data.cartGoodsList[b].number) * Number(this.data.cartGoodsList[b].stockPrice),
          stockId: this.data.cartGoodsList[b].stockId,
          ids: this.data.cartGoodsList[b].stockId,

          purchaseType: this.data.cartGoodsList[b].purchaseType,
          accountRecordId: this.data.cartGoodsList[b].accountRecordId ? this.data.cartGoodsList[b].accountRecordId : 0
        })
      }else{

        arrList.push({
          goodsServiceId: this.data.cartGoodsList[b].goodsId,
          purchaseName: this.data.cartGoodsList[b].goodsName,
          purchaseNum: this.data.cartGoodsList[b].number,
          unitPrice: this.data.cartGoodsList[b].goodsPrice,
          actualPayment: Number(this.data.cartGoodsList[b].number) * Number(this.data.cartGoodsList[b].goodsPrice),
          stockId: this.data.cartGoodsList[b].stockId,
          ids: this.data.cartGoodsList[b].goodsId,
          purchaseType: this.data.cartGoodsList[b].purchaseType,
          accountRecordId: this.data.cartGoodsList[b].accountRecordId ? this.data.cartGoodsList[b].accountRecordId : 0
        })
      }

    }

    console.log(arrList)

    var sumMoney = 0;
    for (var a in arrList){
      sumMoney += arrList[a].actualPayment
    }
    console.log(sumMoney.toFixed(2))
    //继续下单
    console.log("继续西单")
    app.util.reqAsync('shopOrder/uptPresale', {
      id: this.data.presaleId,
      memberId: this.data.memberId, //memberId
      subaccountId: this.data.subaccountId,
      userId: this.data.userId,
      shouldPay: sumMoney.toFixed(2), //应付
      actualPay: sumMoney.toFixed(2), //实付
      balance: sumMoney.toFixed(2),//不知道是干嘛的但是传实付
      discount: this.data.discount,
      shopId: this.data.shopId,
      shopName: this.data.shopName,
      merchantId: this.data.merchantId,
      orderType:1,
      facilityId: this.data.facilityId,
      scPresaleInfoList: arrList

    }).then((data) => {
      if (data.data.code == 9) {
        this.setData({
          showLoading: true
        })
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
        this.setData({
          cart_length: this.data.cartGoodsList.length
        })
      } else if (data.data.code == 1) { //跳到详情页
      
        wx.setStorageSync("orderNo", data.data.data)
        wx.navigateTo({
          url: '../../../pages/myHome/shopOrder/orderDetail/orderDetail?activeIndex=0&shopId=' + this.data.shopId + '&userId=' + this.data.userId + '&presaleId=' + data.data.data + '&facilityId=' + this.data.facilityId
        })
        this.clearShopCartFn();
      }


    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  uniqueArray: function (array, key){
    var result = [array[0]];
    for (var i = 1; i < array.length; i++) {
      var item = array[i];
      var repeat = false;
      for (var j = 0; j < result.length; j++) {
        if (item[key] == result[j][key]) {
          repeat = true;
          break;
        }
      }
      if (!repeat) {
        result.push(item);
      }
    }
    return result;
  },
  oneBuy:function(e){
    this.setData({
      cart_length:0
    })
    //第一次下单
    var faid = this.data.facilityId;
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    //店内下单
    var goodsList = [];//店内下单商品传参
    var merchantId = this.data.merchantId || shop.merchantId;//商户主键
    var userName = this.data.userName;//用户名
    var bussinessType = 1;
    var payStatus = 0;//支付状态（未支付0，成功1，失败2）
    var cartGoodsList = this.data.cartGoodsList;
    console.log("this.data.cartGoodsList");
    console.log(this.data.cartGoodsList)

    if (cartGoodsList.length > 0) {
      for (let i = 0; i < cartGoodsList.length; i++) {
        if (cartGoodsList[i].stockPrice) {
          cartGoodsList[i].actualPayment = cartGoodsList[i].stockPrice
          cartGoodsList[i].unitPrice = cartGoodsList[i].stockPrice
        } else {
          cartGoodsList[i].actualPayment = cartGoodsList[i].goodsPrice
          cartGoodsList[i].unitPrice = cartGoodsList[i].goodsPrice
        }
      }
      //遍历所有的商品
      for (var i in this.data.cartGoodsList) {
        var goos = this.data.cartGoodsList[i];
        if (goos.stockId) {
          goodsList.push({
            actualPayment: goos.actualPayment,
            goodsId: goos.goodsId,
            goodsName: goos.goodsName,
            goodsNum: goos.number,
            goodsPrice: goos.stockPrice,
            goodsType: goos.goodsType,
            id: goos.id,
            num: goos.number,
            shopId: goos.shopId,
            unitPrice: goos.unitPrice,
            stockId: goos.stockId,
            remake: goos.stockName,
            shouldPay: parseInt(goos.number) * Number(goos.stockPrice),
            accountRecordId: goos.accountRecordId, //添加accountRecordId
            purchaseType: goos.purchaseType //添加purchaseType
          });
        } else {
          goodsList.push({
            actualPayment: goos.actualPayment,
            goodsId: goos.goodsId,
            goodsName: goos.goodsName,
            goodsNum: goos.number,
            goodsPrice: goos.goodsPrice,
            goodsType: goos.goodsType,
            remake: goos.stockName,
            id: goos.id,
            num: goos.number,
            shopId: goos.shopId,
            unitPrice: goos.unitPrice,
            stockId: goos.stockId,
            shouldPay: parseInt(goos.number) * Number(goos.goodsPrice),
            accountRecordId: goos.accountRecordId,   //添加accountRecordId
            purchaseType: goos.purchaseType    //添加purchaseType
          });
        }

      }
      console.log(userName)
      app.util.reqAsync('shop/submitShopOrderV2', {
        goodsList: goodsList,
        userId: this.data.userId || user.id,
        shopId: this.data.shopId || shop.id,
        userName: this.data.userName || user.userName,
        merchantId: merchantId,
        price: this.data.totalPay,
        facilityId: this.data.facilityId,
        cartType: 1
      }).then((data) => {
        this.setData({
          cart_length: this.data.cartGoodsList.length
        })
        if (data.data.code == 9) {
          this.setData({
            showLoading: false,
            showLoadings: false
          })
          wx.showToast({
            title: data.data.msg,
            icon: 'none'
          })

        } else if (data.data.code == 1) { //跳到详情页
       
          console.log(data.data.data.orderId)
          wx.setStorageSync("orderNo", data.data.data.orderId)
          wx.redirectTo({
            url: '../../../pages/myHome/shopOrder/orderDetail/orderDetail?activeIndex=0&shopId=' + this.data.shopId + '&userId=' + this.data.userId + '&presaleId=' + data.data.data.orderId + '&facilityId=' + this.data.facilityId
          })
        }
      })


    }else{
      wx.showToast({
        title: "请先添加商品",
        icon: 'none'
      })
    }

  },
  open:function(e){
    //已下单商品展开
    this.setData({
      buyopen: true,
      buyclose: false,
      closeheight:920,
      buyheight:380
    })
  },
  buyclose:function(e){
    //已下单商品收起
    this.setData({
      buyopen: false,
      buyclose: true,
      closeheight: 620,
      buyheight:80
    })
  },
  bought:function(e){
    var no = wx.setStorageSync("orderNo");
    //获得已下单商品，会根据此来判断是否是第一次下单
    app.util.reqAsync('shopOrder/getPresaleByCondition', {
      shopId: wx.getStorageSync('shop').id,
      userId: wx.getStorageSync('scSysUser').id,
      presaleId: "", //订单id
      facilityId: wx.getStorageSync('facilityId')
    }).then((data) => {
      if (data.data.code == 9) {
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })

      } else if (data.data.code == 1) { //跳到详情页
        if (data.data.data){
          if (data.data.data.orderType == 1) { //订单(小程序为1)
            if (data.data.data.orderStatus == 3) { //已结算
              this.setData({
                bugGoods: [],
                buyMoney: 0,
                isBuy: 1,
                facilityId: data.data.data.facilityId,
                presaleId: data.data.data.scPresaleInfoList[0].presaleId,
                memberid: data.data.data.memberId,
                subaccountid: data.data.data.subaccountId,
                discount: data.data.data.discount,
                merchantId: data.data.data.merchantId,
                shopName: data.data.data.shopName
              })
            } else if (data.data.data.orderStatus == 2) {
              this.setData({
                bugGoods: data.data.data.scPresaleInfoList,
                buyMoney: data.data.data.shouldPay,
                isBuy: 0,
                facilityId: data.data.data.facilityId,
                presaleId: data.data.data.scPresaleInfoList[0].presaleId,
                memberid: data.data.data.memberId,
                subaccountid: data.data.data.subaccountId,
                discount: data.data.data.discount,
                merchantId: data.data.data.merchantId,
                shopName: data.data.data.shopName
              })
            }
          }

        }else{
          this.setData({
            bugGoods: [],
            buyMoney: 0,
            isBuy: 1
          })
        }

      }
    })
  },
  // 获取留店商品数据
  getGiftData: function (message) {
    var that = this;
    this.setData({
      ifstore: 1
    })
    var shop = wx.getStorageSync('shop');
    var purchaseStorage = wx.getStorageSync('purchaseStorage');
    console.log("留店商品");
    util.reqAsync('shopOrder/storeRetentionLists', {
      shopId: shop.id,
      userId: wx.getStorageSync('scSysUser').id,
      merchantId: that.data.merchantId
    }).then((res) => {
      console.log("留店商品列表")
      console.log(res);
      if (res.data.data.length != 0) {
        var purchaseData = wx.getStorageSync('purchaseData');
        if (purchaseData) {
          console.log("有购物车缓存")
          // for (var i = 0; i < purchaseData.length; i++){
          //   for (var j = 0; j < res.data.data.length;j++){
          //     if (res.data.data[i].id == purchaseData[j].accountRecordId){
          //       res.data.data[i]["shopNum"] = purchaseData[j].number;
          //     }
          //   }
          // }
          console.log(purchaseData);
          that.setData({
            purchase: purchaseData
          })
        } else {
          console.log("无购物车缓存")
          // 数据增加加购数量，重置加购数量
          for (let i = 0; i < res.data.data.length; i++) {
            if (!res.data.data[i]["shopNum"]) {
              res.data.data[i]["shopNum"] = 0;
              res.data.data[i]["pitch"] = 0;
            }
          }
          that.setData({
            purchase: res.data.data
          })
        }
      } else {
        wx.showToast({
          title: '暂无留店商品',
          icon: 'none'
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  },
  // 监控输入框
  bindKeyInput: function (e) {
    let goodsId = e.target.id.split('_')[1];
    let shopNum = e.target.id.split('_')[2];
    let remainNum = e.target.id.split('_')[3];
    let id = e.target.id.split('_')[4];
    console.log(id);
    // debugger
    for (let i = 0; i < this.data.purchase.length; i++) {
      if (this.data.purchase[i].id == id) {
        if (e.detail.value.length < 0) {
          this.data.purchase[i]["shopNum"] = 0;
        } else {
          var inputVal = e.detail.value.replace(/^0+/g, "");
          this.data.purchase[i]["shopNum"] = inputVal;
        }
      }
    }
    this.setData({
      purchase: this.data.purchase
    })
  },
  // 输入完成事件
  inputComplete: function (e) {
    let goodsId = e.target.id.split('_')[1];
    let shopNum = e.target.id.split('_')[2];
    let remainNum = e.target.id.split('_')[3];
    let id = e.target.id.split('_')[4];

    for (let i = 0; i < this.data.purchase.length; i++) {
      if (this.data.purchase[i].id == id) {
        if (e.detail.value.length <= 1) {
          this.data.purchase[i]["shopNum"] = 1;
        } else {
          var inputVal = e.detail.value.replace(/^0+/g, "");
          this.data.purchase[i]["shopNum"] = inputVal;
        }
      }
    }
  },
  // 数量 +1
  numPlus: function (e) {
    // debugger
    var goodsId = e.target.id.split('_')[1];
    var stockId = e.target.id.split('_')[2];
    var shopNum = parseInt(e.target.id.split('_')[3]);
    var accountRecordId = parseInt(e.target.id.split('_')[4]);
    var remainNum = parseInt(e.target.id.split('_')[5]);  //表示留店的剩余数
    var balance = parseInt(e.target.id.split('_')[6]); //当前留店商品的库存
    var purchaseNum = parseInt(e.target.id.split('_')[7]); //留店的购买总数量
    var pitch = parseInt(e.target.id.split('_')[8]);
    var purchaseName;
    for (var i = 0; i < this.data.purchase.length; i++) {
      if (this.data.purchase[i].id == accountRecordId) {
        purchaseName = this.data.purchase[i].purchaseName;
        if (shopNum > purchaseNum - 1) {
          wx.showToast({
            title: '超过留店的购买总数量',
            icon: 'none'
          })
        }
        else if (shopNum > remainNum) {
          wx.showToast({
            title: '超过留店剩余数量',
            icon: 'none'
          })
        }
        else if (shopNum > balance) {
          wx.showToast({
            title: '超过留店商品库存',
            icon: 'none'
          })
        }
        else {
          shopNum = parseInt(this.data.purchase[i].shopNum) + 1;
          this.data.purchase[i].shopNum += 1;
          // debugger
          this.addShop(goodsId, stockId, shopNum, purchaseName, accountRecordId, remainNum, balance, purchaseNum);
        }
        this.setData({
          purchase: this.data.purchase
        })
      }
    }
  },
  // 数量 -1
  numReduce: function (e) {
    // debugger
    var goodsId = e.target.id.split('_')[1];
    var stockId = e.target.id.split('_')[2];
    var shopNum = parseInt(e.target.id.split('_')[3]);
    var accountRecordId = parseInt(e.target.id.split('_')[4]);
    var remainNum = parseInt(e.target.id.split('_')[5]);  //表示留店的剩余数
    var purchaseNum = parseInt(e.target.id.split('_')[6]); //留店的购买总数量
    var pitch = parseInt(e.target.id.split('_')[7]);
    var purchaseName;
    for (var i = 0; i < this.data.purchase.length; i++) {
      if (this.data.purchase[i].id == accountRecordId) {
        purchaseName = this.data.purchase[i].purchaseName
        if (shopNum > 1) {
          this.data.purchase[i].shopNum = parseInt(this.data.purchase[i].shopNum) - 1;
          this.reduceShop(goodsId, stockId, 1, purchaseName, accountRecordId, remainNum, purchaseNum);
        }
        // if (shopNum == 1) {
        //   this.data.purchase[i].shopNum = parseInt(this.data.purchase[i].shopNum) - 1;
        //   this.reduceShop(goodsId, stockId, 1, purchaseName, accountRecordId, remainNum, purchaseNum);
        //   this.data.purchase[i].pitch = 0;
        // }
      }
    }
    this.setData({
      purchase: this.data.purchase
    })
  },
  // 留店商品 - 更改加购状态
  changePurchase: function (e) {
    // debugger
    var goodsId = e.target.id.split('_')[1];
    var stockId = e.target.id.split('_')[2];
    var shopNum = e.target.id.split('_')[3];
    var accountRecordId = e.target.id.split('_')[4];
    var remainNum = e.target.id.split('_')[5];  //表示留店的剩余数
    var balance = e.target.id.split('_')[6]; //当前留店商品的库存
    var purchaseNum = e.target.id.split('_')[7]; //留店的购买总数量
    var pitch = e.target.id.split('_')[8];
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var purchaseType = 6;
    var purchaseName;
    var cartType = 1;
    if (pitch == 0) {
      for (var i = 0; i < this.data.purchase.length; i++) {
        if (this.data.purchase[i].id == accountRecordId) {
          purchaseName = this.data.purchase[i].purchaseName;
          this.data.purchase[i].pitch = 1;
        }
      }

      this.setData({
        purchase: this.data.purchase
      })
      this.addShop(goodsId, stockId, shopNum, purchaseName, accountRecordId, remainNum, balance, purchaseNum);
    } else {
      for (var i = 0; i < this.data.purchase.length; i++) {
        if (this.data.purchase[i].id == accountRecordId) {
          var purchaseName = this.data.purchase[i].purchaseName;
          this.data.purchase[i].pitch = 0;
        }
      }
      this.setData({
        purchase: this.data.purchase
      })
      this.reduceShop(goodsId, stockId, shopNum, purchaseName, accountRecordId, remainNum, purchaseNum);
    }
  },
  // 留店商品加购
  addShop: function (goodsId, stockId, shopNum, purchaseName, accountRecordId, remainNum, balance, purchaseNum) {
    // debugger
    var goodsId = goodsId;
    var stockId = stockId;
    var purchaseName = purchaseName;
    var shopNum = parseInt(shopNum);
    var accountRecordId = accountRecordId;
    var purchaseType = 6; // 购买类型   0-商品   6-留店
    var cartType = 1;
    var accountRecordId = accountRecordId;
    var remainNum = parseInt(remainNum);  //表示留店的剩余数
    var balance = parseInt(balance); //当前留店商品的库存
    var purchaseNum = parseInt(purchaseNum); //留店的购买总数量
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var totalShop = shopNum + purchaseNum;

    if (shopNum == 0) {
      wx.showToast({
        title: '请输入购买数量',
        icon: 'none'
      })
    }
    else if (shopNum < remainNum && shopNum < balance && shopNum < purchaseNum) {
      this.updatePurchaseNewShopCartV2(user.id, goodsId, shop.id, stockId, purchaseName, shopNum, accountRecordId, purchaseType, cartType);
    }
    else if (shopNum > remainNum) {
      wx.showToast({
        title: '超过留店剩余数，剩余数已全部加入购物车',
        icon: 'none'
      })

      this.updatePurchaseNewShopCartV2(user.id, goodsId, shop.id, stockId, purchaseName, remainNum, accountRecordId, purchaseType, cartType);
    }

    if (totalShop > balance) {
      wx.showToast({
        title: '购买数量已超过店内此商品库存，商品库存已全部加入购物车',
        icon: 'none'
      })

      this.updatePurchaseNewShopCartV2(user.id, goodsId, shop.id, stockId, purchaseName, balance, accountRecordId, purchaseType, cartType);
    }
  },
  // 留店商品减购
  reduceShop: function (goodsId, stockId, shopNum, purchaseName, accountRecordId, remainNum, purchaseNum) {
    var goodsId = goodsId;
    var stockId = stockId;
    var shopNum = parseInt(shopNum);
    var accountRecordId = accountRecordId;
    var remainNum = parseInt(remainNum);  //表示留店的剩余数
    var purchaseNum = parseInt(purchaseNum); //留店的购买总数量
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var cartNum = 0;
    var purchaseType = 6; // 购买类型   0-商品   6-留店
    var cartType = 1;
    if (shopNum <= 0) {
      wx.showToast({
        title: '请输入减购数量',
        icon: 'none'
      })
    } else if (shopNum > 0) {
      util.reqAsync('shop/shopCartList', {
        customerId: user.id,
        shopId: shop.id,
        cartType: 1 //0:店外下单购物车 1:店内和留店购物车
      }).then((res) => {
        if (res.data.data.length != 0) {
          let cartGoodsList = res.data.data[0].goodsList
          console.log(cartGoodsList)
          for (let i = 0; i < cartGoodsList.length; i++) {
            if (cartGoodsList[i].accountRecordId == accountRecordId) {
              var purchaseName = cartGoodsList[i].purchaseName;
              cartNum = cartGoodsList[i].number;
              if (cartNum == 0) {
                wx.showToast({
                  title: '购物车内无当前商品',
                  icon: 'none'
                })
              } else {
                if (shopNum == cartNum) {
                  console.log(shopNum);
                  this.deletePurchaseGoods(user.id, shop.id, stockId, goodsId, purchaseType, accountRecordId);
                }
                else if (shopNum < cartNum) {
                  console.log(cartNum);
                  let updateNum = cartNum - shopNum;
                  this.updatePurchaseNewShopCartV2(user.id, goodsId, shop.id, stockId, purchaseName, updateNum, accountRecordId, purchaseType, cartType);
                } else {
                  wx.showToast({
                    title: '删除数量超过购买数量',
                    icon: 'none'
                  })
                }
              }
            }
          }
        }
      }).catch((err) => {
        console.log(err)
      })
    }
    if (remainNum == 0) {
      wx.showToast({
        title: '此商品留店数量不足……',
        icon: 'none'
      })
    }
  },
  //留店商品 - 添加商品到购物车
  updatePurchaseNewShopCartV2: function (customerid, goodsid, shopid, stockid, goodsName, goods_number, accountRecordId, purchaseType, cartType) {
    // debugger
    var param = {
      goodsId: goodsid,
      number: goods_number
    }
    util.reqAsync('shop/updateNewShopCartV2', {
      customerId: customerid,
      goodsId: goodsid,
      number: parseInt(goods_number),
      shopId: shopid,
      stockId: stockid,
      goodsName: goodsName,
      accountRecordId: accountRecordId,
      purchaseType: purchaseType,
      cartType: cartType
    }).then((res) => {
      if (res.data.code == 1) {
        this.shopCartList();
        this.setPurchase();
      }
      if (res.data.code == 9) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }

    }).catch((err) => {
      console.log(err)
    })
  },
  //留店商品 - 移除购物车
  deletePurchaseGoods: function (customerId, shopId, stockId, goodsId, purchaseType, accountRecordId) {
    util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
      customerId: customerId,
      shopId: shopId,
      goodsId: goodsId,
      stockId: stockId,
      cartType: 1,
      accountRecordId: accountRecordId,
      purchaseType: purchaseType
    }).then((res) => {
      console.log("留店删除")

      this.shopCartList()
      this.setPurchase();
    }).catch((err) => {
      console.log(err)
    })
  },
  // 设置留店商品缓存
  setPurchase: function () {
    util.reqAsync('shop/shopCartList', {
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id,
      cartType: 1 //0:店外下单购物车 1:店内和留店购物车
    }).then((res) => {
      this.setData({
        purchaseData: this.data.purchase
      })
      var cartlist = res.data.data;
      for (var i = 0; i < cartlist.length; i++) {
        for (var j = 0; j < this.data.purchaseData.length; j++) {
          if (cartlist[i].accountRecordId == this.data.purchaseData[j].id) {
            this.data.purchaseData[j].shopNum = cartlist[i].number;
          }
        }
      }
      this.setData({
        purchaseData: this.data.purchaseData
      })
      console.log(this.data.purchaseData)

      // 设置留店商品缓存
      wx.setStorage({
        key: "purchaseData",
        data: this.data.purchaseData, //这是一个数组，存有所有访问过的城市的名称
      })
    }).catch((err) => {
      console.log(err)
    })
  }

})

