// packageIndex/pages/lesson/lesson.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //轮播专用开始
    indicatorDots: false,
    vertical: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    indicatorColor: "rgba(204,204,204,1)",//滑动圆点颜色
    indicatorActiveColor: "rgba(59,130,238,1)", //当前圆点颜色,
    currentSwiper: 0,
    //轮播专用结束,
    arr:[],
    activeIndex:"0",
    capacityList:[],
    scrollTop:0
  },
  swiperChange: function (e) {
    this.setData({
      currentSwiper: e.detail.current
    })
  },
  // 轮播图接口
  getCarousel: function(flag) {
    app.util.reqAsync('masterCourse/getSharpCourses', { "shopId": this.data.shopId}).then((res) => {
      if(res.data.code == 1) {
        this.setData({
          arr: res.data.data,
        })
        console.log(res.data.data)
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
    })
  },
  //学习历史接口
  getStudy: function (flag) {
    let params = {
      pageNo: 1,
      pageSize: 4,
      source: 2,
      type: 2,
      shopId: wx.getStorageSync('shop').id,
      userId: wx.getStorageSync('scSysUser').id
    }
    app.util.reqAsync('masterCourse/getMyRecordByCondition', params).then((res) => {
      console.log(res.data.data)
      if (res.data.code == 1) {
        this.setData({
          historyList: res.data.data,
        })
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
    })
  },
  // 限时试听
  limitlistening:function(){
    let params = {
      "pageNo": "1",
      "isfree": "0",
      "pageSize": "5",
      "shopId": this.data.shopId,
      "keyword": ""
    }
    app.util.reqAsync('masterCourse/getCourseByCondition', params).then((res) => {
      if (res.data.code == 1) {
        this.setData({
          limitlistening: res.data.data,
        })
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
    })
  },
  //智经营
  capacityList: function () {
    let params = {
      "shopId":this.data.shopId,
      "pageSize":20             
    }
    app.util.reqAsync('masterCourse/index', params).then((res) => {
      if (res.data.code == 1) {
        let Data = res.data.data;
        //筛选出数组中courses为空的的,避免滚动监听的时候报错
        for (var i in Data){
          if (Data[i].courses.length==0){
            Data.splice(i,1)
          }
        }
        this.setData({
          capacityList: Data,
        })
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
    })
  }, 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shopId=wx.getStorageSync("shop").id;
    this.setData({
      shopId: shopId,
    })
    this.getCarousel();
    this.getStudy();
    this.limitlistening();
    this.capacityList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },
  onPageScroll:function(e){
      this.setData({
        scrollTop: e.scrollTop //页面滚动的距离
      })
    let _this = this;
    let query = wx.createSelectorQuery();
    query.selectAll(".management").boundingClientRect();
    query.exec((rect)=>{
      let testArr = rect[0];
      let index=0;
      let fixed = testArr[0].top < 100;
      testArr.forEach((v, i) => {
        if (v.top < 100) {
          console.log(i);
          index = i
        };
      })
      if (fixed) {
        this.setData({
          fixed: true,
          activeIndex:index,
        })
      }else{
        this.setData({
          fixed: false,
          activeIndex: 0,
        })
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  scrollTo:function(e){
    let id = e.currentTarget.dataset.id;
    console.log(id);
    let index = e.currentTarget.dataset.index;
    let scrollTop = this.data.scrollTop || 0;
    this.setData({
      activeIndex:index
    })
    let query = wx.createSelectorQuery();
    query.select(id).boundingClientRect((rect) => {
      let  top = rect.top
      wx.pageScrollTo({
        scrollTop: this.data.scrollTop + top - 88
      })
    }).exec();
  }
})