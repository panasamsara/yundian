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
    showStock:false
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    app.util.reqAsync('shop/getGroupBuyOrderDetail', {
      groupId: '1230', //拼团id
      orderNo: 'ZXCSSHOP201807171639029160082',//订单编号
      pageNo: 1,
      shopId: '288',//店铺id
      pageSize: 10,
      cUser: '37'//拼团用户
    }).then((res) => {
      var data = res.data.data;
      console.log(data);
      this.setData({
        // isMaster: data.isMaster,
        isMaster: 0,
        groupId: data.groupId || '',
        pictureUrl: data.pictureUrl || '',
        goodsTitle: data.goodsTitle || '',
        descTitle: data.descTitle || '',
        discountPrice: data.discountPrice || '',
        endTime: data.endTime ||'',
        // timeStatus: data.timeStatus || '',
        timeStatus: 0,
        lackUser: data.lackUser || '',
        moreGroupList: data.moreGroupList || '',
        groupOrderList: data.groupOrderList || '',
        groupOrderListLength: data.groupOrderList.length ||''
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
      url: '../../goodsDetial/goodsDetial?shopId=' + shopId + '&goodsId=' + goodId + '&showBuy=true'
    })
  }
  // 再次发起拼单
  
})