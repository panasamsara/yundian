import util from '../../utils/util.js';
//shopping-cart.js
//获取应用实例

const app = getApp();


Page({
  data: { 
    delBtnWidth: 180,//删除按钮宽度单位（rpx）
    isAllSelect: false,
    totalMoney: 0,
    shopk: 0,//k表示有店铺多少被勾选了
    goodlist:[],
    customerId:'',
    shopid:"", 
    isEdit:0 //0未编辑 1正在编辑
  },
  onLoad: function () {
    var shop = wx.getStorageSync('shop');
    var user = wx.getStorageSync('user');
    var userid = wx.getStorageSync('scSysUser').id;
    var shopid = wx.getStorageSync('shop').id;
    //this.getData();
    this.setData({
      customerId: userid,
      shopid: shopid
    })
    this.initEleWidth();
  },
  onShow:function(e){
    console.log("进入购物车onshow")
    this.getData();
    this.setData({
    //  goodlist: this.data.goodlist,
      isAllSelect: false,
      totalMoney: 0,
      isEdit: 0
    })
  },
  getData:function(e){
    //调接口
    app.util.reqAsync('shop/shopCartList', {
      customerId: this.data.customerId //用户主键
    }).then((res) => {
      var shopId = this.data.shopid;
      var data = [];
      var da=res.data.data || [];
      if (da.length > 0) {
        for (var inx in res.data.data) {
          res.data.data[inx].checked = false;
          if (shopId == res.data.data[inx].shopId) {
            data.push(res.data.data[inx]);
          }
        }
        if (data.length>0){
          for (var ins in data[0].goodsList) {
            data[0].goodsList[ins].checked = false;
            data[0].goodsList[ins].txtStyle = "";
          }
        }
        

        this.setData({
          goodlist: data,
          customerId: this.data.customerId
        })
      }else{
        this.setData({
          goodlist: da,
          customerId: this.data.customerId
        })
      }
    })
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
    this.setData({
      goodlist: this.data.goodlist,
      isAllSelect: this.data.isAllSelect,
      shopk: this.data.shopk
    })
    this.sum();//合计
    
  },
  switchSelect: function (e) {
   
    //单个勾选取消
    var id = e.currentTarget.dataset.id,
      index = parseInt(e.currentTarget.dataset.index), //当前index
      pinx = parseInt(e.currentTarget.dataset.pindex), //父级index
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
      if (this.data.shopk==0){
        this.data.shopk =0;
      }else{
        this.data.shopk--;
      }
      
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
      isCheck = this.data.goodlist[pinx].goodsList[index].checked, //是否勾选
      goodsId = e.currentTarget.dataset.goodid,
      stockId = e.currentTarget.dataset.stockid;
      if(num==1){
        return false;
      }
    if (num > 1) {
      num--;
    }

    this.data.goodlist[pinx].goodsList[index].number = num;
   
    this.updateCart(goodsId, num, stockId);//调保存到购物车接口
    if (isCheck) {      //若选中，合计计算
      this.sum();//合计
    };

    // 将数值与状态写回
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney
    });
  },
  bindblur:function(e){
    //填写数量   
    var isInt = /^[1-9]+\d*$/;
    var stockban = e.currentTarget.dataset.stockban;//库存
   
    if (e.detail.value) {
      if (isInt.exec(e.detail.value)) {
        var val = e.detail.value;
        var index = parseInt(e.target.dataset.index), //当前index
          pinx = parseInt(e.target.dataset.pindex); //父级index
        if (e.detail.value > stockban) {//大于库存
          wx.showToast({
            title: '已达到库存上限，无法添加',
            icon: 'none'
          })
          this.data.goodlist[pinx].goodsList[index].number = this.data.goodlist[pinx].goodsList[index].number;
          this.setData({
            goodlist: this.data.goodlist
          });
          return false;
        }else{
          this.data.goodlist[pinx].goodsList[index].number = val;
          this.setData({
            goodlist: this.data.goodlist
          });

        }

       
        this.sum();//合计
      } else {
        var index = parseInt(e.target.dataset.index), //当前index
          pinx = parseInt(e.target.dataset.pindex); //父级index
        wx.showToast({
          title: '请输入正确的数量',
          icon: 'none'
        })
        this.data.goodlist[pinx].goodsList[index].number = this.data.goodlist[pinx].goodsList[index].number;
        this.setData({
          goodlist: this.data.goodlist
        });
      }
    } else {
      var val = e.detail.value;
      wx.showToast({
        title: '请输入正确的数量',
        icon: 'none'
      })
    }
  },
  bindPlus: function (e) {
   
    //加数量
    var id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index), //当前index
      pinx = parseInt(e.target.dataset.pindex), //父级index
      num = this.data.goodlist[pinx].goodsList[index].number, //数量
      isCheck = this.data.goodlist[pinx].goodsList[index].checked, //是否勾选
      stockBalance = e.currentTarget.dataset.stockban,//库存
      goodsId = e.currentTarget.dataset.goodid,
      stockId = e.currentTarget.dataset.stockid;
  
    if (num >= stockBalance){
      wx.showToast({
        title: '已达到库存上限，不能再添加',
        icon: 'none'
      })
      return false;
    }
    num++;
    this.data.goodlist[pinx].goodsList[index].number = num;
    this.updateCart(goodsId, num, stockId);//调保存到购物车接口
    if (isCheck) {      //若选中，合计计算
      this.sum();//合计
    };

    // 将数值与状态写回
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: this.data.totalMoney
    });
  },
  updateCart: function (goodsId, numbe, stockId){ //加减之后要更新购物车
    
    app.util.reqAsync('shop/updateNewShopCartV2', {
      customerId: this.data.customerId,
      goodsId: goodsId,
      number: numbe,
      stockId: stockId,
      shopId: this.data.shopid
    }).then((res) => { 
      console.log('购物车更新成功')
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    }) 
  },
  sum: function () {
    this.data.totalMoney = 0;
    //合计
    for (var i = 0; i < this.data.goodlist.length; i++) {
      for (var k = 0; k < this.data.goodlist[i].goodsList.length; k++) {
        if (this.data.goodlist[i].goodsList[k].checked) { //合计
          if (this.data.goodlist[i].goodsList[k].stockName!=""){
            this.data.totalMoney = this.data.totalMoney + (Number(this.data.goodlist[i].goodsList[k].stockPrice) * parseInt(this.data.goodlist[i].goodsList[k].number));
            
        }else{
            this.data.totalMoney = this.data.totalMoney + (Number(this.data.goodlist[i].goodsList[k].goodsPrice) * parseInt(this.data.goodlist[i].goodsList[k].number));
            
        }
        }
      }
    };
    this.setData({
      goodlist: this.data.goodlist,
      totalMoney: (this.data.totalMoney).toFixed(2)
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
      customerId =this.data.customerId;
      //根据会员ID和商品ID删除购物车中的一款产品
      app.util.reqAsync('shop/delShopCartGoodsByUidAndGid', {
        customerId: customerId,
        goodsId: goodsId,
        stockId: stockId,
        shopId: shopId
      }).then((res) => {
        this.data.goodlist[pinx].goodsList.splice(index, 1); // 删除购物车列表里这个商品
        if (this.data.goodlist[pinx].goodsList.length>0){
          this.setData({
            goodlist: this.data.goodlist,
          });
        }else{
          this.setData({
            goodlist: [],
            isAllSelect: false
          });
        }
        
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
         if (this.data.goodlist[0].goodsList.length>0){
           this.setData({
             goodlist: this.data.goodlist
           });
           this.sum();//合计
         }else{
           this.setData({
             goodlist: [],
             isAllSelect:false,
             totalMoney:0
           });
         }
         
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
    if (this.data.goodlist.length>0){
      this.setData({
        goodlist: this.data.goodlist
      });
      if (this.data.customerId) {
        //结算
        var selectGoods = [];
        var orderbuy = [];//下单使用
        for (var n in this.data.goodlist[0].goodsList) {
          if (this.data.goodlist[0].goodsList[n].checked) {
            if (this.data.goodlist[0].goodsList[n].stockPrice){
              var actupay = this.data.goodlist[0].goodsList[n].stockPrice
            }else{
              var actupay = this.data.goodlist[0].goodsList[n].goodsPrice
            }
            selectGoods.push({
              'id': this.data.goodlist[0].goodsList[n].id,
              'customerId': this.data.goodlist[0].goodsList[n].customerId,
              'shopId': this.data.goodlist[0].shopId,
              'goodsId': this.data.goodlist[0].goodsList[n].goodsId,
              'stockId': this.data.goodlist[0].goodsList[n].stockId,
              'goodsName': this.data.goodlist[0].goodsList[n].goodsName,
              'goodsPrice': this.data.goodlist[0].goodsList[n].goodsPrice,
              'stockPrice': this.data.goodlist[0].goodsList[n].stockPrice,
              'goodsImageUrl': this.data.goodlist[0].goodsList[n].goodsImageUrl,
              'stockName': this.data.goodlist[0].goodsList[n].stockName,
              'number': this.data.goodlist[0].goodsList[n].number,
              'goodsType': this.data.goodlist[0].goodsList[n].goodsType,
              'balance': '',
              'goodsIndex': n,
              'remake': this.data.goodlist[0].goodsList[n].stockName,
              'deliveryCalcContent': this.data.goodlist[0].goodsList[n].deliveryCalcContent,
              'actualPayment': actupay, //实付单价
              'goodsPic': this.data.goodlist[0].goodsList[n].goodsImageUrl,
              'unitPrice': actupay//单价
            });
  
          }
        }

        if (selectGoods.length > 0) {
          wx.setStorageSync('cart', selectGoods);
          wx.navigateTo({
            url: '../orderBuy/orderBuy?shopId=' + this.data.goodlist[0].shopId + '&shopName=' +
            this.data.goodlist[0].shopName + '&customerId=' + this.data.goodlist[0].goodsList[0].customerId + '&totalMoney=' + this.data.totalMoney
          })

          wx.setStorageSync('updataCart',"");
          this.data.goodlist[0].checked = false;
          for (var a in this.data.goodlist[0].goodsList) {
            this.data.goodlist[0].goodsList[n].checked=false;
          }
          
        } else {
          wx.showToast({
            title: '请选中商品', //数据返回提示，查看后台PHP
            icon: 'none',
            duration: 2000,
            mask: true
          })
        }

      } else {
        wx.showToast({
          title: '请先登录', //数据返回提示，查看后台PHP
          icon: 'none',
          duration: 2000,
          mask: true
        })
      } 
    }else{
      wx.showToast({
        title: '请先添加商品', //数据返回提示，查看后台PHP
        icon: 'none',
        duration: 2000,
        mask: true
      })
    }
    
  },
  // goodsSkip :function(e){
  //   //跳到商品
  //   var shopId = e.currentTarget.dataset.shopid,
  //     goodsId = e.currentTarget.dataset.goodsid;
  //   wx.navigateTo({
  //     url: '../goodsDetial/goodsDetial?shopId=' + shopId + '&goodsId=' + goodsId
  //   })
  // },
  shopSkip : function(e){
    var shopId = e.currentTarget.dataset.shopid;
    var currUserId = this.data.customerId;//用户id
    //跳到店铺
    wx.navigateTo({
      url: '../store/store?shopId=' + shopId + '&currUserId=' + currUserId
    })
  },
  edits:function(e){ //编辑
    this.setData({
      isEdit:1
    })
  },
  over:function(e){ //完成
    this.setData({
      isEdit: 0
    })
  }
})