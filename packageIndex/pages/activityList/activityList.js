const app = getApp()
Page({
  data: {
    dataJson: {
    "detailId": "",
    "type": "",
    "sStartPage": "1",
    "sSpagerows": "10",
    "userId": ""
    },
    activityList: [],
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id
    var detailId = 'dataJson.detailId';
    var userid = 'dataJson.userId';
    var typeId = 'dataJson.type'
    this.setData({
      [detailId]: options.detailId,
      [userid]: userId,
      [typeId]: options.typeId
    })
    this.detail();
  },
  detail: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('fans/getFansTeamActivityNew20', this.data.dataJson).then((res) => {
      var arr = this.data.activityList;
      wx.hideLoading();
      var arrNew = arr.concat(res.data.data);
      if (res.data.code == 1) {
        that.data.dataJson.sStartpage++;
        this.setData({
          activityList: arrNew,
          total: res.data.total
        })
        console.log("activityList",this.data.activityList);
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.dataJson.sPagerows);
    if (this.data.dataJson.sStartpage <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.detail();
    } else {
      wx.showToast({
        title: '到底了哦',
        icon: "none"
      })
    }
  },
  fansActivity: function (e) {
    var id = e.currentTarget.dataset.activityid;
    wx.navigateTo({
      url: '../fansActivity/fansActivity?id=' + id,
    })
  },
})


