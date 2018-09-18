// packageIntegral/pages/goodsdetail/goodsdetail.js
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
    let shopId = wx.getStorageSync('shop').id,
        merchantId = wx.getStorageSync('shop').merchantId,
        params1={
          userId: wx.getStorageSync('scSysUser').id,
          shopId: shopId,
          pageNo:1,
          pageSize:10,
          merchantId: merchantId
        },
        params2={
          goodsId:options.goodsId,
          shopId: shopId,
          merchantId: merchantId,
          goodsType:options.goodsType
        }
    //查询账户剩余积分
    this.getPoint(params1);
    //查询积分商品详情
    this.getData(params2);
  },
  getPoint:function(params){//获取账户积分
    app.util.reqAsync('shop/selectOrderSettleInfo', params).then((res) => {
      if (res.data.data.userCreditsInfo){
        this.setData({
          usablePoint: res.data.data.userCreditsInfo.usablePoint
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  getData:function(params){//获取商品详情
    wx.showLoading({
      title: '加载中',
      icon: 'none'
    })
    app.util.reqAsync('shop/selectCreditsGoodsById', params).then((res) => {
      if (res.data.data) {
        let data = res.data.data;
        if (data.descContent != null && data.descContent != '') {//商品详情富文本编辑器处理
          data.descContent = data.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/(background-color|font-size)[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ');
        }
        this.setData({
          data:res.data.data
        })
      }
      wx.hideLoading();
    }).catch((err) => {
      console.log(err);
      wx.hideLoading();
    })
  },
  exchange:function(){//立即兑换
    let usablePoint = this.data.usablePoint;
    if (usablePoint < this.data.data.point){
      wx.showToast({
        title: '您的积分不足',
        icon:'none'
      })
      return 
    }
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm?id=' + this.data.data.id
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})