// packageIntegral/pages/orderConfirm/orderConfirm.js
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    accountText:'选择账户',
    count:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params={
      userId: wx.getStorageSync('scSysUser').id,
      merchantId: wx.getStorageSync('shop').merchantId,
      creditsId: options.id,
      shopId: wx.getStorageSync('shop').id
    }
    this.setData({
      params:params
    })
  },
  onShow:function(){
    //获取兑换详情
    this.getData(this.data.params);
  },
  getData:function(params){//兑换详情
    app.util.reqAsync('shop/confirmationOfOrderV2', params).then((res) => {
      if(res.data.data){
        if(res.data.data.creditsGoodsInfo.goodsType!=3){
          if (res.data.data.subaccounts.length > 1) {
            var subaccounts = res.data.data.subaccounts,
                accountArray = [];
            for (let i = 0; i < subaccounts.length; i++) {
              accountArray.push(subaccounts[i].businessName);
            }
            this.setData({
              accountArray: accountArray
            })
          }else{
            if(res.data.data.subaccounts.length>0){
              this.setData({
                accountText: res.data.data.subaccounts[0].businessName,
                accountId: res.data.data.subaccounts[0].id
              })
            }
          }
        }
        if (res.data.data.recvAddress) {
          let recvAddress = res.data.data.recvAddress,
              areaName = app.util.area.getAreaNameByCode(recvAddress.areaId),
              cityName = app.util.area.getAreaNameByCode(recvAddress.cityId),
              ProvinceName = app.util.area.getAreaNameByCode(recvAddress.provinceId),
              address = ProvinceName + cityName + areaName + recvAddress.address;
          this.setData({
            address: address
          })
        }
        this.setData({
          data:res.data.data,
          total: (res.data.data.creditsGoodsInfo.point) * (this.data.count).toFixed(2)
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  choseAccount:function(e){//选择账户
    this.setData({
      accountText:this.data.accountArray[e.detail.value],
      accountId: this.data.data.subaccounts[e.detail.value].id
    })
  },
  changeAddress:function(){//更改收货地址
    wx.navigateTo({
      url: '../../../packageMyHome/pages/address/index/list?select=1'
    })
  },
  change:function(e){//加减数量
    let count=this.data.count,
        num;
    if(e.currentTarget.id=='minus'){//减数量
        num=-1;
    }else{//加数量
        num=1;
    }
    count+=num;
    if (count <= 0) {
      return
    } else if (this.data.data.creditsGoodsInfo.goodsType == 3&&count > this.data.data.creditsGoodsInfo.balance) {
      wx.showToast({
        title: '已超过库存',
        icon: 'none'
      })
      return
    }
    if (this.data.data.creditsGoodsInfo.point * count > this.data.data.userCreditsInfo.usablePoint){//积分不足
      wx.showToast({
        title: '积分不足',
        icon: 'none'
      })
      return
    }
    this.setData({
      count:count,
      total: this.data.data.creditsGoodsInfo.point*count.toFixed(2)
    })
  },
  confirm:function(){//确认兑换
    if(this.data.data.subaccounts.length<=0){
      wx.showToast({
        title: '抱歉，您现在无账户无法兑换服务类积分商品',
        icon:'none'
      })
      return
    }
    if (this.data.data.creditsGoodsInfo.goodsType == 3&&!this.data.data.recvAddress){
      wx.showToast({
        title: '请选择收货地址',
        icon:'none'
      })
      return
    };
    if (this.data.data.creditsGoodsInfo.goodsType != 3&&!this.data.accountId){
      wx.showToast({
        title: '请选择账户',
        icon: 'none'
      })
      return
    }
    if (this.data.data.userCreditsInfo.usablePoint<this.data.total){
      wx.showToast({
        title: '积分不足',
        icon:'none'
      })
      return
    };
    let data=this.data.data,
        params={
          amount:this.data.total,
          customerId: wx.getStorageSync('scSysUser').id,
          subaccountId: this.data.accountId||'',
          shopOrderItemList: [{
            goodsPrice: data.creditsGoodsInfo.point,
            goodsType: data.creditsGoodsInfo.goodsType,
            stockId: data.creditsGoodsInfo.stockId||0,
            goodsNum: this.data.count,
            memberPrice: data.creditsGoodsInfo.memberPrice,
            balance: data.creditsGoodsInfo.balance,
            goodsName: data.creditsGoodsInfo.goodsName,
            goodsPic: data.creditsGoodsInfo.pictureUrl,
            goodsId: data.creditsGoodsInfo.goodsId,
            id: data.creditsGoodsInfo.id
          }],
          realMoney: this.data.total,
          bussinessId: wx.getStorageSync('shop').id
        }
    if (data.creditsGoodsInfo.goodsType==3){//普通商品
      params['deliveryType']=0;
      params['contactName'] = data.recvAddress.name;
      params['areaId'] = data.recvAddress.areaId;
      params['contactMobile'] = data.recvAddress.phone;
      params['provinceId'] = data.recvAddress.provinceId;
      params['cityId'] = data.recvAddress.cityId;
      params['address'] = data.recvAddress.address
    }else{//服务类
      params['deliveryType']=2;
    }
    app.util.reqAsync('shop/submitOnlineCreditOrder', params).then((res) => {
      if (res.data.code==1) {
          wx.redirectTo({
            url: '../convertSuccess/convertSuccess?orderNo='+res.data.data.orderNo
          })
      }else{
        wx.showToast({
          title: res.data.msg,
          icon:'none'
        })
        return
      }
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