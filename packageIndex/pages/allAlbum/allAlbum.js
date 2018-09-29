const app = getApp()
Page({
  data: {
    dataJson: {
      "sPagerows": "6",
      "sStartpage": "1",
      "userId": "",
      "type": "",
      "circleId": ""
    },
    activityList: [],
    albumList: [],
    groupList: []
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id
    var circleId = 'dataJson.circleId';
    var userid = 'dataJson.userId';
    var typeId = 'dataJson.type'
    this.setData({
      [circleId]: options.circleId,
      [userid]: userId,
      [typeId]: options.typeId
    })
    this.detail();
  },
  detail: function () {
    var that=this;
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('circle/getFansPhones', this.data.dataJson).then((res) => {
      var arr = this.data.albumList;
      wx.hideLoading();
      var arrNew = arr.concat(res.data.data);
      if (res.data.code == 1) {
        that.data.dataJson.sStartpage++;
        this.setData({
          albumList: arrNew,
          total:res.data.total
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  photoDetail: function (e) {
    var albumId = e.currentTarget.dataset.albumid;
    var albumName = e.currentTarget.dataset.albumname;
    var circleId = e.currentTarget.dataset.circleid;
    wx.navigateTo({
      url: '../allPhoto/allPhoto?albumId=' + albumId + "&albumName=" + albumName + "&circleId=" + circleId,
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
})


