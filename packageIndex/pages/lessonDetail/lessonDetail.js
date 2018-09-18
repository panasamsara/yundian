Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabActive: [1, 0, 0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({ height: res.windowHeight})
      }
    })
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

  },
  // 滚动监听
  onPageScroll: function (obj) {
    // 已滚动留着备用
    let scrollTop = obj.scrollTop;
    const query = wx.createSelectorQuery();
    let height = this.data.height || 0;
    // 滚动监听部分元素，以固定tab栏目，确定tab栏目active内容
    query.selectAll('#lesson-content, #teacher, #student').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      let fixed = res[0][0].bottom < 0;
      let activeTab = [1, 0, 0];
      if (res[0][1].top < height - 100) activeTab = [0, 1, 0];
      if (res[0][2].top < height - 100) activeTab = [0, 0, 1];
      this.setData({
        fixed: res[0][0].bottom < 1,
        tabActive: activeTab,
        scrollTop: scrollTop
      })
    })
  },
  // 点击滚动
  scrollTo: function(e){
    let scrollTop = this.data.scrollTop || 0;
    let height = this.data.height || 0;
    let id = e.currentTarget.dataset.id;
    const query = wx.createSelectorQuery();

    query.select('#'+ id).boundingClientRect((rect) => {
      let scroll = id == 'lesson-content' ? (rect.top + scrollTop + rect.height) : (rect.top + scrollTop - 45);
      wx.pageScrollTo({
        scrollTop: scroll
      })
    }).exec();
  }
})