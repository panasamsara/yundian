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
    text: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中'
    })
    let data = {
      customerId: wx.getStorageSync('scSysUser').id,
      shopId: wx.getStorageSync('shop').id
    };
    // 店铺信息/云店简介
    app.util.reqAsync('shop/getShopInfoAbstract', data).then((res) => {
      if (res.data.data.resMap.circleName){//动态时间格式处理
        let map = res.data.data.resMap;
        map.videoAlbumTime = app.util.formatStoreDate(map.videoAlbumTime);
        map.mylength = map.urls.length;
      }
      if (res.data.data.newCmsArticle && res.data.data.newCmsArticle.length){
        if (res.data.data.newCmsArticle[0].articleContent.length > 52) {//头条富文本编辑器处理
          let articleContent = res.data.data.newCmsArticle[0]
          articleContent.articleContent = articleContent.articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, ' ').substring(0, 52) + '...';
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
      // 请求成功之后掉一次地址;
      wx.getLocation({
        type: 'wgs84',
        success: function (res) {
        }
      })
      wx.hideLoading()
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
  },
  apen_add:function(){
    var that = this;
    wx.getSetting({
      type: 'gcj02',
      success: (res) => {
      console.log(res);
      console.log(res.authSetting['scope.userLocation']);
        var userLocation = res.authSetting['scope.userLocation'];
        //点击图标的时候再次验证是否授权
        if (userLocation == false || userLocation == null || userLocation == undefined) {
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置，请确认授权，否则地图定位功能将无法使用',
            success: function (res) {
              if (res.cancel) {
                wx.showToast({
                  title: '取消获取授权',
                  icon: 'none',
                  duration: 1000
                })
              } else if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    console.log(res);
                    if (res.authSetting["scope.userLocation"] == true){
                      wx.showToast({
                        title: '授权成功',
                        icon: 'none',
                        duration: 1000
                      })
                      wx.getLocation({
                        type: 'wgs84',
                        success: function (res) {
                          // 从缓存中拿到店铺的经纬度
                          var latitude = that.data.data.shopInfo.latitude;
                          var longitude = that.data.data.shopInfo.longitude;
                          var address = that.data.data.shopInfo.address;
                          wx.openLocation({
                            latitude: latitude,
                            longitude: longitude,
                            name: address,
                            scale: 28
                          })
                        }
                      })
                    }else{
                        wx.showToast({ 
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })     
        } else if (userLocation == true){
          wx.getLocation({
            type: 'wgs84',
            success: function (res) {
              // 从缓存中拿到店铺的经纬度
              var latitude = that.data.data.shopInfo.latitude;
              var longitude = that.data.data.shopInfo.longitude;
              var address = that.data.data.shopInfo.address;
              wx.openLocation({
                latitude: latitude,
                longitude: longitude,
                name: address,
                scale: 28
              })
            }
          })
        }
      }
    })
  },
  ship:function(e){
    console.log(e)
    var articleId = e.currentTarget.dataset.articleid;
    wx.navigateTo({
      url: '../../packageIndex/pages/articleDetail/articleDetail?articleId=' + articleId,
    })
  }
})