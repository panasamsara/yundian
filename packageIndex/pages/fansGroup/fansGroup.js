const app = getApp()
Page({
  data: {
    dataJson:{
      "sPagerows": "6,6,5,5", 
      "sStartpage": "1", 
      "userId": "", 
      "type": "", 
      "detailId": "" 
    },
    activityList:[],
    albumList:[],
    groupList:[]
  },
  onLoad: function (options) {
    console.log("options",options)
    if (options.typeId==1){
      wx.setNavigationBarTitle({ title: "云店粉团队" });
    }else{
      wx.setNavigationBarTitle({ title: "云店粉小组" });
    }
    var userId = wx.getStorageSync('scSysUser').id
    var detailId ='dataJson.detailId';
    var userid ='dataJson.userId';
    var typeId = 'dataJson.type'
    this.setData({
      [detailId]: options.detailId,
      [userid]: userId,
      [typeId]: options.typeId
    })
    this.detail();
  },
  detail:function(){
    wx.showLoading({
      title: '加载中',
    })
    app.util.reqAsync('fans/getFansTeam', this.data.dataJson).then((res) => {
      wx.hideLoading();
      if (res.data.code == 1) {
        this.setData({
          activityList: res.data.data.activityList,
          albumList: res.data.data.albumList,
          groupList: res.data.data.groupList,
          fansTeam: res.data.data.fansTeam,
          fansTeamId: res.data.data.fansTeam.fansTeamId//方便更多活动的id获取
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
  moreAlbum: function () {
    wx.navigateTo({
      url: '../allAlbum/allAlbum?circleId=' + this.data.albumList[0].circleId + "&typeId=" + this.data.dataJson.type,
    })
  },
  photoDetail:function(e){
    var albumId = e.currentTarget.dataset.albumid;
    var albumName = e.currentTarget.dataset.albumname;
    var circleId = e.currentTarget.dataset.circleid;
    console.log(e);
    wx.navigateTo({
      url: '../allPhoto/allPhoto?albumId=' + albumId + "&albumName=" + albumName + "&circleId=" + circleId,
    })
  },
  moreActivity:function(){
    var detailId = this.data.fansTeamId;
    var typeId = this.data.dataJson.type;
    wx.navigateTo({
      url: '../activityList/activityList?detailId=' + detailId + "&typeId=" + typeId,
    })
  },
  fansActivity:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../fansActivity/fansActivity?id='+id,
    })
  },
  fansSearch:function(){
    var detailId = this.data.fansTeamId;
    wx.navigateTo({
      url: '../fansSearch/fansSearch?detailId=' + detailId,
    })
  },
  skipDetail:function(e){
    var id = e.currentTarget.dataset.id;
    var detailId = e.currentTarget.dataset.detailid;
    console.log("id",id)
    if (id==1){
      var typeId = e.currentTarget.dataset.type;
      wx.navigateTo({
        url: '../fansGroup/fansGroup?detailId=' + detailId + "&typeId=" + typeId ,
      })
    }else{
      wx.navigateTo({
        url: '../memberSearch/memberSearch?detailId=' + detailId ,
      })
    }
  },
  
})


