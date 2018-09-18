// packageIndex/pages/fansSearch/fansSearch.js
const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    search:false,
    searchStatus:'search'
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
  getData:function(params){
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
  onReachBottom: function () {
    if(this.data.searchStatus=='search'){
      let total = Math.ceil(this.data.total / 10);
      this.data.params.sStartpage += 1
      if (this.data.params.sStartpage < total) {
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
  change:function(){
    this.setData({
      search:true
    })
  },
  changeBack:function(){
    if(!this.data.key){
      this.setData({
        search:false
      })
    }
  },
  setKey:function(e){
    let key=e.detail.value;
    this.setData({
      key: e.detail.value.replace(/\s+/g,'')
    })
  },
  clear:function(){
    this.setData({
      key:''
    })
  },
  search:function(){
    let key=this.data.key;
    if(key==''){
      return
    }
    let allData=this.data.allData,
        newList=[];
    for(let i=0;i<allData.length;i++){
      if(allData[i].detailName.indexOf(key)>-1){
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
  onShareAppMessage: function () {

  }
})