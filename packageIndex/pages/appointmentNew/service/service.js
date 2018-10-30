// packageIndex/pages/appointmentNew/service/service.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceList: [{ name: '测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称', url:'../../images/pinkTeam.png'},
      { name: '测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称', url: '../../images/pinkTeam.png' }, { name: '测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称', url: '../../images/pinkTeam.png' }, { name: '测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称', url: '../../images/pinkTeam.png' }, { name: '测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称', url: '../../images/pinkTeam.png' }, { name: '测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称测试一下服务卡名称', url: '../../images/pinkTeam.png' }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let serviceList=this.data.serviceList;
    for(let i=0;i<serviceList.length;i++){
      serviceList[i].check=false;
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  checkCard:function(e){
    let index=e.currentTarget.dataset.index,
        check="serviceList["+index+"].check";
    this.setData({
      [check]:!this.data.serviceList[index].check
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})