// pages/store/store.wxml.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: '',
    active: 'manage',
    focus: false,
    text: '',
    customerId: "",
    shopId: '',
    customerId: '',
    shopName: '',
    logoUrl: '',
    bgImage: '',
    datas:[],
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let data = {
      shopId: wx.getStorageSync('shop').id,
      pageNo: 1,
      pageSize: 10
    };
    this.setData({
      datas: data
    })
    this.getData(data);
  },
  onReachBottom: function () {
    var totalPage = Math.ceil(this.data.total / 10);
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
  onPullDownRefresh: function () {
    this.setData({
      list: []
    })
    this.onLoad();
    wx.stopPullDownRefresh();
  },
  getData: function (data) {
    var oldData = this.data.list;
    app.util.reqAsync('shop/getNewGoodsList', data).then((res) => {
      if (res.data.data.length > 0) {
        var list = res.data.data;
        var newData = oldData.concat(list);
        this.setData({
          list: newData,
          total: res.data.total
        })
      } else {
        this.setData({
          blank: true
        })
      }
      wx.hideLoading();
    }).catch((err) => {
      console.log(err);
      wx.hideLoading();
    })
  },


})