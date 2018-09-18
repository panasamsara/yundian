import util from '../../../utils/util.js';
var app = getApp();
// var userId = ;
Page({
  data: {
    activeIndex: "0",
    orderList: [],
    total: "",
    flagOrder:true,
    shopId:'',
    facilityId: "",
    time:0, //进行中
    times:0, //已完成
    listData: {
      deliverStatus: 0,
      pageSize: 10,
      userId: "",
      pageNo: 1,
      shopId:""
    },
    isHid:true,
    isOffline:0 //0-非餐饮 1-餐饮
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;
    var newId ="listData.userId";
    var shopIds = "listData.shopId";
    this.setData({
      shopId: shopId,
      [newId]: userId,
      [shopIds]: shopId,
      facilityId: wx.getStorageSync('facilityId')
    });
    this.getList();
  },
  onPullDownRefresh: function () {
    // //票判断不为0,点击tab为空的时候不可以下拉;
    // if (this.data.orderList.length != 0) {
    //   wx.showLoading({
    //     title: '加载中',
    //   });
    //   // 下拉每次清空数组
    //   this.data.orderList.length = 0;
    //   var newpage = Math.ceil(this.data.total / this.data.listData.pageSize);
    //   if (this.data.listData.pageNo <= newpage) {
    //     this.getList();
    //   } else {
    //     wx.showToast({
    //       title: '到底了哦',
    //       icon: "none"
    //     })
    //   }
    //   wx.stopPullDownRefresh();
    // }
  },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.listData.pageSize);
    if (this.data.listData.pageNo <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.getList();
    } else {
      wx.showToast({
        title: '到底了哦',
        icon: "none"
      })
    }
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getShopOrderListNew', this.data.listData).then((res) => {
      wx.hideLoading();
      var orderListOld = this.data.orderList;
      
      var data = res.data.data;
 
      
      console.log(this.data.facilityId)
      // 格式化金额
      if (this.data.facilityId == undefined || this.data.facilityId == "undefined" || this.data.facilityId ==""){

        // for (var i = 0; i < data.length; i++) {
        //   if (data[i].shopId == this.data.shopId) {
            
        //       data[i].shouldPay = app.util.formatMoney(data[i].shouldPay, 2);
        //       for (var j = 0; j < data[i].shopOrderInfo.length; j++) {
        //         data[i].shopOrderInfo[j].goodsPrice = app.util.formatMoney(data[i].shopOrderInfo[j].goodsPrice, 2);
        //       }
        //       orderListOld.push(data[i]);

        //   } 
        // }
        orderListOld=[];
        this.setData({
          isOffline:0
        })
      }else{
        console.log("进入对应作为")
        this.setData({
          isOffline: 1
        })
        for (var i = 0; i < data.length; i++) {
          if (data[i].shopId == this.data.shopId) {
            if (data[i].facilityId == this.data.facilityId) {
              data[i].shouldPay = app.util.formatMoney(data[i].shouldPay, 2);
              for (var j = 0; j < data[i].shopOrderInfo.length; j++) {
                data[i].shopOrderInfo[j].goodsPrice = app.util.formatMoney(data[i].shopOrderInfo[j].goodsPrice, 2);
              }
              orderListOld.push(data[i]);
              
            }
          }
      }
      
        
        
      }
      console.log(orderListOld)
      if (orderListOld.length>0){
        if (orderListOld[0].payStatus != 5) {
          this.setData({
            isHid: false
          })
        } else {
          this.setData({
            isHid: true
          })
        }
      }
      
      var desc = ++this.data.listData.pageNo;
      var page = "listData.pageNo";
      this.setData({
        orderList: orderListOld,
        total: res.data.total,
        [page]: desc
      });
      console.log(orderListOld)
      wx.hideLoading();
    }).catch((err) => {
      console.log(err)
      // wx.hideLoading()
    })
  },
  typeTop: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      this.data.activeIndex = 0;
      if (this.data.time==0){
        this.setData({
          time: 1
        })
        var desc = "listData.deliverStatus";
        var page = "listData.pageNo";
        this.data.orderList.length = 0;
        this.setData({
          activeIndex: this.data.activeIndex,
          [desc]: this.data.activeIndex,
          [page]: 1
        });

        this.getList();
      }else{
        wx.showToast({
          title: '点击过于频繁，请稍后重试',
          icon: "none"
        })
      }
      var that = this;
      setTimeout(function(){
        that.setData({
          time: 0
        })
      },5000)
      
    } else {
      this.data.activeIndex = 1;
      if (this.data.times == 0) {
        this.setData({
          times: 1
        })
        var desc = "listData.deliverStatus";
        var page = "listData.pageNo";
        this.data.orderList.length = 0;
        this.setData({
          activeIndex: this.data.activeIndex,
          [desc]: this.data.activeIndex,
          [page]: 1
        });

        this.getList();
      } else {
        wx.showToast({
          title: '点击过于频繁，请稍后重试',
          icon: "none"
        })
      }
      var that = this;
      setTimeout(function () {
        that.setData({
          times: 0
        })
      }, 5000)
    }
    
  },
  skip: function (e) {
    var facilityId = e.currentTarget.dataset.facilityid,
      presaleId = e.currentTarget.dataset.id,
      userId = e.currentTarget.dataset.userid,
      shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: "orderDetail/orderDetail?facilityId=" + facilityId + "&activeIndex=" + this.data.activeIndex + "&presaleId=" + presaleId + "&userId=" + userId + "&shopId=" + shopId + '&selectMember=1'
    });
  },
  againBuy:function(e){ //再来一单
    var facilityId = e.currentTarget.dataset.facilityid,
      presaleId = e.currentTarget.dataset.no,
      userId = e.currentTarget.dataset.userid,
      shopId = e.currentTarget.dataset.shopid;
    console.log("../../../../../../../packageOffline/pages/proList/proList?facilityId=" + facilityId + "&activeIndex=" + this.data.activeIndex + "&presaleId=" + presaleId + "&userId=" + userId + "&shopId=" + shopId)
    wx.navigateTo({
      url: "../../../../../../../packageOffline/pages/proList/proList?facilityId=" + facilityId + "&activeIndex=" + this.data.activeIndex + "&presaleId=" + presaleId + "&userId=" + userId + "&shopId=" + shopId
    });
    wx.switchTab({
      url: "../../../../../../../packageOffline/pages/proList/proList?facilityId=" + facilityId + "&activeIndex=" + this.data.activeIndex + "&presaleId=" + presaleId + "&userId=" + userId + "&shopId=" + shopId
    });
  },
  goOn:function(e){ //继续添加
    wx.navigateTo({
      url: "../../../../../../../packageOffline/pages/proList/proList"
    });
    wx.switchTab({
      url: "../../../../../../../packageOffline/pages/proList/proList"
    });
  },
  buyOrder: function (e) { //结算支付
    var facilityId = e.currentTarget.dataset.facilityid,
      presaleId = e.currentTarget.dataset.no,
      userId = e.currentTarget.dataset.userid,
      shopId = e.currentTarget.dataset.shopid;
    wx.navigateTo({
      url: "orderDetail/orderDetail?facilityId=" + facilityId + "&activeIndex=" + 0 + "&presaleId=" + presaleId + "&userId=" + userId + "&shopId=" + shopId + '&selectMember=1'
    });
  },
  goShop: function (e) {
    //再来一单
    this.setData({
      flagOrder: true
    })
    
    wx.navigateTo({
      url: '../../../../../../../packageOffline/pages/proList/proList'
    });
  },
  look: function (e) {
    //查看详情
    this.setData({
      flagOrder: true
    })
    wx.navigateTo({
      url: 'orderDetail/orderDetail?presaleId=' + this.data.presaleId
    })
  }
})