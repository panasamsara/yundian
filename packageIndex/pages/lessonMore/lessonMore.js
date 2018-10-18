// packageIndex/pages/lesson/lesson.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [false, false],
    selected: [0, 0],
    arr: [],
    total: 0,
    flagtype: "" //判断是限时试听进入，还是智经营及后面的进入
  },
  // 获取分页列表
  getList: function(flag) {
    let arr_ = flag ? [] : this.data.arr;
    wx.showNavigationBarLoading();
    let params = {
      pageNo: parseInt(arr_.length / 10) + 1,
      pageSize: 10,
      shopId: this.data.shopId
    }
    if (this.data.flagtype==0){
      params.isfree = this.data.free;
    } else if (this.data.flagtype == 1){
      params.themeId = this.data.id;
    }
   
    app.util.reqAsync('masterCourse/getCourseByCondition', params).then((res) => {
      if(res.data.code == 1) {
        console.log("res", res)
        this.setData({
          arr: arr_.concat(res.data.data),
          total: res.data.total
        })
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
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
    if (options.free) {
      this.setData({
        free: options.free,
        flagtype:0
      })
      console.log(1111);
      console.log(this.data.free);
    } else if (options.id) {
      this.setData({
        id: options.id,
        flagtype: 1
      })
    }
    this.getList();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList(true)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.total > this.data.arr.length) this.getList()
  },

})