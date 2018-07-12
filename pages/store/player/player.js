// pages/store/player/player.js
const app = getApp();

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
    list:[]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad:function(){
      wx.showLoading({
        title: '加载中',
      })
      let data = {
        sStartpage: 1,
        currUserId: wx.getStorageSync('scSysUser').id,
        shopId: wx.getStorageSync('shop').id,
        sPagerows: 10
      };
      console.log(wx.getStorageSync('shop').id,wx.getStorageSync('scSysUser').id)
      this.setData({
        datas:data
      });
      this.getData(data);
    },
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
    getData:function(data){
      console.log(data)
      var oldData = this.data.list;
      app.util.reqAsync('circle/getCircleByShopId', data).then((res) => {
        if(res.data.data){
          var list = res.data.data;
          var newData = oldData.concat(list);
          this.setData({
            list: newData,
            total: res.data.total
          })
        }
        wx.hideLoading();
      }).catch((err) => {
        console.log(err);
        wx.hideLoading();
      })
    }
  }
})
