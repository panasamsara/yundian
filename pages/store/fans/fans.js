// pages/store/fans/fans.js
const app=getApp();

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

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function () {
      wx.showLoading({
        title: '加载中',
      })
      let data = {
        userId: wx.getStorageSync('scSysUser').id,
        merchantId: wx.getStorageSync('shop').merchantId
      };
      this.getData(data);
    },
    getData: function (data) {
      app.util.reqAsync('fans/getFansTeamForShop', data).then((res) => {
        this.setData({
          datas:res.data.data,
        })
        wx.hideLoading();
      }).catch((err) => {
        console.log(err);
        wx.hideLoading();
      })
    }
  }
})
