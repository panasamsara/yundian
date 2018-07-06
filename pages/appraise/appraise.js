// pages/appraise/appraise.js
//获取应用实例
const app = getApp();
Page({
  data: {
    hideView:true,
    num:0,
    shopId:'',
    goodsId:'',
    //用户信息
    userData:[],
  },
  //公用方法
  getData:function (type){
    var parm={
      type: 0,
      hasPicture: 0,
      shopId: this.data.shopId,
      goodsId: this.data.goodsId,
      pageNo: 1,
      pageSize: 20,
      viewType: type      
    };
    app.util.reqAsync('shop/commentList',parm).then((res)=>{
      var data = res.data.data;
      for (var i = 0; i < data.length; i++) {
        var key = 'creatTime';
        var value = data[i].commentDate.slice(0, 11)
        data[i][key] = value
      };
      this.setData({
        userData: data
      }) ;
      //判断数据并显示隐藏占位图
      if(this.data.userData.length==0){
        this.setData({
          hideView:false
        })
      } else {
        this.setData({
          hideView:true
        })
      }   
    })
  },
  //点击切换
  chose: function (e) {
    this.getData(e.currentTarget.dataset.type);
    this.setData({
       num: e.currentTarget.dataset.type
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取评论列表
    this.data.shopId = 808;//options.shopId
    this.data.goodsId = 2117;//options.goodsId
    this.getData(0);

    //获取商品各种评论数
    app.util.reqAsync('shop/getGoodsKindsCommentNum',{
      shopId: 808,//options.shopId
      goodsId: 2117 //options.goodsId
    }).then((res)=>{
      var resData=res.data.data
      this.setData({
        all:resData.all,
        nice: resData.nice,
        medium: resData.medium,
        negative: resData.negative,
        hasPic: resData.hasPic
      })
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
  
  }
})