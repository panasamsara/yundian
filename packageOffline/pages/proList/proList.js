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
    goodsHL: 0,
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
    actualPay:0,
    other: [], //去掉重复后的数组
    ifstore: 0, //是否为留店
    purchase: [], //留店商品数据
    purchaseData:[], // 留店商品缓存
    page:1, //留店商品数据请求页码
    rows:5,//留店数据加载每页条数
    hasMoreData:true,//当前数据是否超过每页条数，如果超过，则为true，page加1
    focus: false,
    shop:'',
    hasPurchase: true, // 是否有留店商品
    isactive:0
  },
  onReady: function () {
    // Do something when page ready.
  },

  onLoad: function (e) {
    console.log('进入线下prolist---------------', e)

    let _this = this
    let systemInfo = wx.getStorageSync('systemInfo');
    this.setData({
      // mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight - 118,
      goodsHs: systemInfo.windowHeight -118,
      goodsHL: systemInfo.windowHeight - 48,
    })
    if (e && e.q) {
      var uri = decodeURIComponent(e.q)
      var p = util.getParams(uri)
      let shopId = p.s
      let facilityId = p.f
      wx.setStorageSync('shopId', shopId);
      wx.setStorageSync("facilityId", facilityId);
      this.setData({
        shopId: shopId,
        facilityId: facilityId
      })
    } else {
      if (e && e.shopId) {
        wx.setStorageSync('shopId', e.shopId);
        this.setData({
          shopId: e.shopId
        })
      }
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
    util.checkWxLogin('offline').then((loginRes) => {
      _this.setData({
        userId: loginRes.id,
        userName: loginRes.username,
      })
      var shopId = this.data.shopId
      if (!shopId) {
        shopId = wx.getStorageSync('shopId');
      }

/*********************************socket登录 */
      //获取用户昵称
      var username = encodeURI(loginRes.username);
      //获取用户id
      var userid = loginRes.id;
      //获取桌号
      var facilityId = wx.getStorageSync("facilityId");
      console.log('桌号：' + facilityId)
      console.log('店铺号：' + shopId)
      let SOCKET_URL = util.SOCKET_URL

      //开启websocket连接
      if (!wx.getStorageSync('socketStatus') ){
        wx.connectSocket({
          // url: 'wss://wxapp.izxcs.com/live/' + facilityId + '/' + userid + '/' + username
          // url: 'ws://apptest.izxcs.com:81/live/' + facilityId + '/' + userid + '/' + username
          url: SOCKET_URL + '/zxcity_restful/ws/payBoot/live/' + shopId + '/' + facilityId + '/' + userid + '/' + username
        })

        //连接成功回调
        wx.onSocketOpen(function (res) {
          console.log('WebSocket连接已打开！')
          wx.setStorageSync('socketStatus', true)
        })
      }
      
/*********************************socket登录 */

      var shop = wx.getStorageSync('shop')

      if (!shop) {
        if (shopId == undefined) {
          wx.redirectTo({
            url: '../scan/scan'
          })
        } else {
          util.getShop(loginRes.id, shopId).then(function (res) {
 
            //shop存入storage
            wx.setStorageSync('shop', res.data.data.shopInfo);
            //活动
            wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
            // 所有信息
            wx.setStorageSync('shopInformation', res.data.data);
            _this.setData({
              merchantId: res.data.data.shopInfo.merchantId || "",
              shopName: res.data.data.shopInfo.shopName || ""
            });
            _this.getData(res.data.data.shopInfo)
          })
        }
      } else {
        if (shopId == undefined || shopId == '' || shopId == null) {
          _this.setData({
            merchantId: shop.merchantId || "",
            shopName: shop.shopName || ""
          });
          _this.getData(shop)
          
        } else {
          if (shopId == shop.id) {
            _this.setData({
              merchantId: shop.merchantId || "",
              shopName: shop.shopName || ""
            });
            _this.getData(shop)

          } else {
            wx.removeStorageSync('shop')
            wx.removeStorageSync('goodsInfos')
            wx.removeStorageSync('shopInformation')
            util.getShop(loginRes.id, shopId).then(function (res) {
              //shop存入storage
              wx.setStorageSync('shop', res.data.data.shopInfo);
              //活动
              wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
              // 所有信息
              wx.setStorageSync('shopInformation', res.data.data);
              _this.setData({
                merchantId: res.data.data.shopInfo.merchantId || "",
                shopName: res.data.data.shopInfo.shopName || ""
              });
              _this.getData(res.data.data.shopInfo)
            })
          }
        }

      }
      wx.removeStorageSync('shopId');
    })
/*********************************socket消息 */
    //消息监听
    wx.onSocketMessage(function (res) {
      //if (res && res.data.indexOf("~") != -1){
      var msg = res.data;
      if (msg && msg.length > 3 && msg.substring(msg.length - 3) == '_op') {
        msg = msg.substring(0, msg.length - 3);
        //获取购物车
        _this.shopCartList()

        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }else if(msg && msg.length >= 4 && msg.substring(msg.length - 4) == '_uid'){
    	  //获取房主id
        let hostId = msg.substring(0, msg.length - 4);
       
        console.log('房主ID-----------------------：',hostId)
    	  //将房主id保存到本地
        wx.setStorageSync('hostId', hostId);
      }else{
        if (msg && msg.substring(msg.length - 3)=='已下单'){
          //获取购物车
          _this.shopCartList()
        
        }
        wx.showToast({
          title: msg,
          icon: 'none'
        })
      }
  
      console.log(msg);
    })

    //连接关闭回调
    wx.onSocketClose(function (res) {
      console.log('WebSocket连接已关闭！')
      wx.setStorageSync('socketStatus', false)
      wx.setStorageSync('hostId', wx.getStorageSync('scSysUser').id )

    })
/*********************************socket消息 */
    // var shop = wx.getStorageSync('shop');
    // if (shop ){
    //   this.getData(shop)
      
    // }

  },
  getData: function (shop){
    let _this = this
    let systemInfo = wx.getStorageSync('systemInfo');
    this.setData({
      // mechine: mechine,
      systemInfo: systemInfo,
      goodsH: systemInfo.windowHeight - 118,
      goodsHs: systemInfo.windowHeight - 118,
      goodsHL: systemInfo.windowHeight - 48,
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
        // customerId: user.id,
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
      ifstore: 0,
      isactive: 0
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
    var accountRecordId = e.target.id.split('_')[3] || '';
    var purchaseType = e.target.id.split('_')[4];
    var goodsName = e.target.dataset.goodname;
    var remainNum, purchaseNum, balance;
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
    console.log(_id)
    // 留店商品
    if (purchaseType == 6) {
      // debugger
      var purchaseData = wx.getStorageSync('purchaseData');
      if (purchaseData.length != 0) {
        for (var i = 0; i < purchaseData.length; i++) {
          if (purchaseData[i].id == accountRecordId) {
            console.log(purchaseData[i].shopNum);
            var updateNum = parseInt(purchaseData[i].shopNum) + 1;
            remainNum = purchaseData[i].remainNum;
            purchaseNum = purchaseData[i].purchaseNum;
            balance = purchaseData[i].balance;
          }
        }
      }

      // 获取已加入购物车商品数量
      util.reqAsync('shopOrder/getPresaleByCondition', {
        shopId: wx.getStorageSync('shop').id,
        userId: wx.getStorageSync('scSysUser').id,
        presaleId: "", //订单id
        facilityId: wx.getStorageSync('facilityId')
      }).then((res) => {
        var chartNum, totalcart;
        if (res.data.data){
          for (var i in res.data.data.scPresaleInfoList) {
            if (res.data.data.scPresaleInfoList[i].accountRecordId == accountRecordId) {
              chartNum = res.data.data.scPresaleInfoList[i].purchaseNum;
            }
          }
        }

        console.log(chartNum)
        if (chartNum) {
          totalcart = updateNum + parseInt(chartNum);
        } else {
          totalcart = updateNum
        }
        console.log(totalcart)
        if (totalcart > purchaseNum - 1) {
          wx.showToast({
            title: '超过留店的购买总数量',
            icon: 'none'
          })
        }
        else if (totalcart > remainNum) {
          wx.showToast({
            title: '超过留店剩余数量',
            icon: 'none'
          })
        }
        else if (totalcart > balance) {
          wx.showToast({
            title: '超过留店商品库存',
            icon: 'none'
          })
        }

        if (totalcart <= remainNum && totalcart <= purchaseNum && totalcart <= balance) {
          this.updatePurchaseNewShopCartV2(_id, shop.id, stockId, goodsName, updateNum, accountRecordId, 6, 1, 'add');
        }
      }).catch((err) => {
        console.log(err)
      })
    } else {
      if (stockId != 'null' && stockId && stockId != undefined) {
        console.log(stockMap[stockId])
        let new_number = stockMap[stockId].number + 1
        this.updateNewShopCartV2(_id, shop.id, stockId, stockMap[stockId].goodsName, new_number, 'add')

      } else {
        if (this.data.chosenStockId) {
          let new_number_a = stockMap[this.data.chosenStockId].number + 1
          this.updateNewShopCartV2(_id, shop.id, this.data.chosenStockId, stockMap[this.data.chosenStockId].goodsName, new_number_a, 'add')
        } else {
          let new_number_b = stockMap[_id].number + 1
          this.updateNewShopCartV2(_id, shop.id, this.data.chosenStockId, stockMap[_id].goodsName, new_number_b, 'add')
        }
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
    var shop = wx.getStorageSync('shop');

    let shoppingCart = this.data.shoppingCart
    let goods_number = 0
    let chooseGoodArr = this.data.chooseGoodArr;
    var purchaseName = e.target.dataset.goodsname;
    console.log("shoppingCart");
    console.log(shoppingCart);
    console.log(purchaseName)
    // let goodStockMapArr = this.data.goodStockMapArr
    let stockMap = this.data.stockMap
    let goodMap = this.data.goodMap

    if (stockId != 'null' && stockId && stockId != undefined) {
      // 判断留店商品
      if (purchaseType==6){
        var new_number = parseInt(purchase_number) - 1
      }else{
        var new_number = stockMap[stockId].number - 1
      }
      console.log(new_number);
      if (new_number <= 0) {
        // 留店商品删除方法
        if (purchaseType == 6){
          console.log("删除留店2")
          this.deletePurchaseGoods(shop.id, stockId, _id, purchaseName, purchaseType, accountRecordId);    
        }else{
          this.deleteGoods( shop.id, stockId, stockMap[stockId].goodsId)          
        }
        // goodMap[stockMap[stockId].goodsId].number = 0
        // this.setData({
        //   goodMap: goodMap
        // })
        console.log(goodMap)
      } else {
        // 留店商品更新
        if (purchaseType == 6) {
          console.log("删除留店1")
          this.updatePurchaseNewShopCartV2(_id, shop.id, stockId, purchaseName, new_number, accountRecordId, purchaseType, cartType, 'decrease');
        } else {
          console.log("默认商品删除")
          this.updateNewShopCartV2(_id, shop.id, stockId, stockMap[stockId].goodsName, new_number, 'decrease')
        }
      }


    } else {
      console.log(888888)
      let new_number = stockMap[_id].number - 1
      if (new_number <= 0) {
        console.log(888889)
        this.deleteGoods(shop.id, null, stockMap[_id].goodsId)
        // goodMap[stockMap[_id].goodsId].number = 0
        // this.setData({
        //   goodMap: goodMap
        // })
      } else {
        this.updateNewShopCartV2(_id, shop.id, null, stockMap[_id].goodsName, new_number, 'decrease')
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
      stockHighLightIndex: -1,
      chosenStockPrice: null
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
      this.deleteGoods( shop.id, cartGoodsList[i].stockId, cartGoodsList[i].goodsId, cartGoodsList[i].purchaseType, true)
    }

    wx.sendSocketMessage({
      data: '清空购物车_op'
    })

    this.removePurchaseData();
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
  updateNewShopCartV2: function ( goodsid, shopid, stockid, goodsName, goods_number, changeType) {
    util.reqAsync('shop/updateNewShopCartV2', {
      customerId: wx.getStorageSync('hostId'),
      goodsId: goodsid,
      number: goods_number,
      shopId: shopid,
      stockId: stockid,
      goodsName: goodsName,
      cartType:1,
      purchaseType: 0
    }).then((res) => {

      if (res.data.code == 1) {
        //购物车修改成功时, 通知其他人
        if (changeType) {
          var opType = changeType == 'add' ? '加了' : '减了';
          var message = opType + "1份" + goodsName + "_op";
          //发送通知
          wx.sendSocketMessage({
            data: message
          })
        }
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
  deleteGoods: function ( shopId, stockId, goodsId, purchaseType, isClear=false) {
    var purchaseType = purchaseType;
    util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
      customerId: wx.getStorageSync('hostId'),
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
      var goodsName = ''
      // 留店商品
      if (purchaseType == 6){
        console.log("11");
      }else{
        console.log("22");
        if (stockId) {
          goodMap[goodsId].number = 0
          stockMap[stockId].number = 0
          goodsName = stockMap[stockId].goodsName
        } else {
          goodMap[goodsId].number = 0
          stockMap[goodsId].number = 0
          goodsName = stockMap[goodsId].goodsName
        }
      }


      this.setData({
        goodMap: goodMap
      })
      /** 清空购物车时，不发送socket消息*/
      if (!isClear){
        //移除商品后, 通知其他人
        var message = "从购物车中移除了" + goodsName + "_op";
        //发送通知
        wx.sendSocketMessage({
          data: message
        })
      }
     /** 清空购物车时，不发送socket消息*/
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
    var _this = this
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var goodMap = this.data.goodMap
    var stockMap = this.data.stockMap

    util.reqAsync('shop/shopCartList', {
      customerId: wx.getStorageSync('hostId'),
      shopId: shop.id,
      cartType: 1 //0:店外下单购物车 1:店内和留店购物车
    }).then((res) => {
      if (res.data.data.length != 0) {
        let cartGoodsList = res.data.data[0].goodsList
        for (let i = 0; i < cartGoodsList.length; i++) {
          // console.log(goodMap[cartGoodsList[i].goodsId])

          if (goodMap[cartGoodsList[i].goodsId]) {

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
        this.mathTotal(cartGoodsList)
      } else {

         for (let stockIndex in stockMap) {
           if (stockMap[stockIndex].stockId){
             var stockId = stockMap[stockIndex].stockId
           }else{
             var stockId = stockMap[stockIndex].goodsId
           }
          stockMap[stockId].number = 0
        }

        for (let stockIndex in stockMap) {
          let goodsId = stockMap[stockIndex].goodsId
          goodMap[goodsId].number = 0
        }

        _this.setData({
          cartGoodsList: 0,
          totalNum: 0,//总数量
          totalPay: 0,
          showShopCart: false,
          cart_length: 0,
          goodMap: goodMap,
          stockMap: stockMap
        })
      }

    }).catch((err) => {
      console.log(err)

    })
  },
  mathTotal: function (cartGoodsList) {
    // console.log("cartGoodsList")
    // console.log(cartGoodsList)
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
          cartGoodsList[i].actualPayment = Number(cartGoodsList[i].stockPrice) * Number(cartGoodsList[i].number)
          cartGoodsList[i].unitPrice = cartGoodsList[i].stockPrice
        } else {
          cartGoodsList[i].actualPayment = Number(cartGoodsList[i].goodsPrice) * Number(cartGoodsList[i].number)
          cartGoodsList[i].unitPrice = cartGoodsList[i].goodsPrice
        }
      }
/**socket消息 确认下单 */
      wx.sendSocketMessage({
        data: 'confirm order'
      })
/**socket消息 确认下单 */

      wx.setStorageSync('carts', cartGoodsList);
      this.setData({
        cart_length: 0
      })

      if (this.data.isBuy == 1) {  //是否下单商品已经结算完毕 0 未结算 1已结算
        console.log("已结算")
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
  changeOrdr: function (e) {
    var cartMoney = this.data.totalPay; //购物车总费
    var buyMoney = this.data.buyMoney; //已下单商品总费用
    console.log(this.data.bugGoods);
    var arrList = [];
    for (var a in this.data.bugGoods) { //已下单商品
      if (this.data.bugGoods[a].stockId) {
        arrList.push({
          goodsServiceId: this.data.bugGoods[a].goodsServiceId,
          purchaseName: this.data.bugGoods[a].purchaseName,
          purchaseNum: this.data.bugGoods[a].purchaseNum,
          unitPrice: this.data.bugGoods[a].unitPrice,
          actualPayment: Number(this.data.bugGoods[a].purchaseNum) * Number(this.data.bugGoods[a].unitPrice),
          stockId: this.data.bugGoods[a].stockId,
          ids: this.data.bugGoods[a].stockId,
        })
      } else {
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

    for (var b in this.data.cartGoodsList) {
      if (this.data.cartGoodsList[b].stockId && this.data.cartGoodsList[b].stockId != undefined && this.data.cartGoodsList[b].stockId != 'undefined' && this.data.cartGoodsList[b].stockId != null && this.data.cartGoodsList[b].stockId != "null") {
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
      } else {

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
    for (var a in arrList) {
      sumMoney += arrList[a].actualPayment
    }
    console.log(sumMoney.toFixed(2))
    //继续下单
    console.log("继续下单")
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
      orderType: 1,
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
  oneBuy: function (e) {
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
          this.clearShopCartFn();
          this.removePurchaseData();
        }
      })
    } else {
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
                actualPay:0,
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
                actualPay: data.data.data.actualPay,
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
  // 留店商品
  showPurchase:function(){
    this.setData({
      ifstore: 1,
      isactive: 1
    })
    var shop = wx.getStorageSync('shop');
    var purchaseStorage = wx.getStorageSync('purchaseStorage');
    util.reqAsync('shopOrder/storeRetentionLists', {
      shopId: shop.id,
      userId: wx.getStorageSync('scSysUser').id,
      merchantId: this.data.merchantId || shop.merchantId
    }).then((res) => {
      console.log("留店商品列表")
      console.log(res);
      var purchaseData = wx.getStorageSync('purchaseData');
      if (purchaseData.length != 0) {
        console.log("有购物车缓存")
        console.log(purchaseData);
        this.setData({
          purchase: purchaseData,
          showLoading: false
        })
      } else {
        if (res.data.data) {
          console.log("无购物车缓存")
          // 数据增加加购数量，重置加购数量
          for (let i = 0; i < res.data.data.length; i++) {
            if (!res.data.data[i]["shopNum"]) {
              res.data.data[i]["shopNum"] = 0;
              res.data.data[i]["pitch"] = 0;
            }
          }
          this.setData({
            purchase: res.data.data,
            hasPurchase: true
          })
        }
        else {
          this.setData({
            hasPurchase: false
          })
        }
      }
    }).catch((err) => {
      console.log(err)
    })
  },
  // 获取留店商品数据
  getGiftData: function (message) {
    var shop = wx.getStorageSync('shop');
    var purchaseStorage = wx.getStorageSync('purchaseStorage');
    util.reqAsync('shopOrder/storeRetentionLists', {
      shopId: shop.id,
      userId: wx.getStorageSync('scSysUser').id,
      merchantId: this.data.merchantId || shop.merchantId
    }).then((res) => {
      console.log("留店商品列表")
      console.log(res);
      var purchaseData = wx.getStorageSync('purchaseData');
      if (purchaseData.length != 0) {
        console.log("有购物车缓存")
        console.log(purchaseData);
        this.setData({
          purchase: purchaseData,
          showLoading:false
        })
      } else {
        if (res.data.data.length != 0) {
          console.log("无购物车缓存")
          // 数据增加加购数量，重置加购数量
          for (let i = 0; i < res.data.data.length; i++) {
            if (!res.data.data[i]["shopNum"]) {
              res.data.data[i]["shopNum"] = 0;
              res.data.data[i]["pitch"] = 0;
            }
          }
          this.setData({
            purchase: res.data.data,
            hasPurchase: true
          })
        }
        else {
          this.setData({
            hasPurchase: false
          })
        }
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
    var goodsId = e.target.id.split('_')[1];
    var stockId = e.target.id.split('_')[2];
    var shopNum = parseInt(e.target.id.split('_')[3]);
    var accountRecordId = parseInt(e.target.id.split('_')[4]);
    var remainNum = parseInt(e.target.id.split('_')[5]);  //表示留店的剩余数
    var balance = parseInt(e.target.id.split('_')[6]); //当前留店商品的库存
    var purchaseNum = parseInt(e.target.id.split('_')[7]); //留店的购买总数量
    var pitch = parseInt(e.target.id.split('_')[8]);
    var purchaseName;

    // 获取已加入购物车商品数量
    util.reqAsync('shopOrder/getPresaleByCondition', {
      shopId: wx.getStorageSync('shop').id,
      userId: wx.getStorageSync('scSysUser').id,
      presaleId: "", //订单id
      facilityId: wx.getStorageSync('facilityId')
    }).then((res) => {
      var chartNum, totalcart;
      if (res.data.data){
        for (var i in res.data.data.scPresaleInfoList) {
          if (res.data.data.scPresaleInfoList[i].accountRecordId == accountRecordId) {
            chartNum = res.data.data.scPresaleInfoList[i].purchaseNum;
          }
        }
      }
      if (chartNum) {
        totalcart = shopNum + 1 + parseInt(chartNum);
        console.log("购物车有此留店商品 +chartNum:" + chartNum + "现在加购" + shopNum + "总" + totalcart)
      } else {
        totalcart = shopNum
        console.log("chartNum:" + chartNum + "现在加购" + shopNum + "总" + totalcart)        
      }

      for (var i = 0; i < this.data.purchase.length; i++) {
        if (this.data.purchase[i].id == accountRecordId) {
          purchaseName = this.data.purchase[i].purchaseName;
          if (totalcart > purchaseNum - 1) {
            wx.showToast({
              title: '超过留店的购买总数量',
              icon: 'none'
            })
          }
          else if (totalcart > remainNum) {
            wx.showToast({
              title: '超过留店剩余数量',
              icon: 'none'
            })
          }
          else if (totalcart > balance) {
            wx.showToast({
              title: '超过留店商品库存',
              icon: 'none'
            })
          }
          else {
            shopNum = parseInt(this.data.purchase[i].shopNum) + 1;
            this.data.purchase[i].shopNum += 1;
            this.addShop(goodsId, stockId, shopNum, purchaseName, accountRecordId, remainNum, balance, purchaseNum);
          }
          this.setData({
            purchase: this.data.purchase
          })
          console.log(this.data.purchase)
        }
      }
    }).catch((err) => {
      console.log(err)
    })
  },
  // 数量 -1
  numReduce: function (e) {
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
        if (shopNum == 1) {
          this.data.purchase[i].shopNum = parseInt(this.data.purchase[i].shopNum) - 1;
          this.reduceShop(goodsId, stockId, 1, purchaseName, accountRecordId, remainNum, purchaseNum);
          this.data.purchase[i].pitch = 0;
        }
      }
    }
    this.setData({
      purchase: this.data.purchase
    })
  },
  // 留店商品 - 更改加购状态 - 暂未使用（前加多选入购物车）
  changePurchase: function (e) {
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
    else if (shopNum <= remainNum && shopNum <= balance && shopNum <= purchaseNum) {
      this.updatePurchaseNewShopCartV2(goodsId, shop.id, stockId, purchaseName, shopNum, accountRecordId, purchaseType, cartType, 'add');
    }
    else if (shopNum > remainNum) {
      wx.showToast({
        title: '超过留店剩余数',
        icon: 'none'
      })
    }

    if (totalShop > balance) {
      wx.showToast({
        title: '购买数量已超过店内此商品库存',
        icon: 'none'
      })
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
              var purchaseName = cartGoodsList[i].goodsName;
              console.log(purchaseName);
              cartNum = cartGoodsList[i].number;
              if (cartNum == 0) {
                wx.showToast({
                  title: '购物车内无当前商品',
                  icon: 'none'
                })
              } else {
                if (shopNum == cartNum) {
                  this.deletePurchaseGoods(shop.id, stockId, goodsId, purchaseName, purchaseType, accountRecordId);
                }
                else if (shopNum < cartNum) {
                  console.log(cartNum);
                  let updateNum = cartNum - shopNum;
                  this.updatePurchaseNewShopCartV2(goodsId, shop.id, stockId, purchaseName, updateNum, accountRecordId, purchaseType, cartType, 'decrease');
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
  //留店商品 - 添加商品到购物车   changeType(添加： 'add'/移除： 'decrease'/无操作： '')
  updatePurchaseNewShopCartV2: function ( goodsid, shopid, stockid, goodsName, goods_number, accountRecordId, purchaseType, cartType, changeType) {
    var param = {
      goodsId: goodsid,
      number: goods_number
    }
    util.reqAsync('shop/updateNewShopCartV2', {
      customerId: wx.getStorageSync('hostId'),
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
        //购物车修改成功时, 通知其他人
        if (changeType) {
          var opType = changeType == 'add' ? '加了' : '减了';
          var message = opType + "1份" + goodsName + "_op";
          //发送通知
          wx.sendSocketMessage({
            data: message
          })
        }

        this.shopCartList();
        this.setPurchase(1, accountRecordId);
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
  deletePurchaseGoods: function (shopId, stockId, goodsId, goodsname, purchaseType, accountRecordId) {
    util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
      customerId: wx.getStorageSync('hostId'),
      shopId: shopId,
      goodsId: goodsId,
      stockId: stockId,
      cartType: 1,
      accountRecordId: accountRecordId,
      purchaseType: purchaseType
    }).then((res) => {
      console.log("留店删除")

      //移除商品后, 通知其他人
      var message = "从购物车中移除了" + goodsname + "_op";
      //发送通知
      wx.sendSocketMessage({
        data: message
      })

      this.shopCartList()
      this.setPurchase(2, accountRecordId);

    }).catch((err) => {
      console.log(err)
    })
  },
  // 设置留店商品缓存 handle 传递操作，是否为删除, 1 为加购，2为移除
  setPurchase: function (handle, nowAccountRecordId) {
    var handle = handle;
    var nowAccountRecordId = nowAccountRecordId;
    util.reqAsync('shop/shopCartList', {
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id,
      cartType: 1 //0:店外下单购物车 1:店内和留店购物车
    }).then((res) => {
      this.setData({
        purchaseData: this.data.purchase
      })
      var purchaseData = this.data.purchaseData;
      if (res.data.data.length != 0) {
        if (res.data.data[0].goodsList) {
          var goodsListMap = new Map();
          for (var i = 0; i < res.data.data[0].goodsList.length; i++) {
            console.log(res.data.data[0].goodsList[i].accountRecordId)
            goodsListMap.set(res.data.data[0].goodsList[i].accountRecordId, res.data.data[0].goodsList[i].number);
          }

          if (handle == 1) {
            for (var j = 0; j < this.data.purchaseData.length; j++) {
              if (this.data.purchaseData[j].id == nowAccountRecordId) {
                this.data.purchaseData[j].shopNum = goodsListMap.get(parseInt(nowAccountRecordId + ""));
              }
            }
          } else if (handle == 2) {
            for (var j = 0; j < this.data.purchaseData.length; j++) {
              if (this.data.purchaseData[j].id == nowAccountRecordId) {
                this.data.purchaseData[j].shopNum = 0;
              }
            }
          }
        }
      }
      else {
        for (var j = 0; j < this.data.purchaseData.length; j++) {
          this.data.purchaseData[j].shopNum = 0;
        }
      }
      
      this.setData({
        purchaseData: this.data.purchaseData,
        purchase: this.data.purchaseData
      })

      wx.setStorageSync("purchaseData", purchaseData);
    }).catch((err) => {
      console.log(err)
    })
  },
  // 清空留店商品缓存，重新请求获取留店商品数据
  removePurchaseData:function(){
    wx.removeStorageSync("purchaseData");
    this.getGiftData();
  },
  getAccount: function () {
    //获取下单结算方式
    util.reqAsync('shop/getShopSettingAndProcess', {
      shopId: wx.getStorageSync('shop').id,
    }).then((res) => {
      if (res.data.code == 9) {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        this.setData({
          cart_length: this.data.cartGoodsList.length
        })
      } else { //调接口成功
        if (res.data.data.payType == 0) { //0-后支付 1-先支付

          if (this.data.isBuy == 1) {  //是否下单商品已经结算完毕 0 未结算 1已结算
            this.oneBuy();
          } else { //修改订单
            this.changeOrdr();
          }
        } else { //先支付
          var arrList = [];
          for (var a in this.data.bugGoods) { //已下单商品
            if (this.data.bugGoods[a].stockId) {
              arrList.push({
                goodsServiceId: this.data.bugGoods[a].goodsServiceId,
                purchaseName: this.data.bugGoods[a].purchaseName,
                purchaseNum: this.data.bugGoods[a].purchaseNum,
                unitPrice: this.data.bugGoods[a].unitPrice,
                actualPayment: Number(this.data.bugGoods[a].purchaseNum) * Number(this.data.bugGoods[a].unitPrice),
                stockId: this.data.bugGoods[a].stockId,
                ids: this.data.bugGoods[a].stockId,
              })
            } else {
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

          for (var b in this.data.cartGoodsList) {
            if (this.data.cartGoodsList[b].stockId && this.data.cartGoodsList[b].stockId != undefined && this.data.cartGoodsList[b].stockId != 'undefined' && this.data.cartGoodsList[b].stockId != null && this.data.cartGoodsList[b].stockId != "null") {
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
            } else {

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
          wx.setStorageSync("firstBuy", arrList);
          wx.navigateTo({
            url: '../memberBuy/memberBuy'
          })
        }
      }
    })
  }
})

