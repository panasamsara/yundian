// pages/store/dynamic/dynamic.js
const util = require('../../../utils/util.js')

// pages/appointment/modal/device-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    dynamicList: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      let data = {
        sStartpage: 1,
        shopId: 288,
        merchantId: 571,
        sPagerows: 10
      };
      this.setData({
        datas: data
      });
      this.getData(data);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function (res) {
      this.videoContext = wx.createVideoContext('myVideo');
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onReachBottom: function () {
      var totalPage = Math.ceil(this.data.total / 10);
      wx.showLoading({
        title: '加载中',
      })
      this.data.datas.sStartpage += 1;
      if (this.data.datas.sStartpage > totalPage) {
        wx.showToast({
          title: '已经到底了',
          icon: 'none'
        })
        return
      }
      let data = this.data.datas;
      this.getData(data);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    getData: function (data) {
      var oldData = this.data.dynamicList;
      util.reqAsync('circleBack/getVideoList', data).then((res) => {
        var dynamicList = res.data.data;
        for (var i = 0; i < dynamicList.length; i++) {
          dynamicList[i].videoAlbumTime = util.formatStoreDate(dynamicList[i].videoAlbumTime);
          dynamicList[i].index = i;
          dynamicList[i].mylength = dynamicList[i].urls.length;
        }
        var newData = oldData.concat(dynamicList);
        this.setData({
          dynamicList: newData,
          total: res.data.total
        })
        wx.hideLoading();
      }).catch((err) => {
        console.log(err);
      })
    },
    previewImage: function (e) {
      var current = e.target.dataset.src;
      var imageList = this.data.dynamicList[e.target.dataset.index].urls;
      wx.previewImage({
        current: current,
        urls: imageList
      })
    },
    videoErrorCallback: function (e) {
      console.log('视频错误信息:')
      console.log(e.detail.errMsg)
    }
  }
})