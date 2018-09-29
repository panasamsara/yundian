// packageIndex/pages/fansSearch/fansSearch.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    search: false,
    searchStatus: 'search',
    iconShow: false,
    ifSearch: 0,//判断是搜索还是首次进入遍历，样式会有所区别,
    name_focus:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userId = wx.getStorageSync("user").id,
    allParams = {
      // "userId": "80076",
      // "detailId": "851" 
      // "userId": "42", 
      // "detailId": "910" 
       "userId": "", 
       "detailId": "" 
    }
    console.log(options)
    allParams.userId = userId;
    allParams.detailId = options.detailId;
    this.setData({
      allParams: allParams
    })
    //获取粉小组数据
    this.getData(allParams);
  },
  getData: function (params) {//获取粉小组数据
    app.util.reqAsync('fans/getFansGroupPerson', params).then((res) => {
      console.log(res.data)
        if (res.data.code==1){
          this.setData({
            allData: res.data.data.personList,
            isShow: res.data.data.isShow
          })
        }
      }).catch((err) => {
        console.log(err);
      })
  },
  change: function () {//出现搜索按钮
    this.setData({
      search: true
    })
    console.log("change")
  },
  changeBack: function () {//隐藏搜索按钮
    if (this.data.iconShow == false) {
      this.setData({
        search: false
      })
    }
  },
  clear: function () {//清空
    this.setData({
      key: '',
      iconShow: false
    })
  },
  hotSearch: function (e) {//热搜索
    if (e.detail.value) {
      this.setData({
        key: e.detail.value,
        iconShow: true
      })
    } else {
      this.setData({
        iconShow: false,
        list: [],
        searchStatus: 'search',
        key: ''
      })
      this.getData(this.data.allParams);
      this.setData({
        ifSearch: 0
      })
      return
    }
    this.setData({
      searchFrom: 'input'
    })
    this.getList(this.data.key.replace(/\s+/g, ''));
  },
  search: function () {//搜索
    if (this.data.key == undefined || this.data.key == ''){
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      this.setData({
        name_focus:true
      })
    }
    this.setData({
      searchFrom: 'btn'
    })
    this.getList(this.data.key);
  },
  getList: function (key) {//搜索公共方法
    if (this.data.searchFrom == 'btn' && key != undefined&& key != '') {
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
    //判断值为空的时候搜索全部
    if (key == undefined || key == ''){
      newList = allData;
      this.setData({
        ifSearch: 0
      })
    }else{
      for (let i = 0; i < allData.length; i++) {
        if (allData[i].userName.indexOf(key) > -1) {
          newList.push(allData[i]);
        }
      }
      this.setData({
        ifSearch: 1
      })
    }
    this.setData({
      list: newList,
      searchStatus: 'searched',
    })
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {

  // }
})