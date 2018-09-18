// pages/store/dynamicInfo/dynamicInfo.js
import util from '../../../utils/util.js';
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params={
      dynamicId: options.dynamicId,
      userId: wx.getStorageSync('scSysUser').id
    }
    this.getDynamic(params);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { //缓存店铺信息（分享切店铺）
    var _this = this
    util.checkWxLogin('share').then((loginRes) => {
      var shopId = this.data.shopId
      if (!shopId) {
        shopId = wx.getStorageSync('shopId');
      }
      var shop = wx.getStorageSync('shop')

      if (!shop) {
        console.log('分享进商品详情,无店铺缓存，shopId-----', shopId)
        if (shopId == undefined) {
          wx.redirectTo({
            url: '../scan/scan'
          })
        } else {
          util.getShop(loginRes.id, shopId).then(function (res) {
            _this.setData({
              shopInformation: res.data.data
            })
            //shop存入storage
            wx.setStorageSync('shop', res.data.data.shopInfo);
            //活动
            wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
            // 所有信息
            wx.setStorageSync('shopInformation', res.data.data);

          })
        }
      } else {
        console.log('分享进商品详情,有店铺缓存，shopId-----', shopId)
        if (shopId == undefined || shopId == '' || shopId == null) {
          if (shop.shopHomeConfig) {
            if (shop.shopHomeConfig.videoPathList.length != 0) {
              let videoInfo = {}
              videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
              videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
              wx.setStorageSync('videoInfo', videoInfo)
            }
          }
          let shopInformation = wx.getStorageSync('shopInformation')
          _this.setData({
            shopInformation: shopInformation
          })

        } else {
          if (shopId == shop.id) {
            if (shop.shopHomeConfig) {
              if (shop.shopHomeConfig.videoPathList.length != 0) {
                let videoInfo = {}
                videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
                videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
                wx.setStorageSync('videoInfo', videoInfo)
              }
            }
            let shopInformation = wx.getStorageSync('shopInformation')
            _this.setData({
              shopInformation: shopInformation
            })

          } else {
            wx.removeStorageSync('shop')
            wx.removeStorageSync('goodsInfos')
            wx.removeStorageSync('shopInformation')
            util.getShop(loginRes.id, shopId).then(function (res) {
              _this.setData({
                shopInformation: res.data.data
              })
              //shop存入storage
              wx.setStorageSync('shop', res.data.data.shopInfo);
              //活动
              wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
              // 所有信息
              wx.setStorageSync('shopInformation', res.data.data);

            })
          }
        }

      }
      wx.removeStorageSync('shopId');
    })
  },
  getDynamic:function(params){
    wx.showLoading({
      title: '加载中',
      icon:'none'
    })
    app.util.reqAsync('shop/getNewDynamicDetail', params).then((res) => {
      if(res.data.data){
        let data=res.data.data;
        data.dynamicUrl=data.dynamicUrl.split(',');
        this.setData({
          dynamic: res.data.data
        })
        wx.hideLoading();
      }
    }).catch((err) => {
      console.log(err);
      wx.hideLoading();
    })
  },
  goBack:function(){//回到首页
    wx.switchTab({
      url: '../../index/index?shopId=' + wx.getStorageSync('shopId')
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var imageList = this.data.dynamic.dynamicUrl;
    wx.previewImage({
      current: current,
      urls: imageList
    })
  },
  videoErrorCallback: function (e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})