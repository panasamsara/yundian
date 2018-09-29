// packageIntegral/pages/goodsdetail/goodsdetail.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId:'',
    goodsId:'',
    goodsType:'',
    loginType:0,
    data:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options && options.q) {
      var uri = decodeURIComponent(options.q)
      var p = util.getParams(uri)
      let shopId = p.shopId
      wx.setStorageSync('shopId', shopId);
      this.setData({
        shopId: shopId,
      })
    } else {
      if (options && options.shopId) {
        wx.setStorageSync('shopId', options.shopId);
        this.setData({
          shopId: options.shopId
        })
      }
    }
    this.setData({
      goodsId: options.goodsId,
      goodsType: options.goodsType
    })
    // let shopId = options.id,
       
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
    var _this =this;
    app.util.checkWxLogin('share').then((loginRes) => {
      console.log(loginRes)
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
        if (wx.getStorageSync('shop')){
           var params1 = {
              userId: wx.getStorageSync('scSysUser').id,
             shopId: _this.data.shopId,
              pageNo: 1,
              pageSize: 10,
              merchantId: wx.getStorageSync('shop').merchantId
            },
           params2 = {
             goodsId: _this.data.goodsId,
             shopId: _this.data.shopId,
              merchantId: wx.getStorageSync('shop').merchantId,
             goodsType: _this.data.goodsType
            }
          //查询账户剩余积分
          _this.getPoint(params1);
          //查询积分商品详情
          _this.getData(params2);
        }else{
          app.util.getShop(loginRes.id, _this.data.shopId).then(function (res) {
            //shop存入storage
            wx.setStorageSync('shop', res.data.data.shopInfo);
            //活动
            wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
            // 所有信息
            wx.setStorageSync('shopInformation', res.data.data);
            var params1 = {
              userId: wx.getStorageSync('scSysUser').id,
              shopId: _this.data.shopId,
              pageNo: 1,
              pageSize: 10,
              merchantId: wx.getStorageSync('shop').merchantId
              },
             params2 = {
               goodsId: _this.data.goodsId,
               shopId: _this.data.shopId,
                merchantId: wx.getStorageSync('shop').merchantId,
               goodsType: _this.data.goodsType
              }; 
              //查询账户剩余积分
            _this.getPoint(params1);
              //查询积分商品详情
            _this.getData(params2);
          })
        }
        
      }
    })
    
  },
  //注册回调
  resmevent:function(){
    var _this =this
    if (wx.getStorageSync('scSysUser')) {
      _this.setData({
        loginType:0
      })
      app.util.getShop(wx.getStorageSync('scSysUser').id, _this.data.shopId).then(function (res) {
        //shop存入storage
        wx.setStorageSync('shop', res.data.data.shopInfo);
        //活动
        wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
        // 所有信息
        wx.setStorageSync('shopInformation', res.data.data);
        var params1 = {
          userId: wx.getStorageSync('scSysUser').id,
          shopId: _this.data.shopId,
          pageNo: 1,
          pageSize: 10,
          merchantId: wx.getStorageSync('shop').merchantId
        },
          params2 = {
            goodsId: _this.data.goodsId,
            shopId: _this.data.shopId,
            merchantId: wx.getStorageSync('shop').merchantId,
            goodsType: _this.data.goodsType
          };
        //查询账户剩余积分
        _this.getPoint(params1);
        //查询积分商品详情
        _this.getData(params2);
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.data.goodsName,
      desc: this.data.data.goodsName,
      imageUrl: this.data.pictureUrl,
      path: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodsId + '&share=share',
      success: function () {
      }
    }
  }
})