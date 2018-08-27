var app=getApp();
Page({
  data: {
    activeIndex: "1",
    orderList:[],
    listData: { 
      searchType: 1, 
      createUser: "", 
      // createUser: 80572, 
      pageSize: 5, 
      pageNo: 1
    },
    total:""
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    var newId = "listData.createUser";
    this.setData({ [newId]: userId });
    this.getList();
  },
  onShow: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.listData.pageSize);
    console.log(this.data.listData.pageNo);
    console.log(newpage);
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
  typeTop: function (e) {
    var index = e.currentTarget.dataset.index;
    if (index == 1) {
      this.data.activeIndex = 1
    } else if (index == 2){
      this.data.activeIndex = 2;
    }else{
      this.data.activeIndex = 3;
    }
    this.data.orderList.length = 0;
    var searchType ="listData.searchType";
    var page = "listData.pageNo";
    this.setData({ activeIndex: this.data.activeIndex, [searchType]: this.data.activeIndex, [page]:1});
    this.getList();
    console.log()
  },
  skip: function (e) {
    var id = e.currentTarget.dataset.id;
    var index = this.data.activeIndex;
    wx.navigateTo({ url: "./questionDetail/questionDetail?id=" + id + "&activeIndex=" + index});
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyQuestionByType', this.data.listData).then((res) => {
      var orderListOld = this.data.orderList;
      var data = res.data.data;
      for (var i = 0; i < data.length; i++) {
        orderListOld.push(data[i]);
      }
      var desc = ++this.data.listData.pageNo;
      var page = "listData.pageNo";
      this.setData({
        orderList: orderListOld,
        total: res.data.total,
        [page]: desc
      });
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