//shopping-cart.js
//获取应用实例
const app = getApp();

Page({
  data: {
    delBtnWidth: 180,//删除按钮宽度单位（rpx）
    isAllSelect: false,
    totalMoney: 0,
    shopk: 0,//k表示有店铺多少被勾选了
    goodlist:[]
  },
  onLoad: function () {
    //调接口
    app.util.reqAsync('shop/shopCartList', {
      customerId: 198
    }).then((res) => {
    //  var shopId = wx.getStorage("shopId") || 808;
      var shopId = 288;
      var data=[];
      for(var inx in res.data.data){
        res.data.data[inx].checked = false;
        if (shopId == res.data.data[inx].shopId){
          data.push(res.data.data[inx]);
        }
      }
      for(var ins in data){
        data[0].goodsList[ins].checked = false;
        data[0].goodsList[ins].txtStyle = "";       
      } 

      this.setData({
        goodlist: data,
      })
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
    this.initEleWidth();

  },
  shopSelect: function (e) {
    var id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index),
      shopList = this.data.goodlist[index].goodsList;
    this.data.goodlist[index].checked = !this.data.goodlist[index].checked;
    if (this.data.shopk == this.data.goodlist.length - 1) {
      this.data.isAllSelect = true; //全选按钮
    }
    //店铺全选反选
    if (this.data.goodlist[index].checked) {
      for (var i = 0; i < shopList.length; i++) {
        shopList[i].checked = true;
      }
      this.data.shopk++;
    } else {
      for (var i = 0; i < shopList.length; i++) {
        shopList[i].checked = false;
        this.data.isAllSelect = false; //全选按钮
      }
      this.data.shopk--;
    }
    this.sum();//合计
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney,
      isAllSelect: this.data.isAllSelect,
      shopk: this.data.shopk
    })
  },
  switchSelect: function (e) {
    //单个勾选取消
    var id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index), //当前index
      pinx = parseInt(e.target.dataset.pindex), //父级index
      shopList = this.data.goodlist[pinx],
      k = 0;//标记多少个店铺全选
    shopList.goodsList[index].checked = !shopList.goodsList[index].checked;
    if (shopList.goodsList[index].checked) { //勾选
      for (var b = 0; b < shopList.goodsList.length; b++) {
        if (shopList.goodsList[b].checked) {
          k++;
        }
      }
      if (k == shopList.goodsList.length) {
        shopList.checked = true;
        this.data.shopk++;
      }
      //全选是否生效
      if (this.data.shopk == this.data.goodlist.length) {
        this.data.isAllSelect = true; //全选按钮
      }
    } else {
      shopList.goodsList[index].checked = false;
      shopList.checked = false;
      this.data.isAllSelect = false;
    }
    this.sum();//合计
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney,
      isAllSelect: this.data.isAllSelect,
      shopk: this.data.shopk
    })
  },
  allSelect: function () {
    //最低端全选反选
    this.data.isAllSelect = !this.data.isAllSelect;
    for (var i = 0; i < this.data.goodlist.length; i++) {
      this.data.goodlist[i].checked = this.data.isAllSelect;
      for (var k = 0; k < this.data.goodlist[i].goodsList.length; k++) {
        this.data.goodlist[i].goodsList[k].checked = this.data.isAllSelect;
      }
    }
    if (this.data.isAllSelect) {
      this.data.shopk = this.data.goodlist.length;
    } else {
      this.data.shopk = 0;
    }
    this.sum();//合计
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney,
      isAllSelect: this.data.isAllSelect,
      shopk: this.data.shopk
    })
  },
  bindMinus: function (e) {
    //减数量
    var id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index), //当前index
      pinx = parseInt(e.target.dataset.pindex), //父级index
      num = this.data.goodlist[pinx].goodsList[index].number, //数量
      isCheck = this.data.goodlist[pinx].goodsList[index].checked; //是否勾选
    if (num > 1) {
      num--;
    }
    this.data.goodlist[pinx].goodsList[index].number = num;
    if (isCheck) {      //若选中，合计计算
      this.sum();//合计
    };

    // 将数值与状态写回
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney
    });
  },
  bindPlus: function (e) {
    //加数量
    var id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index), //当前index
      pinx = parseInt(e.target.dataset.pindex), //父级index
      num = this.data.goodlist[pinx].goodsList[index].number, //数量
      isCheck = this.data.goodlist[pinx].goodsList[index].checked; //是否勾选
    num++;
    this.data.goodlist[pinx].goodsList[index].number = num;
    if (isCheck) {      //若选中，合计计算
      this.sum();//合计
    };

    // 将数值与状态写回
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney
    });
  },
  sum: function () {
    this.data.totalMoney = 0;
    //合计
    for (var i = 0; i < this.data.goodlist.length; i++) {
      for (var k = 0; k < this.data.goodlist[i].goodsList.length; k++) {
        if (this.data.goodlist[i].goodsList[k].checked) { //合计
          this.data.totalMoney = this.data.totalMoney + (parseInt(this.data.goodlist[i].goodsList[k].goodsPrice) * parseInt(this.data.goodlist[i].goodsList[k].number));
        }
      }
    };
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney
    });
  },
  touchS: function (e) {
    //手指滑动动作开始
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX  //clientX距离页面可显示区域x轴
      })
    }
  },
  touchM: function (e) {
    //移动中
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = '';
      if (disX == 0 || disX < 0) { //若移动距离小于等于0，文本层位置不变
        txtStyle = 'left:0';
      } else if (disX > 0) {
        //控制手指移动距离最大值为删除按钮的宽度
        txtStyle = 'left:-' + disX + 'px';
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "left:-" + delBtnWidth + "px";
        }
      }
    }
    //获取手指触摸的是哪一项
    var index = parseInt(e.currentTarget.dataset.index), //当前index
      pinx = parseInt(e.currentTarget.dataset.pindex), //父级index
      shopList = this.data.goodlist[pinx];
    shopList.goodsList[index].txtStyle = txtStyle;
    //更新列表状态
    this.setData({
      goodlist: this.data.goodlist
    })
  },
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //若距离小于删除按钮的1/2,不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? 'left:-' + delBtnWidth + 'px' : 'left:0';
      //获取手指触摸的是哪一项
      var index = parseInt(e.currentTarget.dataset.index), //当前index
        pinx = parseInt(e.currentTarget.dataset.pindex), //父级index
        shopList = this.data.goodlist[pinx];
      shopList.goodsList[index].txtStyle = txtStyle;
      //更新列表状态
      this.setData({
        goodlist: this.data.goodlist
      })
    }
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);//以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  remove: function (e) {
    //单个删除
    var id = e.currentTarget.dataset.id,
      goodsId = e.currentTarget.dataset.goodsid,//商品ID
      stockId = e.currentTarget.dataset.stockid || "",//规格ID
      shopId = e.currentTarget.dataset.shopid,//店铺ID
      index = parseInt(e.currentTarget.dataset.index), //当前index
      pinx = parseInt(e.currentTarget.dataset.pindex),
      customerId = e.currentTarget.dataset.customerId;
      //根据会员ID和商品ID删除购物车中的一款产品
      app.util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
        customerId: customerId,
        goodsId: goodsId,
        stockId: stockId,
        shopId: shopId
      }).then((res) => {
        this.data.goodlist[pinx].goodsList.splice(index, 1); // 删除购物车列表里这个商品
        this.setData({
          goodlist: this.data.goodlist,
        });
        this.sum();//合计
      }).catch((err) => {
        wx.showToast({
          title: '失败……',
          icon: 'none'
        })
      }) 
  },
  allDel: function(e){
    //批量删除
    var shopCarts = [],
     indexArr = [],
      data = this.data.goodlist;//商品数据
     for (var inx in data ){
       for (var list in data[inx].goodsList){
         console.log(data[inx].goodsList[list].checked)
         if (data[inx].goodsList[list].checked){
           var stockId = data[inx].goodsList[list].stockId || "";
           shopCarts.push({
             'customerId': data[inx].goodsList[list].customerId,
             'shopId': data[inx].shopId,
             'goodsId': data[inx].goodsList[list].goodsId,
             'stockId': stockId
           });
           indexArr.push(list);
        }
      }
     }
     indexArr.sort(function (x, y) {
       return y-x;
     })
     
     if (shopCarts.length>0){
       app.util.reqAsync('shop/delNewShopCartGoods', {
         shopCarts: shopCarts
       }).then((res) => {
         for (var n in indexArr) {
           this.data.goodlist[0].goodsList.splice(indexArr[n], 1);
         }
         this.setData({
           goodlist: this.data.goodlist
         });
         this.sum();//合计
       }).catch((err) => {
         wx.showToast({
           title: '失败……',
           icon: 'none'
         })
       }) 
     }else{
       wx.showToast({
         title: '请选中商品', //数据返回提示，查看后台PHP
         icon: 'none',
         duration: 2000,
         mask:true
       })
     }
  },
  default: function(e){
    //结算
    var selectGoods = [];
    for (var n in this.data.goodlist[0].goodsList){
      if (this.data.goodlist[0].goodsList[n].checked){
        
        selectGoods.push({
          'id': this.data.goodlist[0].goodsList[n].id,
          'customerId': this.data.goodlist[0].goodsList[n].customerId,
          'shopId': this.data.goodlist[0].shopId,
          'goodsId': this.data.goodlist[0].goodsList[n].goodsId,
          'stockId': this.data.goodlist[0].goodsList[n].stockId,
          'goodsName': this.data.goodlist[0].goodsList[n].goodsName,
          'goodsPrice': this.data.goodlist[0].goodsList[n].goodsPrice,
          'goodsImageUrl': this.data.goodlist[0].goodsList[n].goodsImageUrl,
          'stockName': this.data.goodlist[0].goodsList[n].stockName,
          'number': this.data.goodlist[0].goodsList[n].number,
          'goodsType': this.data.goodlist[0].goodsList[n].goodsType,
        })
      }
    }

    if (selectGoods.length>0){
      wx.setStorageSync('cart', selectGoods);
      wx.navigateTo({
        url: '../orderBuy/orderBuy?shopId=' + this.data.goodlist[0].shopId + '&shopName='+
        this.data.goodlist[0].shopName + '&customerId=' + this.data.goodlist[0].goodsList[0].customerId + '&totalMoney=' + this.data.totalMoney
      })
    }else{
      wx.showToast({
        title: '请选中商品', //数据返回提示，查看后台PHP
        icon: 'none',
        duration: 2000,
        mask: true
      })
    }
    
  }
})