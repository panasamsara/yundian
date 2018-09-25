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
      this.setData({
        shopName: wx.getStorageSync('shop').shopName
      })
      wx.showLoading({
        title: '加载中',
      })
      var data = {
        pageNo: 1,
        shopId: wx.getStorageSync('shop').id,
        userId: wx.getStorageSync('scSysUser').id,
        pageSize: 10
      };
      this.setData({
        datas: data
      });
      this.getData(data);
    },
    onReachBottom: function () {
      var totalPage = Math.ceil(this.data.total / 10);
      wx.showLoading({
        title: '加载中',
      })
      this.data.datas.pageNo += 1;
      if (this.data.datas.pageNo > totalPage) {
        wx.showToast({
          title: '已经到底了',
          icon: 'none'
        })
        return
      }
      let data = this.data.datas;
      this.getData(data);
    },
    onPullDownRefresh: function () {
      this.setData({
        list:[]
      })
      this.onLoad();
      wx.stopPullDownRefresh();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    getData: function (data) {
      var oldData = this.data.list;
      app.util.reqAsync('shop/getNewDynamic', data).then((res) => {
        if(res.data.data.length>0){
          var list = res.data.data;
          for (var i = 0; i < list.length; i++) {//时间格式处理,发布资源格式处理
            list[i].gmtCreate = app.util.formatStoreDate(list[i].gmtCreate);
            list[i].index = i;
            list[i].dynamicUrl = list[i].dynamicUrl.split(',');
            list[i].mylength = list[i].dynamicUrl.length;
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
      var imageList = this.data.list[e.target.dataset.index].dynamicUrl;
      wx.previewImage({
        current: current,
        urls: imageList
      })
    },
    videoErrorCallback: function (e) {
      console.log('视频错误信息:')
      console.log(e.detail.errMsg)
    },
    goDynamic:function(e){//跳转动态详情
      let dynamicId=e.currentTarget.dataset.dynamicid;
      wx.navigateTo({
        url: '../store/dynamicInfo/dynamicInfo?dynamicId='+dynamicId
      })
    }
  }
})