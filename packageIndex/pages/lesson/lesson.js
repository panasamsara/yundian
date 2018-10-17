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
    capacityList:[]
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
      "plant": 1,              
    }
    app.util.reqAsync('masterCourse/index', params).then((res) => {
      if (res.data.code == 1) {
        let Data = res.data.data;
        //新建一个数组，为滚动加载时候循环遍历做准备
        let scrollArr=[];
        for (var i in Data){
          if (Data[i].name == "智经营"){
            scrollArr.push({
              name:"智经营",
              id:"#aptitude",
            })
          } else if (Data[i].name == "门店培优"){
            scrollArr.push({
              name: "门店培优",
              id: "#shopexcellent",
            })
          } else if (Data[i].name == "人事客项钱") {
            scrollArr.push({
              name: "人事客项钱",
              id: "#peopleThing",
            })
          } else if (Data[i].name == "六脉粉神剑") {
            scrollArr.push({
              name: "六脉粉神剑",
              id: "#excalibur",
            })
          }
        }
        scrollArr[0].flag=1;
        this.setData({
          capacityList: Data,
          scrollArr: scrollArr
        })
        console.log("scrollArr",scrollArr)
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
      shopId: shopId
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
    let _this = this;
    let scrollArr=this.data.scrollArr;
    let query = wx.createSelectorQuery();
    query.selectAll(".management").boundingClientRect();
    query.exec((rect)=>{
      let testArr = rect[0];
      let index=0;
      let fixed = testArr[0].top < 88;
      testArr.forEach((v, i) => {
        if (v.top < 88) index = i;
      })
      if (fixed) {
        this.setData({
          fixed: true,
          activeIndex:index,
          scrollTop: e.scrollTop //页面滚动的距离
        })
      }else{
        this.setData({
          fixed: false,
          activeIndex: 0,
          scrollTop: e.scrollTop //页面滚动的距离
        })
      }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  scrollTo:function(e){
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let scrollTop = this.data.scrollTop || 0;
    let height = this.data.height || 0;
    this.setData({
      activeIndex:index
    })
    console.log(id)
    let query = wx.createSelectorQuery();
    let top=0;
    query.select(id).boundingClientRect((rect) => {
      top = rect.top
      wx.pageScrollTo({
        scrollTop: this.data.scrollTop + top-44
      })
    }).exec();
  }
})