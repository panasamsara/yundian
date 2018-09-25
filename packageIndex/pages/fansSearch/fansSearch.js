// packageIndex/pages/fansSearch/fansSearch.js
const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    search:false,
    searchStatus:'search',
    iconShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let params={
          detailId: 542,
          sStartpage: 1, 
          sPagerows: 10
        },
        allParams={
          detailId: 542,
          sStartpage: 1
        }
    this.setData({
      params: params
    })
    //获取粉小组数据
    this.getData(params);
    this.getData(allParams);
  },
  getData:function(params){//获取粉小组数据
    if (params.sPagerows){//获取十条数据
      let oldList = this.data.list;
      app.util.reqAsync('fans/getFasnGroup', params).then((res) => {
        if (res.data.data) {
          let newList = oldList.concat(res.data.data);
          this.setData({
            list: newList,
            total: res.data.total
          })
        }
        wx.hideLoading();
      }).catch((err) => {
        console.log(err);
        wx.hideLoading();
      })
    }else{//获取全部数据
      app.util.reqAsync('fans/getFasnGroup', params).then((res) => {
        if(res.data.data){
          this.setData({
            allData:res.data.data
          })
        }
      }).catch((err) => {
        console.log(err);
      })
    }
  },
  onReachBottom: function () {//上拉加载
    if(this.data.searchStatus=='search'){
      let total = Math.ceil(this.data.total / 10);
      this.data.params.sStartpage += 1
      if (this.data.params.sStartpage <= total) {
        wx.showLoading({
          title: '加载中',
          icon: 'none'
        })
        let params = this.data.params;
        this.getData(params);
      } else {
        wx.showToast({
          title: '已经到底了',
          icon: 'none'
        })
        return
      }
    }
  },
  change:function(){//出现搜索按钮
    this.setData({
      search:true
    })
  },
  changeBack:function(){//隐藏搜索按钮
    if(this.data.iconShow==false){
      this.setData({
        search:false
      })
    }
  },
  clear:function(){//清空
    this.setData({
      key:'',
      iconShow:false
    })
  },
  hotSearch:function(e){//热搜索
    if(e.detail.value){
      this.setData({
        key: e.detail.value.replace(/\s+/g, ''),
        iconShow: true
      })
    }else{
      this.setData({
        iconShow:false
      })
      return
    }
    this.setData({
      searchFrom: 'input'
    })
    this.getList(this.data.key);
  },
  search:function(){//搜索
    this.setData({
      searchFrom: 'btn'
    })
    if(!this.data.key||this.data.key==''){
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return
    }
    this.getList(this.data.key);
  },
  getList:function(key){//搜索公共方法
    if(this.data.searchFrom=='btn'){
      wx.showLoading({
        title: '搜索中',
        icon: 'none'
      });
      setTimeout(function () {
        wx.hideLoading();
      }, 500)
    }
    let allData = this.data.allData,
        newList = [];
    for (let i = 0; i < allData.length; i++) {
      if (allData[i].detailName.indexOf(key) > -1) {
        newList.push(allData[i]);
      }
    }
    this.setData({
      list: newList,
      searchStatus: 'searched'
    })
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})