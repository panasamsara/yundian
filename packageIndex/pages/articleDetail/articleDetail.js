const app = getApp();
Page({

  data: {
    articleId:"",
    userId:"",
    articleDetail:{}
  },

  onLoad: function (options) {
    var userId = wx.getStorageSync('scSysUser').id
    this.setData({ articleId: options.articleId, userId: userId})
  },

  onReady: function () {
  
  },

  onShow: function () {
    this.articleDetail();
  },

  onHide: function () {
  
  },
  articleDetail:function(){
    var data= {
      "userId": this.data.userId,
      "articleId": this.data.articleId
    };
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('cms_new/queryArticleDetail', data).then((res) => {
      wx.hideLoading();
      if(res.data.code==1){
        res.data.data.articleContent = res.data.data.articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, ' ');
        this.setData({
          articleDetail: res.data.data
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
  onShareAppMessage: function () {
  
  }
})