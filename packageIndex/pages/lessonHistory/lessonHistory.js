// packageIndex/pages/lessonHistory/lessonHistory.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arr: [],
    total: 0
  },
  timeAgo: function (time) {
    let duration = new Date().getTime() - new Date(time.replace(/-/g, '/')).getTime();
    let days = duration / 86400000;
    if (days < 1) return '今天';
    if (days < 2) return '昨天';
    if (days < 3) return '三天前';
    if (days < 7) return '一周前';
    if (days < 30) return '一月前';
    if (days < 180) return '半年前';
    if (days < 365) return '一年前';
    if (days < 730) return '两年前';
    if (days < 1095) return '三年前';
    return '很久前';
  },
  // flag，true，表示初始化
  getList: function (flag) {
    wx.showNavigationBarLoading();
    let arr_ = flag? []: this.data.arr;
    let selected = this.data.selected;
    let conditions = this.data.conditions;
    let params = {
      pageNo: parseInt(arr_.length/10) + 1,
      pageSize: 10,
      source: 2,
      type: 2,
      shopId: wx.getStorageSync('shop').id,
      userId: wx.getStorageSync('scSysUser').id
    }
    app.util.reqAsync('masterCourse/getMyRecordByCondition', params).then((res) => {
      if (res.data.code == 1) {
        let arr = arr_.concat(res.data.data);
        let lastTimeAgo = '';
        for (let i = 0; i < arr.length; i++){
          let ta = this.timeAgo(arr[i].createTime);
          // 对比上一个timeAgo，若相同，则省略该字段
          if (lastTimeAgo == ta) {
            arr[i].timeAgo = ''
          } else {
            arr[i].timeAgo = ta;
            lastTimeAgo = ta
          }
        }
        this.setData({
          arr: arr,
          total: res.data.total
        })
      } else {
        wx.showToast({ title: res.data.msg || '加载失败！', icon: 'none' })
      }
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.total > this.data.arr.length) this.getList()
  }
})