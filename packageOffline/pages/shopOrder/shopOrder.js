import util from '../../../utils/util.js';
var app = getApp();
// var userId = ;
Page({
  data: {
    activeIndex: "0",
    orderList: [],
    total: "",
    flagOrder: true,
    shopId: '',
    shopName:'',
    shopLogoUrl:'',
    facilityId: "",
    time: 0, //进行中
    times: 0, //已完成
    listData: {
      page:1,
      rows:10,
      userId:'',
      memberId:'',
      merchantId:'',
      orderStatus:1,
      shopId:''
    },
    isHid: true
  },
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser');
    var shop = wx.getStorageSync('shop');
    var userId = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;

    this.setData({
      shopId: shopId,
      facilityId: wx.getStorageSync('facilityId'),
      shopName: shop.shopName,
      shopLogoUrl:shop.logoUrl,
      listData:{
        page: 1,
        rows: 10,
        userId: userId,
        memberId: '',
        merchantId: shop.merchantId,
        orderStatus: 1,
        shopId: shopId
      }
    });
    this.getList();
  },
  onPullDownRefresh: function () {
    
  },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.listData.rows);
    if (this.data.listData.page <= newpage) {
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
    app.util.reqAsync('foodBoot/findFoodPresaleList', this.data.listData).then((res) => {
      wx.hideLoading();
      var orderListOld = this.data.orderList;

      var data = res.data.data;
 
        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j<data[i].presaleInfoList.length;j++){
            data[i].presaleInfoList[j].actualPayment = (data[i].presaleInfoList[j].actualPayment).toFixed(2)
         }
          orderListOld.push(data[i]); 
        }

      console.log(orderListOld)
      if (orderListOld.length > 0) {
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

      var desc = ++this.data.listData.page;
      var page = "listData.page";
      this.setData({
        orderList: orderListOld,
        total: res.data.total,
        [page]: desc
      });
      console.log(this.data.orderList)
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
      if (this.data.time == 0) {
        this.setData({
          time: 1
        })
        var desc = "listData.orderStatus";
        var page = "listData.page";
        this.data.orderList.length = 0;
        this.setData({
          activeIndex: this.data.activeIndex,
          [desc]: 1,
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
          time: 0
        })
      }, 5000)

    } else {
      this.data.activeIndex = 1;
      if (this.data.times == 0) {
        this.setData({
          times: 1
        })
        var desc = "listData.orderStatus";
        var page = "listData.page";
        this.data.orderList.length = 0;
        this.setData({
          activeIndex: this.data.activeIndex,
          [desc]: 3,
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
  goOn: function (e) { //继续添加
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
  }
})