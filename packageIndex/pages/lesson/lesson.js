// packageIndex/pages/lesson/lesson.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [false, false],
    conditions: [['全部', '免费', '收费'], ['全部', '妮说美业', '人事客项钱']],
    selected: { index: 0, data: '' }
  },
  // 切换点击按钮,
  changeTabs: function (event){
    let i = event.currentTarget.dataset.i;
    let tabs = [false, false];
    tabs[i] = !this.data.tabs[i];
    this.setData({
      tabs: tabs
    })
  },
  // 切换选择条件
  changeSelect: function (event) {
    let i = event.currentTarget.dataset.s_i;
    let data = event.currentTarget.dataset.s_d;
    this.setData({
      selected: { index: i, data: data }
    })
    // TODO
  },
  // 关掉查询框
  closeBox: function () {
    this.setData({
      tabs: [false, false]
    })
  },

  // 获取分页列表
  getList: function() {
    let params = {
      pageNo: 1,
      pageSize: 10
    }
    app.util.reqAsync('masterCourse/backstageCourses', params).then((res) => {
      if (res.data.data.userCreditsInfo) {
        this.setData({
          usablePoint: res.data.data.userCreditsInfo.usablePoint
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  // 获取专栏
  getCourses: function (){
    let params = {
      shopId: wx.getStorageSync('shop').id
    }
    app.util.reqAsync('masterCourse/', params).then((res) => {
      if (res.data.data.userCreditsInfo) {
        this.setData({
          usablePoint: res.data.data.userCreditsInfo.usablePoint
        })
      }
    })
  },
  toDetail: function () {
    wx.navigateTo({
      url: '../lessonDetail/lessonDetail'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})