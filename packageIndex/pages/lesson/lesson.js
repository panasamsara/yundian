// packageIndex/pages/lesson/lesson.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [false, false],
    conditions: [[{ name: '全部' }, { name: '免费', isfree: 0 }, { name: '收费', isfree: 1 }], [{ name: '全部'}]],
    selected: [0, 0],
    arr: [],
    total: 0
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
    let i = event.currentTarget.dataset.i;
    let j = event.currentTarget.dataset.j;
    let selected = this.data.selected;
    selected[i] = j;
    this.setData({
      selected: selected,
      arr: []
    })
    this.getList()
  },
  // 关掉查询框
  closeBox: function () {
    this.setData({
      tabs: [false, false]
    })
  },
  // 获取分页列表
  getList: function(flag) {
    let arr_ = flag ? [] : this.data.arr;
    wx.showNavigationBarLoading();

    let selected = this.data.selected;
    let conditions = this.data.conditions;
    let params = {
      pageNo: parseInt(arr_.length / 10) + 1,
      pageSize: 10,
      shopId: wx.getStorageSync('shop').id,
      isfree: conditions[0][selected[0]].isfree,
      themeId: conditions[1][selected[1]].id
    }
    app.util.reqAsync('masterCourse/getCourseByCondition', params).then((res) => {
      if(res.data.code == 1) {
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
  // 获取专栏
  getThemes: function (){
    let params = {
      shopId: wx.getStorageSync('shop').id,
      source: 2
    }
    app.util.reqAsync('masterCourse/getThemes', params).then((res) => {
      if(res.data.code == 1) {
        let arr = this.data.conditions[1];
        arr = arr.concat(res.data.data);
        this.setData({
          'conditions[1]': arr
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getThemes();
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