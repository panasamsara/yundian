// packageIntegral/pages/orderdetail/orderdetail.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    let params={
      orderNo: options.orderNo
    }
    this.setData({
      params:params,
      orderNo: options.orderNo
    })
    //获取订单信息
    this.getData(params);
  },
  getData:function(params){//获取订单信息
    app.util.reqAsync('shop/orderDetail', params).then((res) => {
      if(res.data.data){
        let orderInfo = res.data.data[0].orderInfo,
            areaName = app.util.area.getAreaNameByCode(orderInfo.areaId),
            cityName = app.util.area.getAreaNameByCode(orderInfo.cityId),
            ProvinceName = app.util.area.getAreaNameByCode(orderInfo.provinceId),
            address = ProvinceName + cityName + areaName + orderInfo.address;
        this.setData({
          data:res.data.data[0],
          address:address,
          orderInfo: orderInfo
        })
        console.log(this.data.orderInfo)
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  // enterShop:function(e){//进入店铺
  //   wx.switchTab({
  //     url: '../../../pages/index/index?shopId='+e.currentTarget.dataset.id
  //   })
  // },
  contact:function(e){//联系商家
    wx.makePhoneCall({
      phoneNumber:e.currentTarget.dataset.num
    })
  },
  check:function(){//确认收货
    let params = {
      customerId: wx.getStorageSync('scSysUser').id,
      orderNo:this.data.orderNo
    }
    app.util.reqAsync('shop/confirmRecv', params).then((res) => {
      if(res.data.code==1){
        wx.showToast({
          title: '已确认收货',
          icon: 'none'
        })
        this.getData(this.data.params);
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  remind:function(){//提醒发货
    let params={
      orderNo: this.data.orderNo,
      userId: wx.getStorageSync('scSysUser').id
    }
    app.util.reqAsync('shop/orderRemind', params).then((res) => {
        var title;
        if (res.data.data.hasRemind==0){
          title='已提醒商家发货'
        }else{
          title='已提醒商家发货，请勿重复提醒'
        }
        wx.showToast({
          title: title,
          icon: 'none'
        })
    }).catch((err) => {
      console.log(err);
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})