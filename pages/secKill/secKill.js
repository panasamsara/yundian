// pages/secKill/secKill.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let data={
      pageNo: 1,
      pageSize: 10,
      shopId: wx.getStorageSync('shop').id,
      status: 1  
    };
    this.setData({
      datas:data
    });
    this.getData(data);
    let _this=this
    var timer=setInterval(function(){_this.count()},1000)
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
    let totalPage = Math.ceil(this.data.total / 10);
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
  getData:function(data){
    let oldData = this.data.list
    app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
      if(res.data){
        this.setData({
          nowTime: res.data.data
        })
      }
    }).catch((err)=>{
        console.log(err)
    })
    app.util.reqAsync('shopSecondskilActivity/selectPageList', data).then((res) => {
      if (res.data.data) {
        let list=res.data.data.list,
            newData = oldData.concat(list);
        for(let i=0;i<list.length;i++){
          list[i].activityStartTime = Date.parse(this.data.nowTime);
          list[i].activityEndTime = Date.parse(list[i].activityEndTime);
          list[i].count = list[i].activityEndTime - list[i].activityStartTime;
        }
        this.setData({
          list: newData,
          total: res.data.data.total
        })
      }
      wx.hideLoading();
    }).catch((err) => {
      console.log(err);
      wx.hideLoading();
    })
  },
  count:function(){
    let _this=this;
    for(let i=0;i<this.data.list.length;i++){
      let leftTime=this.data.list[i].count;
          leftTime-=1000;
      if (leftTime <= 0) {
        leftTime = 0;
      }
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
          h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
          m = Math.floor(leftTime / 1000 / 60 % 60),
          s = Math.floor(leftTime / 1000 % 60),
          rh=d*24+h,
          count = "list[" + i + "].count",
          rhCount = "list[" + i + "].rh",
          mCount = "list[" + i + "].m",
          sCount = "list[" + i + "].s";
      if(rh<10){
        rh="0"+rh;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        [count]:leftTime,
        [rhCount]:rh,
        [mCount]:m,
        [sCount]:s
      })
    }
  }
})