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
    list:[],
    blank:false
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
        page: 0,
        shopId: wx.getStorageSync('shop').id,
        row: 10
      };
      this.setData({
        datas:data
      });
      this.getData(data);
    },
    onReachBottom: function () {
      var totalPage = Math.ceil(this.data.total / 10 - 1);
      wx.showLoading({
        title: '加载中',
      })
      this.data.datas.page += 1;
      if (this.data.datas.page > totalPage) {
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
        list: []
      })
      this.onLoad();
      wx.stopPullDownRefresh();
    },
    getData:function(data){//获取云店玩家圈动态
      var oldData = this.data.list;
      app.util.reqAsync('circle/listAllCircleInfo', data).then((res) => {
        console.log(res.data.data)
        if(res.data.data.length>0){
          var list = res.data.data;
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
    }
  }
})
