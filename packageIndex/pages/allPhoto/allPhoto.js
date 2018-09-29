const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataJson:{ 
      "sStartpage": 1, 
      "type": "",
      "albumId": "",
      "sPagerows": 20, 
      "circleId": "" 
    },
    albumList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var albumId ="dataJson.albumId";
    var circleId = "dataJson.circleId";
    this.setData({
      [albumId]: options.albumId,
      [circleId]: options.circleId
    })
    wx.setNavigationBarTitle({ title: options.albumName});
    this.detail();
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

  detail: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('circle/getFansPhonesDetail', this.data.dataJson).then((res) => {
      var imgArr=[];
      for (var i in res.data.data){
        imgArr.push(res.data.data[i].url)
      }
      console.log("imgArr",imgArr)
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          albumList: res.data.data,
        })
      }
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  previewImage: function (e) {
    var current = e.target.dataset.src;
    var index = e.target.dataset.index;
    var imgArr = [];
    var albumListNew = this.data.albumList;
    for (var i = 0; i <albumListNew.length; i++) {
      imgArr.push(albumListNew[i]["url"]);
    }
    wx.previewImage({
      current: current,
      urls: imgArr
    })
  },
})