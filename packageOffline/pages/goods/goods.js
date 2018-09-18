import util from '../../../utils/util.js';
//获取应用实例
const app = getApp();
Page({
  data: {
    indicatorDots: true, //是否显示面板指示点
    hideView1: true,
    hideView2: true,
    num: 0,
    shopId: '',
    goodsId: '',
    //用户信息
    userData: [],
    flag: false,
    flag1: false,
    flag2: false,
    status: '',//状态
    cUser: '',//发起拼团者id,
    list: [],
    number: 1,
    showBuy: false,
    cur: 0,
    timer: '',
    tabcur: 'product',
    info: ''
  },
  onLoad: function (options) {
    // var user = wx.getStorageSync('scSysUser');
    // app.util.getShop(user.id, options.shopId).then((res) => {
    //   wx.setStorageSync('shop', res.data.data.shopInfo);
    // })
    if (options && options.q) {
      var uri = decodeURIComponent(options.q)
      var p = util.getParams(uri)
      let shopId = p.shopId
      wx.setStorageSync('shopId', shopId);
      this.setData({
        shopId: shopId
      })
    } else {
      if (options && options.shopId) {
        wx.setStorageSync('shopId', options.shopId);
        this.setData({
          shopId: options.shopId
        })
      }
    }
    console.log(options)
    var parm = {
      shopId: options.shopId,
      goodsId: options.goodsId,
      customerId: wx.getStorageSync('scSysUser').id
    },
      systeminfo = wx.getSystemInfoSync(),
      scale = systeminfo.windowWidth / 375;
    if (options && options.shopId) {
      wx.setStorageSync('shopId', options.shopId);
    }

    this.setData({
      shopId: options.shopId,
      goodsId: options.goodsId,
      parm: parm,
      scale: scale
    })
    //获取页面商品主要详情数据
    this.getData(parm);
  },
  //获取详情
  getData: function (parm) {
    wx.showLoading({
      title: '加载中'
    })
    // app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {//获取服务器时间
    //   if (res.data.data) {
    //     this.setData({
    //       nowTime: res.data.data
    //     })
    //   }
    // })
    app.util.reqAsync('shop/goodsDetailAddGroupBuying', parm).then((res) => {//获取商品详情数据
      if (res.data.data) {
        //获取商品状态(上架/下架/失效)
        var status = this.data.status,
          prostatus = res.data.data.status,
          msg;
        if (prostatus != 1) {
          if (prostatus == 0) {
            msg = '该商品已失效'
          } else if (prostatus == 2) {
            msg = '该商品已下架'
          }
          wx.hideLoading();
          wx.showModal({
            content: msg,
            showCancel: false,
            success: function (res) {//失效下架返回
              if (res.confirm) {
                wx.navigateBack();
              }
            }
          })
          return
        }
        //商品具体分类(普通/拼团/秒杀)
        var data = res.data.data,
          status;
        // if (data.activityStatus) {//接口更新
        //   if (data.activityStatus == 0) {//普通商品
        //     status = 3;
        //   } else if (data.activityStatus == 1) {//拼团商品
        //     status = 1;
        //   } else if (data.activityStatus == 2) {//秒杀商品
        //     status = 2;
        //   }
        // } else {//接口未更新
        status = 3
        if (data.isGroupBuying != 0) {
          status = 1
        }
        if (data.secondKillInfo.length > 0) {
          status = 2
        }
        // }
        this.setData({
          status: status
        })
        var secondKillInfo = data.secondKillInfo,//秒杀商品信息
          scShopGoodsStockList = data.scShopGoodsStockList;//拼团商品信息
        data.shopScore = parseInt(data.shopScore);
        if (data.descContent != null && data.descContent != '') {//商品详情富文本编辑器处理
          data.descContent = data.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/(background-color|font-size)[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ');
        }

        if (status == 1) {//拼团
          if (scShopGoodsStockList.length > 0) {
            for (let i = 0; i < scShopGoodsStockList.length; i++) {
              scShopGoodsStockList[i].index = i;
            }
          }
          let list = data.groupBuyingList,
            length = list.length;
          if (length > 2) {
            length = 2
          } else {
            length = list.length
          }
          for (let i = 0; i < length; i++) {//计算剩余时间
            list[i].activityStartTime = Date.parse(app.util.formatIOS(this.data.nowTime));
            list[i].activityEndTime = Date.parse(app.util.formatIOS(list[i].endTime));
            list[i].count = list[i].activityEndTime - list[i].activityStartTime;
          };
          this.setData({
            groupBuyingPrice: data.groupBuyingPrice,
            groupBuyingAllNum: data.groupBuyingAllNum,
            listData: list
          })
        } else if (status == 2) {//秒杀
          let totalBalance = 0;
          for (let i = 0; i < secondKillInfo.length; i++) {
            totalBalance += secondKillInfo[i].salesCount//计算秒杀所有规格库存总数
          }
          this.setData({
            totalBalance: totalBalance
          })
          if (secondKillInfo.length > 0) {
            for (let i = 0; i < secondKillInfo.length; i++) {
              secondKillInfo[i].index = i;
            }
          }
          let secList = data.secondKillInfo[0],
            list = [];
          //计算剩余时间
          secList.activityStartTime = Date.parse(app.util.formatIOS(this.data.nowTime));
          secList.activityEndTime = Date.parse(app.util.formatIOS(secList.activityEndTime));
          secList.count = secList.activityEndTime - secList.activityStartTime;
          list.push(secList)
          this.setData({
            listData: list
          })
        } else {//普通商品
          let stockListDefault = res.data.data.stockListDefault;
          for (let i = 0; i < stockListDefault.length; i++) {
            stockListDefault[i].index = i
          }
        }
        this.setData({
          data: data,
          info: data.descContent
        })
      }
      wx.hideLoading();
      let _this = this
      clearInterval(_this.data.timer)
      if (this.data.status == 1 || this.data.status == 2) {//设置定时器
        this.data.timer = setInterval(function () {
          _this.count(_this.data.listData, 'listData')
        }, 1000)
      }
      let logoUrl = wx.getStorageSync('shop').logoUrl,
        pictureUrl = this.data.data.pictureUrl;
      if (pictureUrl.split(':')[0] == 'http') {
        pictureUrl.replace('http', 'https');
      }
      console.log(logoUrl)
      console.log(pictureUrl)
      if (logoUrl.split(':')[0] == 'http') {
        logoUrl.replace('http', 'https');
      }
      if (pictureUrl.split(':')[0] == 'http') {
        pictureUrl = pictureUrl.replace('http', 'https');
      }
      this.setData({
        logoUrl: logoUrl,
        pictureUrl: pictureUrl
      })
      wx.downloadFile({//缓存店铺头像，直接使用网络路径真机无法显示或绘制
        url: this.data.logoUrl,
        success: function (res) {
          console.log(res.tempFilePath)
          _this.setData({
            logo: res.tempFilePath
          })
        }
      })
      wx.downloadFile({//缓存商品图片，直接使用网络路径真机无法显示或绘制
        url: this.data.pictureUrl,
        success: function (res) {
          console.log(res.tempFilePath)
          _this.setData({
            proPic: res.tempFilePath
          })
          //canvas绘图
          if (_this.data.status == 1) {//拼团
            _this.drawPicGroup();
          } else if (_this.data.status == 2) {//秒杀
            _this.drawPicSeckill();
          }
        }
      })
    })
  },
  closeLayer() {//关闭拼单弹出层
    this.setData({
      flag: false,
      flag1: false,
      flag2: false,
      untouch: 'touch'
    })
    this.getData(this.data.parm)
  },


  //跳转到赠品
  toGive() {
    let gift = this.data.data.gift;
    wx.setStorageSync('imageList', gift.imageList);
    let urls = '/pages/give/give?descTitle=' + gift.descTitle + '&descContent=' + gift.descContent
    wx.navigateTo({
      url: urls,
    })
  },
  //跳转到评价
  toAppraise() {
    let shop = wx.getStorageSync('shop'),
      goodsId = this.data.goodsId,
      shopId = this.data.shopId;
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  //跳转到问答详情
  toAsk() {
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;
    wx.navigateTo({
      url: '/pages/ask/ask?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  //跳转到店铺
  goShop() {
    wx.navigateTo({
      url: '/pages/store/store'
    })
  },
  count: function (datas, arrayName) {//倒计时方法
    for (let i = 0; i < datas.length; i++) {
      let leftTime = datas[i].count;
      leftTime -= 1000;
      if (leftTime <= 0) {
        leftTime = 0
      }
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
        h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
        m = Math.floor(leftTime / 1000 / 60 % 60),
        s = Math.floor(leftTime / 1000 % 60),
        count = arrayName + "[" + i + "].count",
        dCount = arrayName + "[" + i + "].d",
        hCount = arrayName + "[" + i + "].h",
        mCount = arrayName + "[" + i + "].m",
        sCount = arrayName + "[" + i + "].s";
      if (h < 10) {
        h = "0" + h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        [count]: leftTime,
        [dCount]: d,
        [hCount]: h,
        [mCount]: m,
        [sCount]: s
      })
    }
  },
  change: function (e) {//规格弹窗增加减少商品数量
    var option = e.currentTarget.id,
      number = this.data.number,
      secondKillInfo = this.data.data.secondKillInfo[this.data.cur],
      num;
    if (option == 'add') {//加数量
      number += 1;
      num = 1;
      if (this.data.status == 1 && (this.data.data.limitNum > 0 && number > this.data.data.limitNum)) {//拼团限购数量
        wx.showToast({
          title: '已超过最大购买数量',
          icon: 'none'
        })
        return
      }
      if (this.data.status == 2 && (secondKillInfo.goodsPurchasingCount > 0 && number > secondKillInfo.goodsPurchasingCount)) {//秒杀限购数量
        wx.showToast({
          title: '已超过限购数量',
          icon: 'none'
        })
        return
      }
      if (number > this.data.balance) {//普通商品库存
        wx.showToast({
          title: '已超过库存',
          icon: 'none'
        })
        return
      }
    } else if (option == 'minus') {//减数量
      number -= 1;
      num = -1;
      if (number < 1) {
        number = 1
        return
      }
    }
    var price //规格价格
    if (this.data.status == 1) {//拼团
      if (this.data.buyType == 'solo') {
        price = this.data.data.scShopGoodsStockList[this.data.cur].stockPrice
      } else {
        price = this.data.data.scShopGoodsStockList[this.data.cur].stockBatchPrice
      }
    } else if (this.data.status == 2) {//秒杀
      price = this.data.data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice
    } else if (this.data.status == 3) {//普通商品
      price = this.data.data.stockListDefault[this.data.cur].stockPrice
    }
    this.setData({
      number: this.data.number + num,
      price: price,
      total: (price * number).toFixed(2) //价格保留两位小数
    })
    //购物车数量变化
    if (this.data.buy == 'addCart') {
      let cartData = this.data.cartData,
        numChange;
      if (option == 'add') {
        numChange = 1;
      } else if (option == 'minus') {
        numChange = -1;
      }
      for (let i = 0; i < cartData.length; i++) {
        if (cartData[i].goodsId == this.data.data.stockListDefault[0].goodsId) {
          if (cartData[i].stockId == this.data.data.stockListDefault[this.data.cur].id) {
            cartData[i].number += numChange;
          } else if (cartData[i].goodsId == this.data.data.stockListDefault[0].goodsId && cartData[i].stockId == null) {
            cartData[i].number += numChange;
          }
        }
      }
      this.setData({
        cartData: cartData
      })
    }
  },
  closeMask: function () {//关闭遮罩
    this.setData({
      flag: false,
      flag1: false,
      flag2: false,
      showBuy: false,
      untouch: 'touch'
    })
    this.getData(this.data.parm)
  },
  tobuy: function (e) {//购买下单
    if (e.currentTarget.id == 'buyNow' || e.currentTarget.id == 'buy' || e.currentTarget.id == 'groupBuy' || e.currentTarget.id == 'choseStock') {//单独购买，发起拼单，立即购买
      this.setData({
        buy: 'buyNow'
      })
      if (e.currentTarget.id == 'groupBuy') {//发起拼单
        this.setData({
          spellingType: 0
        })
      } else if (e.currentTarget.id == 'buy') {//单独购买
        this.setData({
          spellingType: 3
        })
      }
    } else if (e.currentTarget.id == 'addCart') {//加入购物车
      this.getCartNum({ customerId: wx.getStorageSync('scSysUser').id, shopId: this.data.shopId });
      this.setData({
        buy: 'addCart'
      })
    }
    let secondKillInfo = this.data.data.secondKillInfo,//秒杀商品信息
      scShopGoodsStockList = this.data.data.scShopGoodsStockList,//拼团商品信息
      stockListDefault = this.data.data.stockListDefault;//普通商品信息
    if (this.data.status == 1) {//拼团
      if (e.currentTarget.id == 'buy') {//单独购买
        this.setData({
          total: scShopGoodsStockList[this.data.cur].stockPrice,//总金额
          price: scShopGoodsStockList[this.data.cur].stockPrice,//单价
          buyType: 'solo'
        })
        // if (scShopGoodsStockList.length <= 1) {
        //   this.buyNow();
        //   return
        // }
      } else {//发起拼单
        this.setData({
          total: scShopGoodsStockList[this.data.cur].stockBatchPrice,//总金额
          price: scShopGoodsStockList[this.data.cur].stockBatchPrice,//单价
          buyType: 'group'
        })
        // if (scShopGoodsStockList.length<=1){
        //   this.buyNow();
        //   return
        // }
      }
      if (this.data.data.goodsType != 0) {//非普通商品类型(服务)
        this.setData({
          balance: this.data.stockBalance//服务库存
        })
      } else {
        this.setData({
          balance: scShopGoodsStockList[this.data.cur].stockNum//商品库存
        })
      }
    } else if (this.data.status == 2) {//秒杀
      if (this.data.listData[0].count <= 0) {
        wx.showToast({
          title: '活动已结束',
          icon: 'none'
        })
        return
      }
      this.setData({
        total: secondKillInfo[this.data.cur].goodsPreferentialStockPrice,//总金额
        balance: secondKillInfo[this.data.cur].salesCount,//库存
        price: secondKillInfo[this.data.cur].goodsPreferentialStockPrice//单价
      })
      // if (secondKillInfo.length<=1){//无其他规格
      //   this.buyNow()
      //   return
      // }
    } else {//普通商品
      if (this.data.data.goodsType != 0) {//非普通商品类型(服务)
        this.setData({
          balance: this.data.data.stockBalance//库存
        })
      } else {
        this.setData({
          balance: stockListDefault[this.data.cur].balance//库存
        })
      }
      this.setData({
        total: stockListDefault[this.data.cur].stockPrice,//总金额
        price: stockListDefault[this.data.cur].stockPrice//单机
      })
      // if (stockListDefault.length <= 1) {//无其他规格
      // if(this.data.buy=='addCart'){
      //   this.addCart()
      // }
      // else{
      //   this.buyNow()
      // }
      // return
      // }
      // let stockData=[];
      // if(this.data.buy='addCart'){
      //   for (let i = 0; i < stockListDefault.length;i++){
      //     stockData.push({
      //       stockId: stockListDefault[i].id,
      //       number:1
      //     })
      //   }
      //   this.setData({
      //     stockData: stockData
      //   })
      // }
    }
    this.setData({
      showBuy: true,
      flag: true,
      number: 1,
      untouch: 'untouch'
    })
  },
  chose: function (e) {//选择规格
    this.setData({
      cur: e.currentTarget.dataset.index,
    })
    let data = this.data.data;
    if (this.data.status == 1) {//拼团
      let buyType = this.data.buyType;
      if (buyType == 'solo') {//单独购买
        this.setData({
          total: data.scShopGoodsStockList[this.data.cur].stockPrice,//总金额
          price: data.scShopGoodsStockList[this.data.cur].stockPrice,//单价
        })
      } else {//发起拼单
        this.setData({
          total: data.scShopGoodsStockList[this.data.cur].stockBatchPrice,//总金额
          price: data.scShopGoodsStockList[this.data.cur].stockBatchPrice,//单价
        })
      }
      if (this.data.data.goodsType != 0) {//非普通商品类型
        this.setData({
          balance: this.data.data.stockBalance,//库存
          number: 1
        })
      } else {
        this.setData({
          balance: data.scShopGoodsStockList[this.data.cur].stockNum,//库存
          number: 1
        })
      }
    } else if (this.data.status == 2) {//秒杀
      this.setData({
        total: data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice,//总金额
        balance: data.secondKillInfo[this.data.cur].salesCount,//库存
        price: data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice,//单价
        number: 1
      })
    } else if (this.data.status == 3) {//普通商品购买
      if (this.data.data.goodsType != 0) {
        this.setData({
          balance: this.data.stockBalance//库存
        })
      } else {
        this.setData({
          balance: data.stockListDefault[this.data.cur].balance,//库存
        })
      }
      this.setData({
        total: data.stockListDefault[this.data.cur].stockPrice,//总金额
        price: data.stockListDefault[this.data.cur].stockPrice,//单价
        number: 1
      })
    }
  },
  
  tabchange: function (e) {//选择(商品/详情/评价)
    this.setData({
      tabcur: e.currentTarget.id
    })
  },
  play: function (e) {
    this.setData({
      play: e.currentTarget.dataset.flag
    })
    let cur = e.currentTarget.dataset.flag,
      cur1 = cur.split('-')[0],
      cur2 = cur.split('-')[1],
      userData = this.data.userData;
    userData[cur1].commentUploadList[cur2].play = true;
    this.setData({
      userData: userData
    })
    this.videoContext = wx.createVideoContext((this.data.play).toString());
    this.videoContext.play();
  },
  videoStop: function () {
    let userData = this.data.userData;
    for (let i = 0; i < userData.length; i++) {
      for (let j = 0; j < userData[i].commentUploadList.length; j++) {
        userData[i].commentUploadList[j].play = false;
      }
    }
    this.setData({
      userData: userData
    })
  },
  preventTouchMove: function () {//阻止底层页面滚动

  },
 
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../index/index?shopId=' + this.data.shopId
    })
  }
})