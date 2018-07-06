//获取应用实例
const app = getApp();

Page({
  data: {
    array: ['快递配送', '店内下单','自提'],
    isShop:0,//0开通店内下单 1未开通
    isService:0, //0只有商品没有服务 1有服务
    isSend:0,//0-快递  1-店内下单 2-自提
    shopName:'',
    shopId:'',
    totalMoney:0, //合计
    roomInx:'-1',
    objectArray: [
      {
        id: 0,
        name: '快递配送'
      },
      {
        id: 1,
        name: '店内下单'
      },
      {
        id: 2,
        name: '自提'
      }
    ],
    index: 0,
    total:1,
    flag:true,
    flagOrder:true,
    room:[],
    userInfo:[],
    goods: []
  },
  onLoad: function (options) {
    //是否可以店内下单并获得房间或者桌号
    app.util.reqAsync('shop/getShopTableNos', {
      shopId: options.shopId
    }).then((res) => {
      //获取商品
      var goods = wx.getStorageSync('cart');
      var isSer = 0;
      for (var ins in goods) {
        if (goods[ins].goodsType != 0) {  //（0-普通商品；1-服务；2-服务卡；3-服务套餐;6-套盒）
          isSer = 1;
        }
      }
      if (res.data.code == 9) {   //未开通店内下单
        if (isSer == 0) { //普通商品
          this.setData({
            array: ['快递配送', '自提'],
            isShop: 1,//0开通店内下单 1未开通
            isService: 0, //0只有商品没有服务 1有服务
            objectArray: [
              {
                id: 0,
                name: '快递配送'
              },
              {
                id: 2,
                name: '自提'
              }
            ]
          })
        } else {
          this.setData({
            isSend: 2,//0-快递  1-店内下单 2-自提
            array: ['自提'],
            isShop: 1,//0开通店内下单 1未开通
            isService: 1, //0只有商品没有服务 1有服务
            index: 0,
            objectArray: [
              {
                id: 2,
                name: '自提'
              }
            ]
          })
        }
      } else { //开通店内下单
        this.setData({
          room:res.data.data
        })
        if (isSer == 0) { //普通商品
          this.setData({
            array: ['快递配送', '店内下单', '自提'],
            isShop: 0,//0开通店内下单 1未开通
            isService: 0, //0只有商品没有服务 1有服务
            objectArray: [
              {
                id: 0,
                name: '快递配送'
              },
              {
                id: 1,
                name: '店内下单'
              },
              {
                id: 2,
                name: '自提'
              }
            ]
          })
        } else {
          this.setData({
            isSend: 1,//0-快递  1-店内下单 2-自提
            array: ['店内下单', '自提'],
            isShop: 0,//0开通店内下单 1未开通
            isService: 1, //0只有商品没有服务 1有服务
            index: 0,
            objectArray: [
              {
                id: 1,
                name: '店内下单'
              },
              {
                id: 2,
                name: '自提'
              }
            ]
          })
        }
      }
      this.setData({
        goods: goods,
        total: goods.length,
        isService: isSer,
        shopName: options.shopName,
        totalMoney: options.totalMoney,
        shopId: options.shopId
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })

    //获取地址
    app.util.reqAsync('shop/getMyAddressAndCoupon', {
      customerId: options.customerId,
      shopId: options.shopId
    }).then((res) => {
      this.setData({
        userInfo: res.data.data,
        shopName: options.shopName
      })
    })
  },
  bindPickerChange: function (e) {
    var val = e.target.dataset.val,
    inx = e.detail.value;
    if (val[inx]=="快递配送"){
      //选择购买方式
      this.setData({
        index: e.detail.value,
        isSend: 0
      })
    } else if (val[inx] == "店内下单"){
      this.setData({
        index: e.detail.value,
        isSend: 1
      })
    }else{
      this.setData({
        index: e.detail.value,
        isSend: 2
      })
    }
  },
  bindMinus: function (e) {   
    //减数量
    var index = parseInt(e.target.dataset.index), //当前index
      num = this.data.goods[index].number; //数量
    if (num > 1) {
      num--;
    }
    this.data.goods[index].number = num;
    this.sum();//合计

    // 将数值与状态写回
    this.setData({
      goods: this.data.goods,
      totalMoney: this.data.totalMoney
    });
  },
  bindPlus: function (e) {
    //加数量
    var index = parseInt(e.target.dataset.index), //当前index
      num = this.data.goods[index].number; //数量
    num++;
    this.data.goods[index].number = num;
    this.sum();//合计

    // 将数值与状态写回
    this.setData({
      goods: this.data.goods,
      totalMoney: this.data.totalMoney
    });
  },
  sum: function () {
    this.data.totalMoney = 0;
    //合计
    for (var i = 0; i < this.data.goods.length; i++) {
      this.data.totalMoney = this.data.totalMoney + (parseInt(this.data.goods[i].goodsPrice) * parseInt(this.data.goods[i].number));  
    };
    this.setData({
      goods: this.data.goods,
      totalMoney: this.data.totalMoney
    });
  },
  show: function () {
    //弹出窗显示房间 
    this.setData({
      flag: false,
    })
  },
  //消失房间
  hide: function () {
    this.setData({ flag: true })
  },
  selectRoom: function(e){
    //选中房间
    this.setData({ 
      roomInx: e.target.dataset.index,
      roomVal: e.target.dataset.val,
      flag: true
     })
  },
  default: function(e){
  //确认下单
  
  }

})