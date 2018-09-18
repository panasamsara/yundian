// pages/store/headline/headline.js
const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [],
    blank:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      wx.showLoading({
        title: '加载中',
      })
      let data={
        shopId: wx.getStorageSync('shop').id,
        pageNo: 1,
        pageSize: 10
      };
      this.setData({
        datas: data
      })
      this.getData(data);
    },
    onReachBottom: function () {
      var totalPage = Math.ceil(this.data.total / 10);
      wx.showLoading({
        title: '加载中',
      })
      this.data.datas.pageNo += 1;
      if (this.data.datas.pageNo > totalPage) {
        wx.showToast({
          title: '已经到底了',
          icon: 'none'
        })
        return
      }
      let data = this.data.datas;
      this.getData(data);
    },
    onPullDownRefresh: function () {
      this.setData({
        list:[]
      })
      this.onLoad();
      wx.stopPullDownRefresh();
    },
    getData:function(data){
      var oldData = this.data.list;
      app.util.reqAsync('shop/shopHomeArticles', data).then((res) => {
        if(res.data.data.length>0){
          var list = res.data.data;
          var newData = oldData.concat(list);
          for (var i = 0; i < list.length; i++) {
            if (list[i].articleTitle.length > 22) {
              list[i].articleTitle = list[i].articleTitle.substring(0, 22) + '...';
            }
            if (list[i].articleContent != null && list[i].articleContent.length > 52) {
              list[i].articleContent = list[i].articleContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ').replace(/&nbsp;/g, '').substring(0, 52) + '...';
            }
          }
          this.setData({
            list: newData,
            total: res.data.total
          })
        }else{
          this.setData({
            blank:true
          })
        }
        wx.hideLoading();
      }).catch((err) => {
        console.log(err);
        wx.hideLoading();
      })
    },
    skip:function(e){
      var articleId = e.currentTarget.dataset.articleid;
      wx.navigateTo({
        url: '../../../../../packageIndex/pages/articleDetail/articleDetail?articleId=' + articleId,
      })
    }
  }
})
