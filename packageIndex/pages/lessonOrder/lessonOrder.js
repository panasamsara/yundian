// packageIndex/pages/lessonOrder/lessonOrder.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arr: [],
    total: 0
  },
  getList: function (flag) {
    let arr_ = flag ? [] : this.data.arr;
    wx.showNavigationBarLoading();

    let selected = this.data.selected;
    let conditions = this.data.conditions;
    let params = {
      pageNo: parseInt(arr_.length / 10) + 1,
      pageSize: 10,
      source: 2,
      type: 1,
      shopId: wx.getStorageSync('shop').id,
      userId: wx.getStorageSync('scSysUser').id
    }
    app.util.reqAsync('masterCourse/getMyRecordByCondition', params).then((res) => {
      if (res.data.code == 1) {
        this.setData({
          arr: arr_.concat(res.data.data),
          total: res.data.total
        })
      } else {
        wx.showToast({ title: res.data.msg || '加载失败！', icon: 'none' })
      }
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  },
  // 跳转到详情界面
  toDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/packageIndex/pages/lessonDetail/lessonDetail?id=' + id,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList()
  },
  onPullDownRefresh: function () {
    this.getList(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.total > this.data.arr.length) this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})