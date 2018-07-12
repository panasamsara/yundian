// pages/askDetail/askDetail.js
const app = getApp();
Page({

  data: {
    myAswer:'',
    tips:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.util.reqAsync('shop/getQuestionDetail',{
      questionId: '5b4402c944f4ddd5889da30a',// options.questionId,
      userId :198 ,
      pageNo :1,
      pageSize :10     
    }).then((res)=>{
      var data=res.data.data;
      console.log(data)
      this.setData({
        picImg: data.goodsInfo.pictureUrl,
        goodSName: data.goodsInfo.goodsName,
        descTitle: data.goodsInfo.descTitle,
        content: data.questionDetail.content
      })
    })
  
  },
  //获取回答
  inputvalue(e){
    this.setData({
      myAswer: e.detail.value
    })
  },

  //添加回答
  addAswer(){
    app.util.reqAsync('shop/addAnswer',{
      id:2117,
      questionId:'5b4402c944f4ddd5889da30a',
      createUser: 198,
      content:this.data.myAswer,
      anonymous:0
    }).then((res)=>{
      console.log(res)
      this.setData({
        tips:res.data.msg,
        myValue:''
      });
      wx.showModal({
        title: this.data.tips,
        icon: 'none',
        duration: 2000
      });       
    })

  },
  //点赞回答
  // dianzan(){
  //   app.util.reqAsync('shop/addAnswerLike',{
  //     answerId:'5b4402c944f4ddd5889da30a',
  //     userId:198
  //   }).then((res)=>{
  //     console.log(res)
  //   })
  // },

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