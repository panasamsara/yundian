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
    app.util.reqAsync('shop/getShopInfoAbstract', data).then((res) => {
      if(res.data.data.resMap){
        let map = res.data.data.resMap;
        map.videoAlbumTime = app.util.formatStoreDate(map.videoAlbumTime);
        map.mylength = map.urls.length;
        if (res.data.data.newCmsArticle[0]){
          let articleContent = res.data.data.newCmsArticle[0]
          articleContent.articleContent = articleContent.articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').substring(0, 52) + '...';
        }
      }
      this.setData({
        data: res.data.data
      })
      // 判断用户类型
      let merchantId = res.data.data.shopInfo.merchantId;
      if(merchantId){
        if (merchantId == wx.getStorageSync('scSysUser').id){
          this.setData({
            type:1
          })
        }else{
          this.setData({
            type:2
          })
        }
      }
    }).catch((err) => {
      console.log(err);
    })
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