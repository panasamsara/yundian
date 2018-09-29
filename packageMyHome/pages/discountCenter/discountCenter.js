const app = getApp();
Page({
  data: {
    shopId:"",
    couponType1:[],
    couponType2:[],
    couponType3:[],
    getdiscount:"",
    flag:"",
    loginType:0
  },
  onLoad: function (options) {
    console.log(options)
    var shopId, userId= '';
    shopId = wx.getStorageSync('shopId')
    if (options.shopId){
      shopId = options.shopId
      wx.setStorageSync('shopId', options.shopId)
    } else if (!shopId){
      shopId = wx.getStorageSync('shop').id
      wx.setStorageSync('shopId', options.shopId)
    }
    if (wx.getStorageSync('scSysUser').id){
       userId = wx.getStorageSync('scSysUser').id
    }
    this.setData({ shopId: shopId, userId: userId})
  },
  onReady: function () {
  
  },

  onShow: function () {
    app.util.checkWxLogin('share').then(res=>{
      if (res.id){
        this.setData({ userId: res.id })
        this.newGift();
        this.discount();
      }else{
        // if (wx.getStorageSync('isAuth') == 'no') {
          this.setData({
            loginType: 1
          })
        // } else if (wx.getStorageSync('isAuth') == 'yes') {
        //   this.setData({
        //     loginType: 1
        //   })
        // }
      }
    })
   
  },
  resmevent: function (e) {
    if (wx.getStorageSync('scSysUser')) {
      this.setData({
        loginType: 0,
        userId: wx.getStorageSync('scSysUser').id
      })
      this.newGift();
      this.discount();
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
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  discount: function () {
    var that=this;
    var data = { 
      "shopId": this.data.shopId,
      customerId: this.data.userId
    };
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getCouponListNew', data).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        // couponType== 01 优惠券 02 代金券 03 包邮
        let list = res.data.data;
        var arr1 = [];
        var arr2 = [];
        var arr3 = [];
        for (let i = 0; i < list.length; i++) {
          list[i].beginTime = app.util.formatActivityDate(list[i].beginTime);
          list[i].endTime = app.util.formatActivityDate(list[i].endTime)
          if (list[i].couponType == '01') {//优惠券
            arr1.push(list[i]);
            this.setData({ couponType1: arr1});
            //进入页面赋值true或false 自动显示 立即领取 或 去使用
            var listArr1 = new Array(arr1.length);
            that.commonFor(listArr1, arr1)
            this.setData({
              list1: listArr1
            })
          } else if (list[i].couponType == '02') {//代金券
            arr2.push(list[i]);
            this.setData({ couponType2: arr2 });
            //进入页面赋值true或false 自动显示 立即领取 或 去使用
            var listArr2 = new Array(arr2.length);
            that.commonFor(listArr2, arr2)
            this.setData({
              list2: listArr2
            })

          } else if (list[i].couponType == '03') {//包邮
            arr3.push(list[i]);
            this.setData({ couponType3: arr3 });
            //进入页面赋值true或false 自动显示 立即领取 或 去使用
            var listArr3 = new Array(arr3.length);
            that.commonFor(listArr3, arr3)
            this.setData({
              list3: listArr3
            })
          }
        }
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  // onShareAppMessage: function () {
  // },
  commonFor: function (listArr, arr){
    for (var j = 0; j < arr.length; j++) {
      for (var i = 0; i < listArr.length; i++) {
        if (arr[j].receiveState == 1) {
          listArr[j] = true
        } else if (arr[j].receiveState == 0) {
          listArr[j] = false
        }
      }
    }
  },
  skipTo:function(){
    wx.switchTab({
      url: '../../../pages/proList/proList'
    })
  },
  //判断是否领取新人礼包
  newGift:function(){
    app.util.reqAsync('shop/getCouponUseStatusDetail', {
      customerId: this.data.userId,
      shopId: this.data.shopId 
    }).then((res) => {
      console.log(res);
      // receiveStatu 店铺是否设置新人礼包 useStatu 新人礼包是否领取
      if (res.data.data.receiveStatu == true && res.data.data.useStatu == false) {
        this.setData({ 
          getdiscount: false, 
          couponLogId: res.data.data.coupon.couponLogId,
          couponId: res.data.data.coupon.couponId
        });
        this.setData({ flag: 1 })
      } else if (res.data.data.receiveStatu == false ){
        this.setData({ flag: 0})
      } else if (res.data.data.receiveStatu == true && res.data.data.useStatu == true){
        this.setData({ 
          getdiscount: true,
          couponLogId: res.data.data.coupon.couponLogId,
          couponId: res.data.data.coupon.couponId
        });
        this.setData({ flag: 1 })
      } 
    }).catch((err) => {
      console.log(err)
    })
  },
  checkDetail:function(){
    wx.navigateTo({
      url: '../../../pages/myHome/discounts/discountDetail/discountDetail?couponLogId=' + this.data.couponLogId + '&couponType=06' + "&share=0"+"&shopId="+this.data.shopId,
      success: function (res) {
      }
    })
  },
  getCoupon:function(e){
    var _this = this;
    var flag = e.currentTarget.dataset.flag;
    //flag为1是礼包领取其他的是列表领取
    if (flag==1){
      var data = {
        "customerId": this.data.userId,
        "shopId": this.data.shopId,
        "couponId": this.data.couponId,
        "promGoodsType": this.data.promGoodsTypeShare,
        "number": 1
      }
    } else{
      var index = e.currentTarget.dataset.index;
      var arrIndex = e.currentTarget.dataset.arrindex;
      var listActive = [];
      if (arrIndex == 1) {
        var list1 = "list1[" + index + "]";
        this.setData({ [list1]: true });
      } else if (arrIndex == 2) {
        var list2 = "list2[" + index + "]";
        this.setData({ [list2]: true });
      } else if (arrIndex == 3) {
        var list3 = "list3[" + index + "]";
        this.setData({ [list3]: true });
      }
      var id = e.currentTarget.dataset.id;
      var data = {
        "customerId": this.data.userId,
        "shopId": this.data.shopId,
        "couponId": id ,
        "number": 1
      }
    }
    app.util.reqAsync('shop/takeCoupon', data).then((res) => {
      if (res.data.code==1){
        if (flag == 1) {
          this.setData({
            getdiscount: true,
            couponLogId: res.data.data.couponLogId
          })
        }
        wx.showToast({
          title: '领取成功',
          icon: 'none'
        })
      }else{
        wx.showToast({
          title: '领取失败',
          icon: 'none'
        })
        _this.newGift();
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  }
})