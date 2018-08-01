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
      statusList: '0,1', //0 未开启/ 1 进行中/2 已结束/3 已关闭  （String）
      shopId: wx.getStorageSync('shop').id, //商铺id  
      merchantId: wx.getStorageSync('shop').merchantId, //商户id
      goodsId:""
    };
    this.setData({
      datas:data
    });
    this.getData(data);
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
          list[i].nowTime = Date.parse(app.util.formatIOS(this.data.nowTime));
          list[i].activityStartTime = Date.parse(app.util.formatIOS(list[i].activityStartTime));
          list[i].activityEndTime = Date.parse(app.util.formatIOS(list[i].activityEndTime));
          if (list[i].nowTime - list[i].activityStartTime<0){//活动未开始
            list[i].count = list[i].activityStartTime - list[i].nowTime;
            list[i].status = 0
          }else{//活动已开始
            list[i].count = list[i].activityEndTime - list[i].nowTime;
            list[i].status = 1
          }   
        }
        this.setData({
          list: newData,
          total: res.data.data.total
        })
        console.log(this.data.list)
      }
      wx.hideLoading();
      let _this = this
      setInterval(function () {
        _this.count()
      }, 1000)
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
          count = "list[" + i + "].count",
          dCount = "list[" + i + "].d",
          hCount = "list[" + i + "].h",
          mCount = "list[" + i + "].m",
          sCount = "list[" + i + "].s";
      if(h<10){
        h="0"+h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        [count]:leftTime,
        [dCount]:d,
        [hCount]:h,
        [mCount]:m,
        [sCount]:s
      })
    }
  }
})