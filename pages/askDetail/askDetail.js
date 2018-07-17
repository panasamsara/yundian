// pages/askDetail/askDetail.js
const app = getApp();
Page({

  data: {
    myAswer:'',
    tips:'',
    flag:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      questionId: options.questionId,
      userId: options.userId
    });
    app.util.reqAsync('shop/getQuestionDetail',{
      questionId: options.questionId,// ,
      userId: options.userId,
      pageNo :1,
      pageSize :''     
    }).then((res)=>{
      var data=res.data.data;
      if (data.questionDetail.answers.length == 0) {
        this.setData({
          flag: true
        })
      }else{
        this.setData({
          flag:false
        });
      };
      this.setData({
        picImg: data.goodsInfo.pictureUrl,
        goodSName: data.goodsInfo.goodsName,
        descTitle: data.goodsInfo.descTitle,
        content: data.questionDetail.content,
        answerCount: data.questionDetail.answerCount,
        answerData: data.questionDetail.answers
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
      questionId: this.data.questionId,
      createUser: this.data.userId,
      content:this.data.myAswer,
      anonymous:0
    }).then((res)=>{
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

})