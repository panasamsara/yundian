var app=getApp();
Page({
  data: {
    activeIndex: "1",
    orderList:[],
    listData: { 
      searchType: 1, 
      createUser: 1870, 
      pageSize: 10, 
      pageNo: 1
    }
  },
  onLoad: function (options) {
    this.getList();
  },
  onShow: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {
  },
  typeTop: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 1) {
      this.data.activeIndex = 1
    } else if (index == 2){
      this.data.activeIndex = 2;
    }else{
      this.data.activeIndex = 3;
    }
    var searchType ="listData.searchType"
    this.setData({ activeIndex: this.data.activeIndex, [searchType]: this.data.activeIndex});
    this.getList();
  },
  skip: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/myHome/myQuestion/questionDetail/questionDetail?id="+id })
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyQuestionByType', this.data.listData).then((res) => {
      var orderListOld = [];
      var data = res.data.data;
      for (var i = 0; i < data.length; i++) {
        orderListOld.push(data[i]);
      }
      this.setData({ orderList: orderListOld });
      wx.hideLoading()
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
})