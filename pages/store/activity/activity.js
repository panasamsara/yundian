// pages/store/activity/activity.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data={
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id,
      pageNo: 1,
      pageSize: 10,
    }
    this.setData({
      datas:data
    })
    this.getData(data)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {
  //   var totalPage = Math.ceil(this.data.total / 10 - 1);
  //   wx.showLoading({
  //     title: '加载中',
  //   })
  //   this.data.datas.sStartpage += 1;
  //   if (this.data.datas.sStartpage > totalPage) {
  //     wx.showToast({
  //       title: '已经到底了',
  //       icon: 'none'
  //     })
  //     return
  //   }
  //   let data = this.data.datas;
  //   this.getData(data);
  // },
  getData: function (data) {
    let oldData = this.data.list;
    app.util.reqAsync('shop/getShopHomePageInfo', data).then((res) => {
      if (res.data.data.goodsInfos) {
        let list = res.data.data.goodsInfos;
        for(let i=0;i<list.length;i++){
          list[i].startTime = app.util.formatActivityDate(list[i].startTime);
          list[i].endTime = app.util.formatActivityDate(list[i].endTime);
        }
        let newData = oldData.concat(list);
        this.setData({
          list: newData,
          total: res.data.total
        })
      }
      wx.hideLoading();
    }).catch((err) => {
      console.log(err);
      wx.hideLoading();
    })
  }
})