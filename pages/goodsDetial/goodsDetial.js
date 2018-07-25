//获取应用实例
const app = getApp();
Page({
  data:{
    shopInformation: {},//商铺信息
    indicatorDots:true, //是否显示面板指示点
    // imgUrls:[], 
    hideView1: true,
    hideView2:true,
    num: 0,
    shopId:'',
    goodsId:'',
    //用户信息
    userData: [],
    //商品信息
    goodsData:{},
    flag:false,
    flag1:false,
    flag2: false,
    //拼单部分参数
    groupBuyingId: '',//对应拼团表的id
    status:'',//状态
    cUser:'',//发起拼团者id,
    list:[],
    flagCount:'',
    flagSpellList:'',
    number:1,
    showBuy:false,
    cur:0
  },
  onLoad: function(options){
    console.log(options)
    //  this.setData({
    //    status:-1
    //  })
    //  if (options.status==1){//拼团
    //    this.setData({
    //      status: options.status,
    //      groupBuyingId: options.groupBuyingId,
    //      cUser: options.cUser
    //    })    
    //  } else if (options.status == 2){//秒杀
    //    this.setData({
    //      status: options.status
    //    });
    //  }else{//普通商品
    //   this.setData({
    //      status: options.status
    //   })
    //  }
    this.setData({
      status:options.status
    })
     var parm = {
       shopId: options.shopId,
       goodsId: options.goodsId,
     }
     if(this.data.status==3){
       this.getDataNormal(parm)
     }else{
       this.getData(parm);
     }
    //获取店铺信息
    // var shop = wx.getStorageSync('shop');
    // this.setData({
    //   shopId: options.shopId,
    //   goodsId: options.goodsId,      
    //   shopName:shop.shopName,
    //   picImg: shop.logoUrl,
    //   shopDesc: shop.shopDesc,
    //   score: shop.score
    // });
    //获取商品评论
    app.util.reqAsync('shop/commentList',{
      type: 0,
      hasPicture: 0,
      shopId: options.shopId,
      goodsId: options.goodsId,
      pageNo: 1,
      pageSize: 2
    }).then((res)=>{
      var data = res.data.data;
      // console.log(data)
      if(data){
        for (var i = 0; i < data.length; i++) {
          var key = 'creatTime';
          var value = data[i].commentDate.slice(0, 11)
          data[i][key] = value
        };
        this.setData({
          userData: data,
          all: res.data.total
        });
      }else{
        this.setData({
          all:0
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

    //获取问答内容
    app.util.reqAsync('shop/getGoodsQuestions', {
      shopId: options.shopId,
      goodsId: options.goodsId,
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      var data = res.data.data 
      this.setData({
        askAcount: res.data.total,
        askData: data
      });
      if (this.data.askData.length == 0){
        this.setData({
          hideView2: false
        })
      }else{
        hideView2: true
      }
    });  
  },
  //获取普通商品详情
  getDataNormal:function(parm){
    app.util.reqAsync('shop/goodsDetail',parm).then((res) => {
      if(res.data.data){
        let stockList=res.data.data.stockList;
        for(let i=0;i<stockList.length;i++){
          stockList[i].index=i
        }
        this.setData({
          data:res.data.data
        })
      }
    });
  },
  // 获取详情
  getData: function (parm) {
    wx.showLoading({
      title: '加载中'
    })
    app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
      if (res.data) {
        this.setData({
          nowTime: res.data.data
        })
      }
    })
    app.util.reqAsync('shop/goodsDetailAddGroupBuying',parm).then((res) => {
      var status=this.data.status,
          prostatus=res.data.data.status,
          msg;
      if(prostatus!=1){
        if (prostatus == 0){
          msg = '该商品已失效'
        } else if (prostatus == 2){
          msg = '该商品已下架'
        }
        wx.hideLoading();
        wx.showModal({
          content: msg,
          showCancel:false,
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack();
            } 
          }
        })
        return
      }
      if(res.data.data){
        var data=res.data.data,
            secondKillInfo = data.secondKillInfo,
            scShopGoodsStockList = data.scShopGoodsStockList
        data.shopScore=parseInt(data.shopScore);
        if(status==1){//拼团
            if (scShopGoodsStockList.length > 0) {
              for (let i = 0; i < scShopGoodsStockList.length; i++) {
                scShopGoodsStockList[i].index = i;
              }
            }
            let list = data.groupBuyingList;
            for (let i = 0; i < list.length; i++) {
              list[i].activityStartTime = Date.parse(this.data.nowTime);
              list[i].activityEndTime = Date.parse(list[i].endTime);
              list[i].count = list[i].activityEndTime - list[i].activityStartTime;
            };
            this.setData({
              groupBuyingPrice: data.groupBuyingPrice,
              groupBuyingAllNum: data.groupBuyingAllNum,
              listData: list
            })
        } else if (status == 2) {//秒杀
            if (secondKillInfo.length > 0) {
              for (let i = 0; i < secondKillInfo.length; i++) {
                secondKillInfo[i].index = i;
              }
            }
            let secList = data.secondKillInfo[0],
                list=[];
            secList.activityStartTime = Date.parse(this.data.nowTime);
            secList.activityEndTime = Date.parse(secList.activityEndTime);
            secList.count = secList.activityEndTime - secList.activityStartTime;
            list.push(secList)
            this.setData({
              listData: list
            })
        }
        this.setData({
          data:data
        })
      }  
      wx.hideLoading();
      let _this = this
      if (this.data.status == 1 || this.data.status == 2) {
        setInterval(function () {
          _this.count()
        }, 1000)
      } 
    })
  },  
  //跳转到拼单
  toLayer(){   
    this.setData({
      flag:true ,
      flag1:true
    });
    app.util.reqAsync('shop/getSmallGroupListYQ',{
      groupBuyingId:this.data.groupBuyingId,//对应拼团表的id"
      status:this.data.status,   //状态：0未生效，1成功,2过期"
      cUser: this.data.cUser,   //发起拼组者id",
      pageNo: 1,
      pageSize: 10        
    }).then((res)=>{
      var data=res.data.data;
      this.setData({
        allListData:data
      })
    })
  },
  //关闭拼单弹出层
  closeLayer(){
    this.setData({
      flag:false,
      flag1:false,
      flag2:false
    })
  },
  //去拼单
  toJoin(e){         //需要的数据已存到e里面
    this.setData({
      flag:true,
      flag1:false,
      flag2:true
    });
    app.util.reqAsync('shop/getSmallGroupUserListYQ',{
      groupId:'',
      smallGroupId:'' ,//   #（选填）对应拼组表id",
      status:'', //状态：0已付款，1申请退款",
      cUser:'',   //参与者用户id",
      pageNo:'', 
      pageSize: ''    
    }).then((res)=>{
      var data=res.data.data 
      this.setData({
        picData:data
      })
    })
  },
  //参与并拼单
  joinBuy(e){
    var pictureUrl = this.data.goodsData.pictureUrl;//图片地址
    var groupBuyingPrice = this.data.groupBuyingPrice;//价格
    var stockBalance = this.data.stockBalance;//库存
    wx.navigateTo({
      url: '../buyNow/buyNow?pictureUrl=' + pictureUrl + '&groupBuyingPrice=' + groupBuyingPrice + '&stockBalance=' + stockBalance
    })

  },
  //跳转到赠品
  toGive(){
    wx.navigateTo({
      url: '/pages/give/give',
    })

  },
  //跳转到评价
  toAppraise(){
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  //跳转到问答详情
  toAsk(){
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;    
    wx.navigateTo({
      url: '/pages/ask/ask?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  //跳转到店铺
  goShop(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 倒计时方法
  count(){
    for (let i = 0; i < this.data.listData.length; i++) {
      let leftTime = this.data.listData[i].count;
      leftTime -= 1000;
      if (leftTime <= 0) {
        leftTime=0
      }
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
          h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
          m = Math.floor(leftTime / 1000 / 60 % 60),
          s = Math.floor(leftTime / 1000 % 60),
          rh = d * 24 + h,
          count = "listData[" + i + "].count",
          rhCount = "listData[" + i + "].rh",
          mCount = "listData[" + i + "].m",
          sCount = "listData[" + i + "].s";
      if (rh < 10) {
        rh = "0" + rh;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        [count]: leftTime,
        [rhCount]: rh,
        [mCount]: m,
        [sCount]: s
      })
    }
  },  
  change:function(e){
    var option=e.currentTarget.id,
        number = this.data.number,
        num;
    if(option=='add'){//加数量
      number += 1;
      num=1;
      if (number > this.data.balance) {
        wx.showToast({
          title: '已超过库存',
          icon: 'none'
        })
        return
      }
    }else if(option=='minus'){//减数量
      number -= 1;
      num = -1;
      if (number < 1) {
        number = 1
        return
      }
    }
    var price
    if (this.data.status == 1) {//拼团
      if(this.data.buyType=='solo'){
        price = this.data.data.scShopGoodsStockList[this.data.cur].stockPrice
      }else{
        price = this.data.data.scShopGoodsStockList[this.data.cur].stockBatchPrice
      }
    } else if (this.data.status == 2) {//秒杀
      price = this.data.data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice
    } else if(this.data.status == 3){//普通商品
      price = this.data.data.stockList[this.data.cur].stockPrice
    }
    this.setData({
      number: this.data.number +num,
      price: price,
      total: price * number
    })
  },
  closeMask:function(){
    this.setData({
      flag:false,
      showBuy:false
    })
  },
  //跳转到立即购买
  tobuy: function (e) {
    if (e.currentTarget.id == 'buyNow' || e.currentTarget.id == 'buy' || e.currentTarget.id == 'groupBuy' || e.currentTarget.id == 'choseStock') {//单独购买，发起拼单，立即购买
      this.setData({
        buy: 'buyNow'
      })
      if (e.currentTarget.id == 'groupBuy' ){//发起拼单
        this.setData({
          spellingType:0
        })
      } else if (e.currentTarget.id =='buy'){//单独购买
        this.setData({
          spellingType: 3
        })
      }
    } else if (e.currentTarget.id == 'addCart') {//加入购物车
      this.setData({
        buy: 'addCart'
      })
    }
    let secondKillInfo = this.data.data.secondKillInfo,
        scShopGoodsStockList = this.data.data.scShopGoodsStockList,
        stockList = this.data.data.stockList;
    if (this.data.status == 1){//拼团
      if (e.currentTarget.id == 'buy') {//单独购买
        this.setData({
          total: scShopGoodsStockList[0].stockPrice,
          price: scShopGoodsStockList[0].stockPrice,
          buyType: 'solo'
        }) 
      }else{//发起拼单
        this.setData({ 
          total: scShopGoodsStockList[0].stockBatchPrice,
          price: scShopGoodsStockList[0].stockBatchPrice,
          buyType:'group'
        })
      }  
      this.setData({
        balance: scShopGoodsStockList[0].stockNum
      }) 
    } else if (this.data.status == 2){//秒杀
      this.setData({
        total: secondKillInfo[0].goodsPreferentialStockPrice,
        balance: secondKillInfo[0].stockBalance,
        price: secondKillInfo[0].goodsPreferentialStockPrice
      })
      if (secondKillInfo.length<=1){//无其他规格
        this.buyNow()
        return
      }
    }else{//普通商品
      this.setData({
        total: stockList[0].stockPrice,
        balance: stockList[0].balance,
        price: stockList[0].stockPrice
      })
    }
    this.setData({
      showBuy: true,
      flag: true
    })
  },
  chose: function (e) {
    this.setData({
      cur: e.currentTarget.dataset.index,
    })
    let data = this.data.data;
    if(this.data.status==1){//拼团
    let buyType=this.data.buyType;
    if(buyType=='solo'){//单独购买
      this.setData({
        total: data.scShopGoodsStockList[this.data.cur].stockPrice,
        price: data.scShopGoodsStockList[this.data.cur].stockPrice,
      })
    }else{//发起拼单
      this.setData({
        total: data.scShopGoodsStockList[this.data.cur].stockBatchPrice,
        price: data.scShopGoodsStockList[this.data.cur].stockBatchPrice,
      })
    }
      this.setData({
        balance: data.scShopGoodsStockList[this.data.cur].stockNum,
        number: 1
      }) 
    }else if(this.data.status==2){//秒杀
      this.setData({
        total: data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice,
        balance: data.secondKillInfo[this.data.cur].stockBalance,
        price: data.secondKillInfo[this.data.cur].goodsPreferentialStockPrice,
        number: 1
      })
    }else if(this.data.status==3){//普通商品购买
      this.setData({
        total: data.stockList[this.data.cur].stockPrice,
        balance: data.stockList[this.data.cur].balance,
        price: data.stockList[this.data.cur].stockPrice,
        number: 1
      })
    }
  },
  buyNow:function(){//立即购买
    var status=this.data.status,
        data=this.data.data,
        cur=this.data.cur,
        spellingType = this.data.spellingType,
        url='',
        info=[{
          'id': 0,
          'goodsName': data.goodsName,
          'goodsPrice': this.data.price,
          'stockPrice': this.data.price,
          'goodsImageUrl': data.pictureUrl,
          'number': this.data.number,
          'goodsType': data.goodsType,
          'goodsIndex': 0,
          'remake': data.descTitle,
          'deliveryCalcContent': data.deliveryCalcContent,
          'actualPayment': this.data.price, //实付单价
          'goodsPic': data.pictureUrl,
          'unitPrice': this.data.price //单价
        }]
    if(status==1){//拼团
      let urls = '../secKillBuy/secKillBuy?realMoney=' + this.data.total + '&goodsId=' + data.scShopGoodsStockList[0].goodsId + '&goodsPrice=' + this.data.price + '&goodsType=' + data.goodsType + '&remake=' + data.descTitle + '&stockId=' + data.scShopGoodsStockList[cur].id + '&goodsName=' + data.goodsName + '&stockName=' + data.scShopGoodsStockList[cur].stockName + '&goodsNum=' + this.data.number + '&pictureUrl=' + data.pictureUrl + '&deliveryCalcContent=' + data.deliveryCalcContent + '&isSeckill=' + 0 + '&groupId=' + data.isGroupBuying + '&SmallGroupId=' + data.id;
      if (spellingType==0){
        url = urls +"&spellingType="+0;
      }else{ 
        info[0]['goodsId'] = data.scShopGoodsStockList[0].goodsId
        info[0]['stockId'] = data.scShopGoodsStockList[cur].id,
        info[0]['stockName'] = data.scShopGoodsStockList[cur].stockName,
        info[0]['balance'] = data.scShopGoodsStockList[cur].stockNum
        wx.setStorageSync('info', info);
        url ="../orderBuy/orderBuy?totalMoney="+this.data.total
      }
    }else if(status==2){//秒杀
      url = '../secKillBuy/secKillBuy?realMoney=' + this.data.total + '&goodsId=' + data.id + '&goodsPrice=' + this.data.price + '&secondskillActivityId=' + data.secondKillInfo[cur].id + '&goodsType=' + data.goodsType + '&remake=' + data.descTitle + '&stockId=' + data.secondKillInfo[cur].goodsStockId + '&goodsName=' + data.goodsName + '&stockName=' + data.secondKillInfo[cur].stockName + '&goodsNum=' + this.data.number + '&pictureUrl=' + data.pictureUrl + '&deliveryCalcContent=' + data.deliveryCalcContent  + '&isSeckill=' + 1
    }else{//普通
      info[0]['goodsId'] = data.stockList[0].goodsId,
      info[0]['stockId'] = data.stockList[cur].id,
      info[0]['stockName'] = data.stockList[cur].stockName,
      info[0]['balance'] = data.stockList[cur].stockNum
      wx.setStorageSync('info', info);
      url = "../orderBuy/orderBuy?totalMoney=" + this.data.total
    }
    console.log(url)
    wx.navigateTo({
      url: url,
    })
  },
  addCart:function(){//加入购物车
    let data={
      goodsId: this.data.data.secondKillInfo[0].goodsId,
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id,
      stockId: this.data.data.secondKillInfo[this.data.cur].goodsStockId,
      number: this.data.number
    }
    app.util.reqAsync('shop/updateNewShopCartV2',data).then((res) => {
      console.log(res)
      // wx.showToast({
      //   title: res.msg,
      //   icon:'none'
      // })
    })
  }
})