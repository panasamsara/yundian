// pages/groupBuy/groupBuy.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data={
      pageNo: 1,
      shopId: wx.getStorageSync('shop').id,
      pageSize: 10
    }
    this.setData({
      datas:data
    })
    this.getData(data)
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let totalPage = Math.ceil(this.data.total / 10 );
    wx.showLoading({
      title: '加载中',
    })
    this.data.datas.pageNo += 1;
    if (this.data.datas.pageNo > totalPage) {
      wx.showToast({
        title: '已经到底了',
        icon: 'none'
      })
      return
    }
    let data = this.data.datas;
    this.getData(data);
  },
  getData:function(data){
    let oldData=this.data.list
    app.util.reqAsync('shop/getGroupBuyingList',data).then((res)=>{
      if(res.data.data){
        let newData=oldData.concat(res.data.data)
        this.setData({
          list: newData,
          total: res.data.total
        })
      }
      wx.hideLoading();
    }).catch((err)=>{
        console.log(err)
        wx.hideLoading();
    })
  }
})