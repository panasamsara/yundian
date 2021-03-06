import util from '../../utils/util.js';
import saveImg from '../../utils/saveImg.js';
// 1拼团 2秒杀 3普通商品
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
    info: '',
    loginType: 0,
    shareViewShow: false,
    loginType: 0,
    btnShow:'normal',
    draw: false
  },
  onLoad: function (options) {
    if (options.share) {
      this.setData({
        share: options.share
      })
    }
    if(options.shareUser){//转发进入页面记录推荐关系
      this.record({
        currentId: wx.getStorageSync('scSysUser').id,
        shareShop: options.shopId,
        shareUser: options.shareUser,
        sourcePart: '1',
        shareType: options.shareType,
        businessId: options.goodsId
      })
    }
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
    //

    if (wx.getStorageSync('scSysUser')) {
      this.getData(this.data.parm);
      this.getCartNum({ customerId: wx.getStorageSync('scSysUser').id, shopId: this.data.shopId });
    }
    //获取商品评论
    this.getComment();
    //获取问答内容
    this.getQuest();
    //获取优惠券数据 
    this.getCouponList();
  },
  resmevent: function (e) {
    var _this = this
    if (wx.getStorageSync('scSysUser')) {
      this.setData({
        loginType: 0
      })
      if (wx.getStorageSync('shopId')) {
        var parm = {
          shopId: this.data.shopId,
          goodsId: this.data.goodsId,
          customerId: wx.getStorageSync('scSysUser').id
        }
        this.getCartNum({ customerId: wx.getStorageSync('scSysUser').id, shopId: this.data.shopId })
        // debugger
        util.getShop(wx.getStorageSync('scSysUser').id, this.data.shopId).then(function (res) {
          _this.setData({
            shopInformation: res.data.data
          })
          //shop存入storage
          wx.setStorageSync('shop', res.data.data.shopInfo);
          //活动
          wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
          // 所有信息
          wx.setStorageSync('shopInformation', res.data.data);
          _this.getData(parm)
          // this.drawImg()

        })

      }
    }
  },
  resusermevent: function (e) {
    // debugger
    // if (!wx.getStorageSync('scSysUser')) {
    //   this.setData({
    //     loginType: 1
    //   })
    // }
  },
  record: function (data) {//记录推荐关系
    app.util.reqAsync('payBoot/wx/acode/record', data).then((res) => {})
  },
  onShow: function () { //缓存店铺信息（分享切店铺）
    var _this = this;
    util.checkWxLogin('share').then((loginRes) => {
      if (loginRes.status == 0) {
        // if (wx.getStorageSync('isAuth') == 'no') {
          // this.setData({
          //   loginType: 2
          // })
        // } else if (wx.getStorageSync('isAuth') == 'yes') {
          this.setData({
            loginType: 1
          })
        // }
      }else{
        var parm = {
          shopId: this.data.shopId,
          goodsId: this.data.goodsId,
          customerId: wx.getStorageSync('scSysUser').id
        }
        this.setData({
          parm: parm
        })
        this.getData(this.data.parm);
        this.getCartNum({ customerId: wx.getStorageSync('scSysUser').id, shopId: this.data.shopId })
      }
      var shopId = this.data.shopId
      if (!shopId) {
        shopId = wx.getStorageSync('shopId');
      }
      var shop = wx.getStorageSync('shop')

      if (!shop) {
        if (shopId == undefined) {
          wx.redirectTo({
            url: '../scan/scan'
          })
        } else {
          if (wx.getStorageSync('scSysUser')) {
            util.getShop(wx.getStorageSync('scSysUser').id, shopId).then(function (res) {
              _this.setData({
                shopInformation: res.data.data
              })
              //shop存入storage
              wx.setStorageSync('shop', res.data.data.shopInfo);
              //活动
              wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
              // 所有信息
              wx.setStorageSync('shopInformation', res.data.data);

            })
          }

        }
      } else {
        if (shopId == undefined || shopId == '' || shopId == null) {
          if (shop.shopHomeConfig) {
            if (shop.shopHomeConfig.videoPathList.length != 0) {
              let videoInfo = {}
              videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
              videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
              wx.setStorageSync('videoInfo', videoInfo)
            }
          }
          let shopInformation = wx.getStorageSync('shopInformation')
          _this.setData({
            shopInformation: shopInformation
          })

        } else {
          if (shopId == shop.id) {
            if (shop.shopHomeConfig) {
              if (shop.shopHomeConfig.videoPathList.length != 0) {
                let videoInfo = {}
                videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
                videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
                wx.setStorageSync('videoInfo', videoInfo)
              }
            }
            let shopInformation = wx.getStorageSync('shopInformation')
            _this.setData({
              shopInformation: shopInformation
            })

          } else {
            wx.removeStorageSync('shop')
            wx.removeStorageSync('goodsInfos')
            wx.removeStorageSync('shopInformation')
            util.getShop(loginRes.id, shopId).then(function (res) {
              _this.setData({
                shopInformation: res.data.data
              })
              //shop存入storage
              wx.setStorageSync('shop', res.data.data.shopInfo);
              //活动
              wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
              // 所有信息
              wx.setStorageSync('shopInformation', res.data.data);

            })
          }
        }

      }
    })
  },
  goshopback: function () {
    var msg = '';
    if (this.data.prostatus != 1) {
      if (this.data.prostatus == 0) {
        msg = '该商品已失效'
      } else if (this.data.prostatus == 2) {
        msg = '该商品已下架'
      }
      wx.showModal({
        content: msg,
        showCancel: false,
        success: function (res) {//失效下架返回
          if (res.confirm) {
            if (this.data.share == 'share') {
              wx.switchTab({
                url: '../index/index?shopId=' + this.data.shopId
              })
            } else {
              wx.navigateBack();

            }
          }
        }
      })
    }
  },
  //获取详情
  getData: function (parm) {
    let _this=this,
        params={
          source: 0,
          page: "pages/QrToActivity/QrToActivity",
          params: {
            shopId: wx.getStorageSync('shop').id,
            userId: wx.getStorageSync('scSysUser').id,
            shareUser: wx.getStorageSync('scSysUser').id,
            goodsId: this.data.goodsId,
            merchantId: wx.getStorageSync('shop').merchantId,
            sourcePart: 1
          }
        }
    wx.showLoading({
      title: '加载中'
    })
    app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {//获取服务器时间
      if (res.data.data) {
        this.setData({
          nowTime: res.data.data
        })
      }
    })
    app.util.reqAsync('shop/goodsDetailAddGroupBuying', parm).then((res) => {//获取商品详情数据
      if (res.data.data) {
        //获取商品状态(上架/下架/失效)
        var status = this.data.status;
        this.setData({
          prostatus: res.data.data.status,
          infoList: res.data.data
        })
        if (!this.data.loginType) {
          this.goshopback();
        }
        //商品具体分类(普通/拼团/秒杀)
        var data = res.data.data,
            status;
        if (data.activityStatus || data.activityStatus == 0) {//接口更新
          if (data.activityStatus == 0) {//普通商品
            status = 3;
          } else if (data.activityStatus == 1) {//拼团商品
            status = 1;
          } else if (data.activityStatus == 2) {//秒杀商品已开始
            status = 2;
            this.setData({
              activityStatus: 1
            })
          } else if (data.activityStatus == 3) {//秒杀未开始
            status = 2;
            this.setData({
              activityStatus: 0
            })
          }
        }
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
          if (this.data.activityStatus == 0) {//活动未开始
            console.log(secList.activityStartTime)
            secList.activityBeginTime = Date.parse(app.util.formatIOS(this.data.nowTime));
            secList.activityEndTime = Date.parse(app.util.formatIOS(secList.activityStartTime));
            secList.count = secList.activityEndTime - secList.activityBeginTime;
          } else {//活动已开始
            secList.activityStartTime = Date.parse(app.util.formatIOS(this.data.nowTime));
            secList.activityEndTime = Date.parse(app.util.formatIOS(secList.activityEndTime));
            secList.count = secList.activityEndTime - secList.activityStartTime;
          }
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
      if (this.data.status == 1) {//拼团
        params.params['shareType'] = 3;
      } else if (this.data.status == 2) {//秒杀
        params.params['shareType'] = 2;
      } else {
        params.params['shareType'] = 1;
      }
      this.setData({
        params:params
      })
      wx.hideLoading();
      if (wx.getStorageSync('shop')) {
        this.drawImg()
      }

    })
  },
  drawImg: function () {
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
      url: _this.data.logoUrl,
      success: function (res) {
        console.log(res.tempFilePath)
        _this.setData({
          logo: res.tempFilePath
        })
        wx.downloadFile({//缓存商品图片，直接使用网络路径真机无法显示或绘制
          url: _this.data.pictureUrl,
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
      }
    })
  },
  getCartNum: function (data) {//获取购物车商品信息
    app.util.reqAsync('shop/shopCartList', data).then((res) => {//目前接口只能返回0和1
      this.setData({
        cartTotal: res.data.total
      })
      let cartData = []
      // debugger
      if (res.data.data.length >= 1 && res.data.data[0].goodsList.length >= 1) {
        let goodsList = res.data.data[0].goodsList;
        for (let i = 0; i < goodsList.length; i++) {
          cartData.push({
            goodsId: goodsList[i].goodsId,
            stockId: goodsList[i].stockId,
            number: goodsList[i].number + 1
          })
        }
      }
      this.setData({
        cartData: cartData
      })
    })
  },
  getComment: function () {//获取商品评论
    app.util.reqAsync('shop/commentList', {
      type: 0,
      hasPicture: 0,
      shopId: this.data.shopId,
      goodsId: this.data.goodsId,
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      var data = res.data.data;
      if (data) {
        for (var i = 0; i < data.length; i++) {
          data[i].commentDate = data[i].commentDate.split(' ')[0];
          for (let j = 0; j < data[i].commentUploadList.length; j++) {
            data[i].commentUploadList[j].flag = i + '-' + j;
            data[i].commentUploadList[j].play = false;
            data[i].commentUploadList[j].indexs = i;
          }
        };
        this.setData({
          userData: data,
          all: res.data.total
        });
      } else {
        this.setData({
          all: 0
        })
      }
      //判断数据并显示隐藏占位图
      if (this.data.userData.length == 0) {
        this.setData({
          hideView1: false
        })
      } else {
        this.setData({
          hideView1: true
        })
      }
    });
  },
  getQuest: function () {//获取问大家
    app.util.reqAsync('shop/getGoodsQuestions', {
      shopId: this.data.shopId,
      goodsId: this.data.goodsId,
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      var data = res.data.data
      this.setData({
        askAcount: res.data.total,
        askData: data
      });
      if (this.data.askData.length == 0) {
        this.setData({
          hideView2: false
        })
      } else {
        this.setData({
          hideView2: true
        })
      }
    });
  },
  tolayer(e) {//跳转到拼单  
    this.setData({
      flag: true,
      flag1: true
    });
    let dataset = e.currentTarget.dataset,
      data = {
        groupBuyingId: this.data.listData[0].groupBuyingId,
        pageNo: 1,
        pageSize: 10,
        status: 0
      }
    app.util.reqAsync('shop/getSmallGroupListYQ', data).then((res) => {
      var timeData = res.data.data;
      for (let i = 0; i < timeData.length; i++) {//计算剩余时间
        timeData[i].nowTime = Date.parse(app.util.formatIOS(this.data.nowTime));
        timeData[i].endTime = Date.parse(app.util.formatIOS(timeData[i].endTime));
        timeData[i].count = timeData[i].endTime - timeData[i].nowTime;
      }
      this.setData({
        listDatas: timeData,
      })
    })
    let _this = this;
    clearInterval(_this.data.timer)
    this.data.timer = setInterval(function () {//设置定时器
      _this.count(_this.data.listDatas, 'listDatas')
    }, 1000)
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
  toJoin(e) {//去拼单       
    this.setData({
      flag: true,
      flag1: false,
      flag2: true,
      untouch: 'untouch'
    });
    var dataset = e.currentTarget.dataset,
      data = {
        groupId: dataset.groupid,
        smallGroupId: dataset.smallid//   #（选填）对应拼组表id"
      }
    this.setData({
      smallGroupId: dataset.smallid
    })
    app.util.reqAsync('shop/getSmallGroupUserListYQ', data).then((res) => {
      console.log(res.data)
      if (res.data.total) {
        this.setData({
          num: res.data.total
        })
      }
      var timeData = res.data.data;
      for (let i = 0; i < timeData.length; i++) {
        if (dataset.flag == "layer") {
          timeData[i].endTime = dataset.endtime;
        } else {
          timeData[i].endTime = Date.parse(app.util.formatIOS(dataset.endtime));
        }
        timeData[i].nowTime = Date.parse(app.util.formatIOS(this.data.nowTime));
        timeData[i].count = timeData[i].endTime - timeData[i].nowTime;
      }
      this.setData({
        picData: timeData
      })
    })
    let _this = this;
    clearInterval(_this.data.timer)
    this.data.timer = setInterval(function () {//设置定时器
      _this.count(_this.data.picData, 'picData')
    }, 1000)
  },

  //参与并拼单
  joinBuy: function () {
    let picData = this.data.picData,
      customerId = wx.getStorageSync('scSysUser').id;
    for (let i = 0; i < picData.length; i++) {
      if (picData[i].cUser == customerId) {
        wx.showToast({
          title: '您已经参与过该拼单了',
          icon: 'none'
        })
        return
      }
    }
    this.setData({
      spellingType: 1,
      buy: 'buyNow',
      showBuy: true,
      flag: true,
      flag2: false,
      total: this.data.data.scShopGoodsStockList[this.data.cur].stockBatchPrice,
      price: this.data.data.scShopGoodsStockList[this.data.cur].stockBatchPrice,
      balance: this.data.data.scShopGoodsStockList[this.data.cur].stockNum
    })
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
      goodsType = this.data.data.goodsType,
      num;
    if (option == 'add') {//加数量
      number += 1;
      num = 1;
      if (this.data.status == 1 && this.data.spellingType == 0 && (this.data.data.limitNum > 0 && number > this.data.data.limitNum)) {//拼团限购数量
        wx.showToast({
          title: '已超过最大购买数量',
          icon: 'none'
        })
        return
      }
      if (this.data.status == 2 && this.data.activityStatus == 1 && (secondKillInfo.goodsPurchasingCount > 0 && number > secondKillInfo.goodsPurchasingCount)) {//秒杀限购数量
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
        price = this.data.data.scShopGoodsStockList[this.data.cur].stockPrice;
      } else {
        price = this.data.data.scShopGoodsStockList[this.data.cur].stockBatchPrice;
      }
    } else if (this.data.status == 2) {//秒杀
      if (this.data.activityStatus === 0) {//秒杀活动未开始
        price = this.data.data.stockListDefault[this.data.cur].stockPrice;
      } else {//活动已开始
        price = this.data.data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice;
      }
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
          balance: this.data.data.stockBalance//服务库存
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
      if (this.data.activityStatus == 0) {//秒杀活动未开始
        this.setData({
          total: stockListDefault[this.data.cur].stockPrice,//总金额
          balance: stockListDefault[this.data.cur].balance,//库存
          price: stockListDefault[this.data.cur].stockPrice//单价
        })
      } else {//秒杀活动已开始
        this.setData({
          total: secondKillInfo[this.data.cur].goodsPreferentialStockPrice,//总金额
          balance: secondKillInfo[this.data.cur].salesCount,//库存
          price: secondKillInfo[this.data.cur].goodsPreferentialStockPrice//单价
        })
      }
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
        price: stockListDefault[this.data.cur].stockPrice//单价
      })
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
      if (this.data.activityStatus == 0) {//秒杀活动未开始
        this.setData({
          total: data.stockListDefault[this.data.cur].stockPrice,//总金额
          balance: data.stockListDefault[this.data.cur].balance,//库存
          price: data.stockListDefault[this.data.cur].stockPrice,//单价
          number: 1
        })
      } else {//秒杀活动已开始
        this.setData({
          total: data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice,//总金额
          balance: data.secondKillInfo[this.data.cur].salesCount,//库存
          price: data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice,//单价
          number: 1
        })
      }
    } else if (this.data.status == 3) {//普通商品购买
      if (this.data.data.goodsType != 0) {
        this.setData({
          balance: this.data.data.stockBalance//库存
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
  buyNow: function () {//立即购买
    if (this.data.balance <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    var status = this.data.status,
      data = this.data.data,
      cur = this.data.cur,
      spellingType = this.data.spellingType,
      url = '',
      info = [{
        'id': 0,
        'goodsName': data.goodsName,
        'goodsPrice': this.data.price,
        'stockPrice': this.data.price,
        'goodsImageUrl': data.pictureUrl,
        'number': this.data.number,
        'goodsType': data.goodsType,
        'goodsIndex': 0,
        'deliveryCalcContent': data.deliveryCalcContent,
        'actualPayment': this.data.price, //实付单价
        'goodsPic': data.pictureUrl,
        'unitPrice': this.data.price //单价
      }]
    if (status == 1) {//拼团
      let urls = '../../../../../packageBuy/pages/secKillBuy/secKillBuy?realMoney=' + this.data.total + '&goodsId=' + data.scShopGoodsStockList[0].goodsId + '&goodsPrice=' + this.data.price + '&goodsType=' + data.goodsType + '&remake=' + data.scShopGoodsStockList[cur].stockName + '&stockId=' + data.scShopGoodsStockList[cur].id + '&goodsName=' + data.goodsName + '&stockName=' + data.scShopGoodsStockList[cur].stockName + '&goodsNum=' + this.data.number + '&pictureUrl=' + data.pictureUrl + '&deliveryCalcContent=' + data.deliveryCalcContent + '&isSeckill=' + 0 + '&groupId=' + data.isGroupBuying + '&limitNum=' + this.data.data.limitNum;
      if (spellingType == 0) {//发起拼单
        url = urls + "&spellingType=" + 0 + '&SmallGroupId=' + 0;
      } else if (spellingType == 1) {//参与拼单
        url = urls + "&spellingType=" + 1 + '&SmallGroupId=' + this.data.smallGroupId;
      } else { //单独购买
        info[0]['goodsId'] = data.scShopGoodsStockList[0].goodsId
        info[0]['stockId'] = data.scShopGoodsStockList[cur].id,
          info[0]['stockName'] = data.scShopGoodsStockList[cur].stockName,
          info[0]['balance'] = data.scShopGoodsStockList[cur].stockNum,
          info[0]['remake'] = data.scShopGoodsStockList[cur].stockName
        wx.setStorageSync('cart', info);
        url = "../../../../../packageBuy/pages/orderBuy/orderBuy?totalMoney=" + this.data.total
      }
    } else if (status == 2 && this.data.activityStatus == 1) {//秒杀
      let urls = '../../../../../packageBuy/pages/secKillBuy/secKillBuy?realMoney=' + this.data.total + '&goodsId=' + data.id + '&goodsPrice=' + this.data.price + '&secondskillActivityId=' + data.secondKillInfo[cur].secondskillActivityId + '&goodsType=' + data.goodsType + '&remake=' + data.secondKillInfo[cur].stockName + '&stockId=' + data.secondKillInfo[cur].goodsStockId + '&goodsName=' + data.goodsName + '&goodsNum=' + this.data.number + '&pictureUrl=' + data.pictureUrl + '&deliveryCalcContent=' + data.deliveryCalcContent + '&isSeckill=' + 1 + '&limitNum=' + this.data.data.secondKillInfo[this.data.cur].goodsPurchasingCount
      if (data.secondKillInfo.length <= 1 && data.secondKillInfo[0].isDefault == 0) {
        url = urls + '&stockName=' + data.secondKillInfo[cur].stockSku
      } else {
        url = urls + '&stockName=' + data.secondKillInfo[cur].stockName
      }
    } else if (status == 3 || (status == 2 && this.data.activityStatus == 0)) {//普通或未开始的秒杀商品
      info[0]['goodsId'] = data.stockListDefault[0].goodsId,
        info[0]['stockId'] = data.stockListDefault[cur].id,
        info[0]['stockName'] = data.stockListDefault[cur].stockName,
        info[0]['balance'] = data.stockListDefault[cur].balance,
        info[0]['remake'] = data.stockListDefault[cur].stockName
      wx.setStorageSync('cart', info);
      url = "../../../../../packageBuy/pages/orderBuy/orderBuy?totalMoney=" + this.data.total
    }
    console.log(url)
    wx.navigateTo({
      url: url,
    })
  },
  addCart: function () {//加入购物车
    if (this.data.balance <= 0) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return
    }
    let data = {
      goodsId: this.data.data.stockListDefault[0].goodsId,
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: this.data.shopId,
      // stockId: this.data.data.stockListDefault[this.data.cur].id,
      // number: this.data.cartData[this.data.cur].number,
      goodsName: this.data.data.goodsName
    },
      cartData = this.data.cartData,
      rnumber,
      stockId;
    rnumber = this.data.number;
    if (this.data.data.stockList.length <= 0) {//默认规格
      stockId = null;
    } else {//非默认规格
      stockId = this.data.data.stockListDefault[this.data.cur].id
    }
    if (this.data.cartData.length >= 1) {//如果购物车有商品
      let cartData = this.data.cartData;
      for (let i = 0; i < cartData.length; i++) {
        if (cartData[i].goodsId == this.data.data.stockListDefault[0].goodsId) {//如果购物车有该商品
          if (cartData[i].stockId == this.data.data.stockListDefault[this.data.cur].id) {//如果购物车有该规格商品
            rnumber = cartData[i].number;
          } else if (cartData[i].goodsId == this.data.data.stockListDefault[0].goodsId && cartData[i].stockId == null) {//如果购物车有该规格商品且属于默认规格商品
            rnumber = cartData[i].number;
          }
        }
      }
    }
    data['number'] = rnumber;//存入购物车该商品规格的数量
    data['stockId'] = stockId;//存入购物车该商品规格id
    app.util.reqAsync('shop/updateNewShopCartV2', data).then((res) => {//加入购物车
      console.log(res)
      if (res.data.code == 1) {
        wx.showToast({
          title: '加入成功',
          icon: 'none'
        })
      }
    })
    let _this = this,
      total = this.data.cartTotal;
    this.setData({
      cartTotal: 1
    })
    setTimeout(function () {
      _this.closeMask();
    }, 1000)
  },
  getCouponList: function () {//获取优惠券数据
    let datas = {
      shopId: this.data.shopId
    }
    app.util.reqAsync('shop/getCouponList', datas).then((res) => {
      if (res.data.data) {
        let list = res.data.data,
          couponType1 = [],
          couponType2 = [],
          couponType3 = []
        for (let i = 0; i < list.length; i++) {
          list[i].beginTime = app.util.formatActivityDate(list[i].beginTime);
          list[i].endTime = app.util.formatActivityDate(list[i].endTime)
          if (list[i].couponType == '01') {//优惠券
            couponType1.push(list[i])
          } else if (list[i].couponType == '02') {//代金券
            couponType2.push(list[i])
          } else if (list[i].couponType == '03') {//包邮
            couponType3.push(list[i])
          }
        }
        this.setData({
          couponType1: couponType1,
          couponType2: couponType2,
          couponType3: couponType3
        })
      }
    }).catch((err) => {
      console.log(err)
    })
  },
  get: function (e) {//领取优惠券
    let datas = {
      shopId: this.data.shopId,
      customerId: wx.getStorageSync('scSysUser').id,
      number: 1,
      couponId: e.currentTarget.dataset.id
    }
    app.util.reqAsync('shop/takeCoupon', datas).then((res) => {
      console.log(res.data.msg)
      wx.showToast({
        title: res.data.msg,
        icon: 'none'
      })
    }).catch((err) => {
      console.log(err)
    })
  },
  showQuanBox: function () {//弹出优惠券列表页
    this.setData({
      showQuanBox: true,
      untouch: 'untouch'
    })
  },
  closeQuanBox: function () {//关闭优惠券列表页
    this.setData({
      showQuanBox: false,
      untouch: 'touch'
    })
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
  drawPicSeckill: function () {//绘制秒杀页面
    let scale = this.data.scale*2,
      context = wx.createCanvasContext('seckill'),
      _this = this;
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 480 * scale, 380 * scale);
    context.drawImage('images/zhuanfa_ms_bg@2x.png', 0, 0, 230 * scale, 190 * scale);//绘制边框
    context.drawImage(_this.data.proPic, 16 * scale, 18 * scale, 90 * scale, 90 * scale)//绘制商品图片
    context.setFontSize(15 * scale);
    context.setFillStyle('#e73130');
    context.fillText('￥', 122 * scale, 45 * scale);
    context.setFontSize(22 * scale);
    context.fillText(this.data.listData[0].goodsPreferentialStockPrice, 135 * scale, 45 * scale);//绘制现价
    context.setFontSize(14 * scale);
    context.setFillStyle('#9b9b9b');
    context.fillText('￥' + this.data.listData[0].goodsOriginalStockPrice, 122 * scale, 68 * scale);//绘制原价
    let w = context.measureText('￥' + this.data.listData[0].goodsOriginalStockPrice)
    context.beginPath();
    context.moveTo(122 * scale, 63 * scale);       //设置起点状态
    context.lineTo((w.width/2 + 125) * scale, 63 * scale);       //设置末端状态
    context.setLineWidth(1);          //设置线宽状态
    context.setStrokeStyle('#9b9b9b') //设置线的颜色状态
    context.stroke();
    context.rect(122 * scale, 100 * scale, 60 * scale, 2 * scale);
    context.setFillStyle('#9b9b9b');
    context.fill();
    let w1 = context.measureText(this.data.data.payCount + '人秒杀成功');
    context.drawImage('images/zhuanfa_kuang@2x.png', 122 * scale, 90 * scale, (w1.width)/2 * scale, 20 * scale);
    context.setFontSize(12 * scale);
    context.setFillStyle('#ffffff');
    context.fillText(this.data.data.payCount + '人秒杀成功', 126 * scale, 105 * scale);
    context.draw(false, function () {
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 960,
        height: 760,
        destWidth: 960,
        destHeight: 760,
        fileType: 'jpg',
        canvasId: 'seckill',
        success: function (res) {
          console.log(res.tempFilePath)
          _this.setData({
            secPath: res.tempFilePath
          })
        }
      })
    }
    )
  },
  drawPicGroup: function () {//绘制拼团页面
    let scale = this.data.scale*2,
      context = wx.createCanvasContext('groupbuy'),
      _this = this;
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 480 * scale, 380 * scale);//绘制背景色
    context.drawImage(_this.data.proPic, 0, 0, 240 * scale, 140 * scale);//绘制背景图
    let w = context.measureText(Math.floor(Math.random() * 199 + 1) + '人正在参与拼团');
    context.drawImage('images/zhuanfa_pt_bg@2x.png', 26 * scale, 13 * scale, (w.width/2 + 12) * scale, 26 * scale);//绘制店铺右侧店铺图片
    context.setFillStyle('#ffffff');
    context.setFontSize(14 * scale);
    context.fillText(Math.floor(Math.random() * 199 + 1) + '人正在参与拼团', 40 * scale, 31 * scale);//绘制参团人数
    context.save();
    context.beginPath();
    context.arc(26 * scale, 26 * scale, 13 * scale, 0, 2 * Math.PI);//绘制圆形头像画布
    context.fill();
    context.clip();
    context.drawImage(_this.data.logo, 13 * scale, 13 * scale, 26 * scale, 26 * scale);//绘制店铺头像
    context.restore();//恢复之前保存的上下文
    context.setFontSize(18 * scale);
    context.setFillStyle('#fb191d');
    context.fillText('￥' + this.data.data.groupBuyingPrice, 13 * scale, 174 * scale);//绘制拼团价
    let w1 = context.measureText('￥' + this.data.data.groupBuyingPrice);
    context.setFontSize(14*scale);
    context.setFillStyle('#989898');
    context.fillText('￥' + this.data.data.price, (w1.width/2 + 13 + 5) * scale, 174 * scale);//绘制原价
    let w2 = context.measureText('￥' + this.data.data.price);
    context.beginPath();
    context.moveTo((w1.width/2 + 13 + 5) * scale, 168 * scale);       //设置起点状态
    context.lineTo((w1.width/2 + w2.width/2 + 13 + 5 + 3) * scale, 168 * scale);       //设置末端状态
    context.setLineWidth(1);          //设置线宽状态
    context.setStrokeStyle('#989898') //设置线的颜色状态
    context.stroke();
    context.drawImage('images/zhuanfa_pt_btn@2x.png', 150 * scale, 148 * scale, 80 * scale, 36 * scale);
    context.setFontSize(16 * scale);
    context.setFillStyle('#000000');
    context.fillText('去拼团', 165 * scale, 172 * scale);
    context.draw(false, function () {
      wx.canvasToTempFilePath({//绘制完成执行保存回调
        x: 0,
        y: 0,
        width: 960,
        height: 840,
        destWidth: 960,
        destHeight: 840,
        fileType: 'jpg',
        canvasId: 'groupbuy',
        success: function (res) {
          console.log(res.tempFilePath)
          _this.setData({
            groupPath: res.tempFilePath
          })
        }
      })
    });
  },
  onShareAppMessage: function () {//用户转发分享 
    if (this.data.status == 1) {//拼团分享
      return {
        title: this.data.data.goodsName,
        desc: this.data.goodsName,
        imageUrl: this.data.groupPath,
        path: '/pages/goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodsId + '&share=share' + '&shareUser=' + wx.getStorageSync('scSysUser').id+'&shareType=3&sourcePart=1',
        success: function () {
        }
      }
    } else if (this.data.status == 2) {//秒杀分享
      return {
        title: this.data.data.goodsName,
        desc: this.data.goodsName,
        imageUrl: this.data.secPath,
        path: '/pages/goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodsId +'&shareUser=' + wx.getStorageSync('scSysUser').id + '&shareType=2&sourcePart=1',
        success: function () {

        }
      }
    } else if (this.data.status == 3) {//普通商品
      return {
        title: '￥' + this.data.data.price + ' | ' + this.data.data.goodsName,
        desc: this.data.goodsName,
        path: '/pages/goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodsId +'&shareUser=' + wx.getStorageSync('scSysUser').id + '&shareType=1&sourcePart=1',
        imageUrl: this.data.data.pictureUrl,
        success: function () {

        }
      }
    }
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../index/index?shopId=' + this.data.shopId
    })
  },
  previewImage: function (e) {//图片预览
    var current = e.target.dataset.src,
      imageList = [],
      commentList = this.data.userData[e.target.dataset.index].commentUploadList;
    for (let i = 0; i < commentList.length; i++) {
      imageList.push(commentList[i].filePath)
    }
    wx.previewImage({
      current: current,
      urls: imageList
    })
  },
  shareBtn:function(){//点击分享
    this.setData({
      posterShow:true,
      untouch: 'untouch'
    })
  },
  closeShare:function(){//关闭分享
    this.setData({
      posterShow:false,
      untouch: 'touch'
    })
  },
  drawPoster:function(){//绘制海报
    if (this.data.canvasUrl){
      return;
    }
    this.setData({
      untouch: 'untouch'
    })
    wx.showLoading();
    var shopName = this.data.data.shopName,
        _this=this;
    if (shopName.length > 7) {
      shopName = shopName.substring(0, 6) + '..';
    }
    if (!this.data.codeUrl) {
      saveImg.getCode(_this, _this.data.params).then(function(){
        wx.downloadFile({//缓存店铺头像，直接使用网络路径真机无法显示或绘制
          url: _this.data.logoUrl,
          success: function (res) {
            _this.setData({
              logo: res.tempFilePath
            })
            wx.downloadFile({//缓存商品图片，直接使用网络路径真机无法显示或绘制
              url: _this.data.pictureUrl,
              success: function (res) {
                _this.setData({
                  proPic: res.tempFilePath
                })
                if (_this.data.status == 1) {//拼团
                  _this.groupPoster(shopName);
                } else if (_this.data.status == 2) {//秒杀
                  _this.secPoster(shopName);
                } else {//普通
                  _this.poster(shopName);
                }
              }
            })
          }
        })
      });
    }
  },
  groupPoster: function (shopName){//绘制拼团商品海报
    var context = wx.createCanvasContext('shareCanvas'),
        scale=this.data.scale*2,
        backImg="../../images/bg4.png",
        frontImg="../../images/bg4_2.png";
    context.setFillStyle('#ffffff');
    context.fillRect(0,0,690*scale,1000*scale);//设置白色背景
    context.drawImage(backImg,0,0,345*scale,500*scale);//绘制背景图
    context.setFontSize(14 * scale);
    context.setFillStyle('#ffffff');
    let group=Math.floor(Math.random()*199+1)+'人正在拼团',
        w=context.measureText(group).width;
    context.fillText(group,(690-w)/4*scale,107*scale);
    context.setFillStyle('#333333');
    context.setFontSize(28*scale);
    let w1 = context.measureText(shopName).width;
    context.fillText(shopName,(690-w1)/4*scale,72*scale);//绘制店铺名
    context.setStrokeStyle('#fb452d');
    context.setLineWidth(10*scale);
    context.strokeRect(20*scale,130*scale,305*scale,305*scale);//绘制矩形边框
    context.drawImage(this.data.proPic, 20 * scale, 130 * scale, 305 * scale, 305 * scale);//绘制商品图片
    context.drawImage(this.data.codeUrl,20*scale,130*scale,83*scale,83*scale);//绘制二维码
    context.setFillStyle('#ff0400');
    context.setFontSize(15*scale);
    context.fillText('￥',15*scale,470*scale);
    context.setFontSize(24*scale);
    context.fillText(this.data.data.groupBuyingPrice.toFixed(2),30*scale,470*scale);//绘制拼团价
    context.setFillStyle('#969696');
    context.setFontSize(9*scale);
    context.fillText('￥',20*scale,490*scale);
    context.setFontSize(14*scale);
    context.fillText(this.data.data.price.toFixed(2),30*scale,490*scale);//绘制原价
    let w2=context.measureText('￥'+this.data.data.price.toFixed(2)).width;
    context.beginPath();
    context.moveTo(20*scale,485*scale);
    context.lineTo((w2+40)/2*scale,485*scale);
    context.setLineWidth(1*scale);
    context.setStrokeStyle('#969696');
    context.stroke();
    context.drawImage(frontImg,175*scale,370*scale,170*scale,130*scale);
    let _this=this;
    context.draw(false,function(){
      setTimeout(function () {//延时缓存避免部分安卓手机canvas绘图串色
        saveImg.temp(_this, 'shareCanvas', 1380, 2000, 1380, 2000);
      }, 1000)
    });
  },
  secPoster: function (shopName){//绘制秒杀商品海报
    var context=wx.createCanvasContext('shareCanvas'),
        scale=this.data.scale*2,
        backImg ="../../images/bg2.png",
        textImg ="../../images/ms.png";
    context.setFillStyle('#ffffff');
    context.fillRect(0,0,690*scale,1000*scale);//设置白色背景
    context.drawImage(this.data.proPic,0,0,345*scale,345*scale);//绘制商品图片
    context.setFillStyle('#fc4a26');
    context.setFontSize(14*scale);
    let w = context.measureText(shopName).width;
    context.fillRect((690-w-30-70-30)/2*scale,0,(w+60)/2*scale,30*scale);//绘制店铺名背景
    context.setFillStyle('#ffffff');
    context.fillText(shopName, (690-w-30-70)/2*scale, 20*scale);//绘制店铺名
    context.drawImage(backImg,0,250*scale,345*scale,260*scale);//绘制背景图
    context.drawImage(textImg,35*scale,220*scale,120*scale,120*scale);//绘制字体
    context.setFillStyle('#ffffff');
    context.fillRect(35*scale,360*scale,150*scale,30*scale);
    context.setFontSize(20*scale);
    context.setFillStyle('#ffffff');
    context.fillText('￥',35*scale,440*scale);
    context.setFontSize(34*scale);
    context.fillText(this.data.listData[0].goodsPreferentialStockPrice.toFixed(2),55*scale,440*scale);//绘制秒杀价
    context.setFillStyle('#fb4a28');
    context.setFontSize(15*scale);
    context.fillText(Math.floor(Math.random()*199+1)+'人已秒杀成功',50*scale,380*scale);
    context.setFillStyle('#fececc');
    context.setFontSize(12*scale);
    context.fillText('￥',40*scale,470*scale);
    context.setFontSize(20*scale);
    context.fillText(this.data.listData[0].goodsOriginalStockPrice.toFixed(2),55*scale,470*scale);//绘制原价
    context.beginPath();
    context.setStrokeStyle('#f8fff8');
    let w1=context.measureText(this.data.listData[0].goodsOriginalStockPrice.toFixed(2)).width;
    context.moveTo(40*scale,462*scale);
    context.lineTo((110+w1+6)/2*scale,462*scale);
    context.stroke();//绘制中划线
    context.drawImage(this.data.codeUrl,240*scale,390*scale,82*scale,82*scale);
    let _this=this;
    context.draw(false,function(){
      setTimeout(function(){//延时缓存避免部分安卓手机canvas绘图串色
        saveImg.temp(_this, 'shareCanvas', 1380, 2000, 1380, 2000);
      },1000)
    })        
  },
  poster: function (shopName){//绘制普通商品海报
    var context=wx.createCanvasContext('shareCanvas'),
        scale=this.data.scale*2,
        codeImg ="../../images/an.png",
        info=this.data.data.goodsName;
    context.setFillStyle('#ffffff');
    context.fillRect(0,0,690*scale,1000*scale);//设置白色背景
    context.setFontSize(20*scale);
    context.setFillStyle('#000000');
    let w = context.measureText(shopName).width;
    context.fillText(shopName,(690-w)/4*scale,35*scale);//绘制店铺名
    context.drawImage(this.data.proPic,18*scale,55*scale,309*scale,318*scale);//绘制商品图片
    context.setFontSize(15*scale);
    context.setFillStyle('#686868');
    if (info.length > 13) {//绘制商品详情(2行)
      context.fillText(info.substring(0, 12),18*scale,405*scale);
      context.fillText(info.substring(13, 26) + '...',18*scale,425*scale);
    }else{//(1行)
      context.fillText(info,18*scale,405*scale);
    }
    context.setFillStyle('#ff0200');
    context.fillText('￥',18*scale,480*scale);
    context.setFontSize(24*scale);
    context.fillText(this.data.data.price.toFixed(2),37*scale,480*scale);//绘制商品价格
    context.drawImage(codeImg,235*scale,390*scale,92*scale,92*scale);//绘制二维码框
    context.drawImage(this.data.codeUrl, 243 * scale, 400 * scale, 76 * scale, 76 * scale)
    let _this = this;
    context.draw(false, function () {
      setTimeout(function () {//延时缓存避免部分安卓手机canvas绘图串色
        saveImg.temp(_this, 'shareCanvas', 1380, 2000, 1380, 2000);
      }, 1000)
    })
  },
  saveImg: function () {//保存图片
    var that = this;
    saveImg.saveImg(that);
  },
  handleSetting: function (e) {//授权
    let that = this;
    saveImg.handleSetting(that,e.detail.e);
  }
})