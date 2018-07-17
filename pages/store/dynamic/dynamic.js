// pages/store/dynamic/dynamic.js
const app = getApp();

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
    list: [],
    blank:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      wx.showLoading({
        title: '加载中',
      })
      var data = {
        sStartpage: 0,
        shopId: wx.getStorageSync('shop').id,
        merchantId: wx.getStorageSync('shop').merchantId,
        sPagerows: 10
      };
      this.setData({
        datas: data
      });
      this.getData(data);
    },
    onReachBottom: function () {
      var totalPage = Math.ceil(this.data.total / 10-1);
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
      var oldData = this.data.list;
      app.util.reqAsync('circleBack/getVideoList', data).then((res) => {
        if(res.data.data){
          var list = res.data.data;
          for (var i = 0; i < list.length; i++) {
            list[i].videoAlbumTime = app.util.formatStoreDate(list[i].videoAlbumTime);
            list[i].index = i;
            list[i].mylength = list[i].urls.length;
          }
          var newData = oldData.concat(list);
          this.setData({
            list: newData,
            total: res.data.total
          })
        }else{
          this.setData({
            blank:true
          })
        }
        wx.hideLoading();
      }).catch((err) => {
        console.log(err);
        wx.hideLoading();
      })
    },
    previewImage: function (e) {
      var current = e.target.dataset.src;
      var imageList = this.data.list[e.target.dataset.index].urls;
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