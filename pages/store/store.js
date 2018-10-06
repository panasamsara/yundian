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
    shopMsg: [],//店铺信息
    resMap: [],//智经营信息
    scCmsArticle: [],//头条
    shopInfo: [],//简介
    circleFansTeam: [], //粉团队
    circleNew: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中'
    })
    var customerId = wx.getStorageSync('scSysUser').id;
    var shopId = wx.getStorageSync('shop').id;
    var shopName = wx.getStorageSync('shop').shopName;
    var logoUrl = wx.getStorageSync('shop').logoUrl;
    var bgImage = wx.getStorageSync('shop').bgImage;
    this.setData({
      customerId: customerId,
      shopId: shopId,
      shopName: shopName,
      logoUrl: logoUrl,
      bgImage: bgImage
    })
    // 店铺信息/云店简介
    this.getTop();
    this.getManage();
    this.getIntroduction();
    // app.util.reqAsync('shop/getShopInfoAbstract', data).then((res) => {
    //   if (res.data.data.resMap.circleName){//动态时间格式处理
    //     let map = res.data.data.resMap;
    //     map.videoAlbumTime = app.util.formatStoreDate(map.videoAlbumTime);
    //     map.mylength = map.urls.length;
    //   }
    //   if (res.data.data.scCmsArticle && res.data.data.scCmsArticle.length){
    //     if (res.data.data.scCmsArticle[0].articleContent.length > 52) {//头条富文本编辑器处理
    //       let articleContent = res.data.data.scCmsArticle[0]
    //       articleContent.articleContent = articleContent.articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, ' ').substring(0, 52) + '...';
    //     }
    //   }
    //   this.setData({
    //     data: res.data.data
    //   })
    //   // 判断用户类型
    //   let merchantId = res.data.data.shopInfo.merchantId;
    //   if(merchantId){
    //     if (merchantId == wx.getStorageSync('scSysUser').id){
    //       this.setData({
    //         type:1
    //       })
    //     }else{
    //       this.setData({
    //         type:2
    //       })
    //     }
    //   }
    //   wx.hideLoading()
    // }).catch((err) => {
    //   console.log(err);
    // })
  },
  getTop: function (e) {
    //获取顶部店铺信息
    app.util.reqAsync('shop/getShopAbstractInfo', {
      customerId: this.data.customerId,
      shopId: this.data.shopId
    }).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          shopMsg: res.data.data
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  getManage: function (e) {
    //获取智经营信息
    app.util.reqAsync('shop/getShopManagementInfo', {
      customerId: this.data.customerId,
      shopId: this.data.shopId
    }).then((res) => {
      wx.hideLoading();
      var data=res.data.data;
      //云店动态处理
      if (data.resMap.length>0){
        if (data.resMap[0].videoAlbumTime) {//动态时间格式处理
          var map = data.resMap[0];
          map.videoAlbumTime = map.videoAlbumTime.split(' ')[0];
          map.mylength = map.urls.length;
        }
      }
      //云店头条处理
      if (res.data.data.scCmsArticle && res.data.data.scCmsArticle.length) {
        if (res.data.data.scCmsArticle[0].articleContent.length > 52) {//头条富文本编辑器处理
          let articleContent = res.data.data.scCmsArticle[0]
          articleContent.articleContent = articleContent.articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, ' ').substring(0, 52) + '...';
        }
      }
      this.setData({
        data: data
      })
      console.log(this.data.data);
    })
  },
  getIntroduction: function () {
    //获得云店简介
    app.util.reqAsync('shop/getShopAbstractInfoNew', {
      customerId: this.data.customerId,
      shopId: this.data.shopId
    }).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          shopInfo: res.data.data.shopInfo
        })

        // 判断用户类型

        let merchantId = this.data.shopInfo.merchantId;

        if (merchantId) {
          if (merchantId == wx.getStorageSync('scSysUser').id) {
            this.setData({
              type: 1
            })
          } else {
            this.setData({
              type: 2
            })
          }

        }
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
  },
  tabChange: function (e) {
    this.setData({
      active: e.currentTarget.id
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var imageList = this.data.data.resMap[0].urls;
    wx.previewImage({
      current: current,
      urls: imageList
    })
  },
  apen_add: function () {
    var latitude = this.data.shopInfo.latitude;
    var longitude = this.data.shopInfo.longitude;
    var address = this.data.shopInfo.address;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: address,
      scale: 28
    })
  },
  ship: function (e) {
    console.log(e)
    var articleId = e.currentTarget.dataset.articleid;
    wx.navigateTo({
      url: '../../packageIndex/pages/articleDetail/articleDetail?articleId=' + articleId,
    })
  },
  skipDetail:function(e){
    var detailId = e.currentTarget.dataset.detailid;
    var typeId = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '../../packageIndex/pages/fansGroup/fansGroup?detailId=' + detailId + "&typeId=" + typeId,
    })
  },
  phoneCall(){
    let tel = wx.getStorageSync('shop').phoneService
    if (tel != null){
      wx.makePhoneCall({
        phoneNumber: tel 
      })
    }
  },
  goDynamic: function (e) {//跳转动态详情
    let dynamicId = e.currentTarget.dataset.dynamicid;
    wx.navigateTo({
      url: 'dynamicInfo/dynamicInfo?dynamicId=' + dynamicId
    })
  }
})