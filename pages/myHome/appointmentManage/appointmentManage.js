var app=getApp();
Page({
  data: {
    activeIndex: "0",
    orderList:[],
    listData:{
      pagination: { rows: 3, page: 1 },
      customerId: "",
      bespokeStatus: 0
    },
    total:""
  },
  onShow:function(){
    var userId = wx.getStorageSync('scSysUser').id;
    var newId = "listData.customerId";
    var page ='listData.pagination.page'
    this.setData({ [newId]: userId, [page]:1});
    this.setData({ orderList: []});
    this.getList();
  },
  getList:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('shop/getMyBespoke',this.data.listData).then((res) => {
      var orderListOld = this.data.orderList;
      var data = res.data.data;
      for (var i = 0; i < data.rows.length;i++){
        orderListOld.push(data.rows[i]);
      }
      wx.hideLoading()
      var desc = ++this.data.listData.pagination.page;
      var page = "listData.pagination.page";
      this.setData({ orderList: orderListOld, total: data.total, [page]: desc });
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  typeTop: function (e) {
    wx.showLoading({
      title: '加载中',
    })
    var index = e.currentTarget.dataset.index;
    if (index == 0) {
      this.data.activeIndex = 0
    } else {
      this.data.activeIndex = 1;
    }
    var desc = "listData.bespokeStatus";
    var page = "listData.pagination.page";
    // 把之前的数组里面的数据清空
    this.data.orderList.length=0;
    this.setData({ activeIndex: this.data.activeIndex, [desc]: this.data.activeIndex, [page]: 1});
    this.getList();
  },
  skip:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url:"./manageDetail/manageDetail?id="+id})
  },
  // onPullDownRefresh: function () {
  //   //票判断不为0,点击tab为空的时候不可以下拉;
  //   if (this.data.orderList.length != 0){
  //     wx.showLoading({
  //       title: '加载中',
  //     });
  //     // 下拉每次清空数组
  //     this.data.orderList.length = 0;
  //     var newpage = Math.ceil(this.data.total / this.data.listData.pagination.rows);
  //     if (this.data.listData.pagination.page <= newpage) {
  //       this.getList();
  //     } else {
  //       wx.showToast({
  //         title: '到底了哦',
  //         icon: "none"
  //       })
  //     }
  //     wx.stopPullDownRefresh();
  //   }
  // },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.listData.pagination.rows);
    if (this.data.listData.pagination.page <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.getList();
    }else{
      wx.showToast({
        title: '到底了哦',
        icon:"none"
      })
    }
  },
})