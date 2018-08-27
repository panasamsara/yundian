var app=getApp();
Page({
  data: {
    answerList:[],
    questionList:[],
    listData: { 
      questionId: "",
      createUser: "",
      pageSize: 10, 
      pageNo: 1 
    },
    answers:[],
    activeIndex:"",
    sendValue:"",
    total:""
  },
  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id;
    var newId = "listData.createUser";
    var quesId ="listData.questionId";
    this.setData({ [quesId]: options.id, activeIndex: options.activeIndex, [newId]: userId});
    this.getList();
  },
  getList: function () {
    wx.showLoading({
      title: '加载中',
    })
    var oldAnswers= this.data.answers;
    app.util.reqAsync('shop/getQuestionDetail', this.data.listData).then((res) => {
      var data = res.data.data;
      var newAnswer = [];
      var newQuestion = [];
      var newAnswers = oldAnswers.concat(data.questionDetail.answers);
      console.log(newAnswers);
      this.setData({
        answers: newAnswers
      })
      newQuestion.push(data.questionDetail);
      newAnswer.push(data.goodsInfo);
      var desc = ++this.data.listData.pageNo;
      var page = "listData.pageNo";
      this.setData({answerList:newAnswer,questionList: newQuestion, total: newQuestion[0].answerCount, [page]: desc });
      wx.hideLoading();
    }).catch((err) => {
      wx.hideLoading();
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  bindinput:function(e){
    var sendValue = e.detail.value;
    this.setData({ sendValue: sendValue})
  },
  send:function(){
    var desc = "listData.pageNo";
    this.setData({ [desc]: 1 });
    if (app.util.isEmpty(this.data.sendValue)){
      wx.showToast({
        title: '回答内容不能为空',
        icon:"none"
      })
    return;
    }
    app.util.reqAsync('shop/addAnswer',{
      content: this.data.sendValue,
      createUser: userId,
      questionId: this.data.listData.questionId
    }).then((res) => {
      this.getList();
      this.setData({ sendValue: "" });
    }).catch((err) => {
      wx.hideLoading()
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  onReachBottom: function () {
    var newpage = Math.ceil(this.data.total / this.data.listData.pageSize);
    if (this.data.listData.pageNo <= newpage) {
      wx.showLoading({
        title: '加载中',
      })
      this.getList();
    } else {
      wx.showToast({
        title: '到底了哦',
        icon: "none"
      })
    }
  },
  report:function(e){
    var creatUser= e.currentTarget.dataset.report;
    var answerId = e.currentTarget.dataset.id;
    if (creatUser == userId){
      wx.showToast({
        title: '自己不能举报自己哦',
        icon: "none"
      })
    }else{
      wx.showModal({
        title: '提示',
        content: '是否举报',
        success: function (res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
            })
            app.util.reqAsync('shop/addAnswerTip', {
              answerId: answerId,
              createUser: creatUser,
            }).then((res) => {
              console.log(res.data.msg);
              wx.hideLoading()
              wx.showToast({
                title: res.data.msg,
                icon: 'none'
              })
            }).catch((err) => {
              wx.hideLoading()
              wx.showToast({
                title: '失败……',
                icon: 'none'
              })
            })
          }
        }
      })
    }
  }
})