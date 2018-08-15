// pages/videoLists/videoLists.js
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photoLists: [],
    lengthOfThisPage: 0,
    pageNo: 1,
    photofrom: 0,
    hasData: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');
    this.getPhotos(shop.id, 0)
  },
  getPhotos: function (shopid, photofrom = 0) {
    let lists = this.data.photoLists

    util.reqAsync('cloudshop/getShopPhotoIndex', {
      shopId: shopid,
      contentType: 1, //0-图片；1-视频
      createFrom: photofrom, //文件上传来源（0-官方；1-网友）
      pageNo: this.data.pageNo, //页码
      pageSize: 12 //每页个数
    }).then((res) => {
      console.log(res.data)
      wx.hideLoading()
      let newData = lists.concat(res.data.data.photoList)
      this.setData({
        photoLists: newData,
        lengthOfThisPage: res.data.data.photoList.length
      })
      if (res.data.data.photoList.length != 0) {
        this.setData({
          hasData: true
        })
      } else {
        this.setData({
          hasData: false
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  photoType: function (e) {
    let _from = e.currentTarget.dataset['type']
    this.setData({
      pageNo: 1,
      photoLists: [],
      photofrom: _from
    })
    var shop = wx.getStorageSync('shop');
    this.getPhotos(shop.id, this.data.photofrom)
  },
  goPlayVideo: function(e){
    let _index = e.currentTarget.dataset['index']
    let lists = this.data.photoLists
    let videoInfo = {}
    videoInfo.url = lists[_index].contentUrl
    videoInfo.cover = lists[_index].coverPath
    wx.setStorageSync('videoInfo', videoInfo)
    
    wx.navigateTo({
      url: '../video/video',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    wx.showLoading({
      title: '加载中',
    })
    this.data.pageNo += 1;
    if (this.data.lengthOfThisPage < 12) {
      wx.showToast({
        title: '已经到底了',
        icon: 'none'
      })
      return
    }
    var shop = wx.getStorageSync('shop');
    this.getPhotos(shop.id, this.data.photofrom)
  },


})