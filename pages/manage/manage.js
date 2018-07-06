// pages/manage/manage.js
const app = getApp()

Page({
  data: {
    show:'dynamic',
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
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
      },
      {
        text: '云店账户',
        id: 'account'
      }
    ],
    currentTab: 0,
    navScrollLeft: 0
  },
  //事件处理函数
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
    })
    if(this.data.show=='dynamic'){
      this.selectComponent("#dynamic").onLoad();
    } else if (this.data.show == 'headline'){
      this.selectComponent("#headline").onLoad();
    } 
  },
  onReachBottom:function (){
    if (this.data.show == 'dynamic') {
      this.selectComponent("#dynamic").onReachBottom();
    } else if (this.data.show == 'headline') {
      // this.selectComponent("#headline").onReachBottom();
    } 
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