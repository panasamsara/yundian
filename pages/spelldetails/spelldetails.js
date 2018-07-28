// pages/spelldetails/spelldetails.js
const app = getApp();

Page({
  data: {
    isMaster: '', //是否拼主 0不是1是  #int  
    groupId: '', //拼团id
    pictureUrl: '', //商品图片
    goodsTitle:'',  //商品名称
    discountPrice:'',//拼团价格
    descTitle: '',  //商品描述
    endTime:'',     //结束时间
    timeStatus: '', //拼团状态 0进行中 1成团 2过期失败#int
    lackUser: '' , //成团缺少人数#int
    moreGroupList: [], //推荐更多拼团商品list
    groupOrderList:[], //已加入拼团用户list
    groupOrderListLength:'',
    showStock:false,
    shopId:'',
    goodId:'',
    population:'',
    spellUser:'',
    orderStatusVo:'' //付款状态
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    console.log(options.population);
    this.setData({
      groupId: options.groupId,
      orderNo: options.orderNo,
      population: options.population,
      shopId: options.shopId,
      cUser: options.cUser,
      orderStatusVo: options.orderStatusVo
    })
    console.log('orderStatusVo:' + this.data.orderStatusVo);
    app.util.reqAsync('shop/getGroupBuyOrderDetail', {
      groupId: this.data.groupId, //拼团id
      orderNo: this.data.orderNo, //订单编号
      pageNo: 1,
      shopId: this.data.shopId,//店铺id
      pageSize: 10,
      cUser: this.data.cUser//拼团用户
    }).then((res) => {
      // debugger;
      var data = res.data.data;
      console.log(data);
      this.setData({
        isMaster: data.isMaster,
        groupId: data.groupId,
        pictureUrl: data.pictureUrl,
        goodsTitle: data.goodsTitle,
        descTitle: data.descTitle,
        discountPrice: data.discountPrice,
        endTime: data.endTime ? data.endTime : '0',
        timeStatus: data.timeStatus,
        lackUser: data.lackUser ? data.lackUser : '0',
        moreGroupList: data.moreGroupList,
        groupOrderList: data.groupOrderList,
        groupOrderListLength: data.groupOrderList.length,
        goodId: data.goodsId
      })
    })
  },
  onShow: function (e) {
    //调接口
    app.util.reqAsync('shop/getGroupBuyOrderDetail', {
      groupId: this.data.groupId, //拼团id
      orderNo: this.data.orderNo, //订单编号
      pageNo: 1,
      shopId: this.data.shopId,//店铺id
      pageSize: 10,
      cUser: this.data.cUser//拼团用户
    }).then((res) => {
      // debugger;
      console.log(res);
      if (res.data.code == 1) {
        var data = res.data.data;

        this.setData({
          isMaster: data.isMaster,
          groupId: data.groupId,
          pictureUrl: data.pictureUrl,
          goodsTitle: data.goodsTitle,
          descTitle: data.descTitle,
          discountPrice: data.discountPrice,
          endTime: data.endTime,
          timeStatus: data.timeStatus,
          lackUser: data.lackUser,
          moreGroupList: data.moreGroupList,
          groupOrderList: data.groupOrderList,
          groupOrderListLength: data.groupOrderList.length
        })
        console.log(this.data.moreGroupList);
        // 拼接参与拼单用户数组
        var usersArr = [];
        // debugger;
        if (this.data.groupOrderList.length > 0) {
          usersArr.concat(this.data.groupOrderList);
        }

        if (usersArr.length < this.data.population) {
          var len = this.data.population - usersArr.length;
          var obj = { "userpic": "images/yundian_pindantouxiang@2x.png" };
          for (let i = 0; i < len; i++) {
            usersArr.push(obj);
          }
        }
        this.setData({
          spellUser: usersArr
        })


      } else {
        wx.showToast({
          title: data.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  showRule:function(){
    this.setData({
      showStock: true
    });
  },
  closeMask:function(){
    this.setData({
      showStock: false
    });
  },
  // 邀请好友拼单
  onShareAppMessage: function (res) {
    return {
      title: this.data.goodsTitle,
      desc: this.data.descTitle,
    }
  },
  // 参与拼单
  participate: function(e){
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodId + '&showBuy=true' + '&status=' + 1 + '&buy=buyNow'
    })
  },
  // 再次发起拼单
  againInitiate: function (e) {
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodId + '&showBuy=true' + '&status=' + 1 + '&buy=buyNow'
    })
  },
  // 跳转商品详情
  goToGroupBuy: function (e) {
    var goodsid = e.currentTarget.dataset['goodsid']
    var groupId = e.currentTarget.dataset['groupid']
    var shopId = e.currentTarget.dataset['shopid']
    console.log(goodsid);
    console.log(groupId);
    console.log(shopId);
    var user = wx.getStorageSync('scSysUser')
    wx.navigateTo({
      url: '../goodsDetial/goodsDetial?goodsId=' + goodsid + '&shopId=' + shopId + '&showBuy=true' + '&status=' + 1 + '&buy=buyNow',
      success: function (res) {
        // success
      }
    })
  },
})