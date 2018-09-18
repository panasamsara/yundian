// pages/manage/manage.js
const app = getApp()

Page({
  data: {
    show:'dynamic',
    navData: [
      {
        text: '云店动态',
        id:'dynamic'
      },
      {
        text: '云店头条',
        id: 'headline'
      },
      {
        text: '云店玩家圈',
        id: 'player'
      },
      {
        text: '云店粉团队',
        id: 'fans'
      }
    ],
    currentTab: 0
  },
  //事件处理函数
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    if(options&&options.url){
      this.setData({
        show: options.url,
        currentTab: options.index
      })
    }
    this.selectComponent('#' + this.data.show).onLoad();
  },
  onReachBottom:function (){
    this.selectComponent('#' + this.data.show).onReachBottom();
  },
  onPullDownRefresh: function () {
    this.selectComponent('#' + this.data.show).onPullDownRefresh();
  },
  switchNav(event) {
    var cur = event.currentTarget.dataset.current,
        flag = event.currentTarget.id;
    if (this.data.currentTab == cur) {
      return false;
    } else {
      this.setData({
        currentTab: cur,
        show:flag
      })
    }
    wx.showLoading({
      title: '加载中',
    })
    this.onLoad();
  }
})