// pages/store/store.wxml.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: '',
    active: 'manage',
    focus: false,
    text: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let data = {
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id
    };
    // 店铺信息/云店简介
    app.util.reqAsync('shop/getShopAbstractInfo', data).then((res) => {
      console.log(wx.getStorageSync('scSysUser').id, wx.getStorageSync('shop').id)
      if(res.data.data.resMap){
        var map = res.data.data.resMap,
            articleContent=res.data.data.newCmsArticle[0]
        if(map){
          map.videoAlbumTime = app.util.formatStoreDate(map.videoAlbumTime);
          map.mylength = map.urls.length;
        }
        if(articleContent){
          articleContent.articleContent = articleContent.articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').substring(0, 52) + '...';
        }
      }
      this.setData({
        data: res.data.data
      })
    }).catch((err) => {
      console.log(err);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  tabChange: function(e) {
    this.setData({
      active: e.currentTarget.id
    })
  },
  // briefChange: function(e) {
  //   var desc = "data.shopInfo.shopDesc";
  //   console.log(wx.getStorageSync('oldDesc'))
  //   if (e.detail.value == '') {
  //     this.setData({
  //       [desc]: wx.getStorageSync('oldDesc')
  //     })
  //   } else {
  //     this.setData({
  //       [desc]: e.detail.value
  //     })
  //   }
  // },
  // inputChange: function(e) {
  //   var desc = "data.shopInfo.shopDesc";
  //   wx.setStorageSync('oldDesc', this.data.data.shopInfo.shopDesc);
  //   this.setData({
  //     [desc]: null,
  //     focus: true
  //   })
  // }, 
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var imageList = this.data.data.resMap.urls;
    wx.previewImage({
      current: current,
      urls: imageList
    })
  }
})