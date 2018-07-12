// pages/ask/ask.js
//获取应用实例
const app = getApp();
Page({
  data: {
    myValue:'',
    askData:[],
    placeholder:'向买过的人提问',
    tips:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');
    app.util.reqAsync('shop/getGoodsQuestions',{
      shopId: 808,//options.shopId
      goodsId: 2117,//options.goodsId
      pageNo:1,
      pageSize:20
    }).then((res) =>{
      var data = res.data.data
      // console.log(data)
      for(var i=0;i<data.length;i++){
        var key ='time';
        var value = data[i].createTime.slice(0,11)
        data[i][key]=value;
      };
      if(data.answers==null){
        this.setData({
           isShow1:true,
           isShow2:true
        })
      }
      this.setData({
        askAcount:res.data.total,
        askData:data,
        picImg: data[0].goodsPic
      })
    }) 
     
  },
  //跳转到问题详情页
  tosakDetail(e){
    // console.log(e)
    var questionId = e.currentTarget.dataset.questionid;
    wx.navigateTo({
      url: '/pages/askDetail/askDetail?questionId=' + questionId +'&userId='+198,
    })
  },
  //获取input框的内容
  inputvalue(e){
    this.setData({
      myValue:e.detail.value
    })
  },
  //提交我的问答
  myAsk(){
    var shop = wx.getStorageSync('shop');
    var parm={
      shopId: 808,
      goodsId:'2117',
      content: this.data.myValue,
      createUser: 198
    };
    app.util.reqAsync('shop/addQuestion',parm).then((res) =>{
      this.setData({
        placeholder:'向买过的人提问',
        myValue:'',
        tips:res.data.msg
      })
      wx.showModal({
        title: this.data.tips,
        icon:'none',
        duration: 2000
      });      
    })
  },
//下拉刷新
  onPullDownRefresh:function(){
    console.log('haha')
    var that=this;
    wx.showNavigationBarLoading()//在标题栏中显示加载
    setTimeout(function(){
      that.onLoading();
      wx.hideNavigationBarLoading()//完成停止加载
    },1500)
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