// packageIndex/pages/fansActivity/fansActivity.js
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
      id: options.id || 1084,
      userId: wx.getStorageSync('scSysUser').id
    };
    //获取活动数据
    this.getData(params);
  },
  getData:function(params){
    app.util.reqAsync('fans/getActivityDetailNew', params).then((res) => {
      if (res.data.data) {
        let data=res.data.data;
        if (data.detailEndTime){//时间格式处理
          data.detailEndTime=data.detailEndTime.split(' ')[0];
        }
        if(data.detail!='' && data.detail!=null){//富文本编辑器处理
          data.detail = data.detail.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/background-color[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ').replace(/<s>/gi, "").replace(/<u>/gi, '').replace(/<\/s>/gi, '').replace(/<\/u>/gi, '');
        }
        this.setData({
          data: res.data.data
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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