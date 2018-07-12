// pages/appointment/appointment.js
const app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let pages = getCurrentPages(),
        prevPageData = pages[pages.length - 2].data,
        day=new Date(),
        year=day.getFullYear(),
        start= prevPageData.startTime.split(' '),
        end = prevPageData.endTime.split(' ');
        prevPageData.appointStart = year + '-' + start[0].split('月')[0] + '-' + start[0].split('月')[1].split('日')[0] + ' ' + start[1] + ':' + '00';
        prevPageData.appointEnd = year + '-' + end[0].split('月')[0] + '-' + end[0].split('月')[1].split('日')[0] + ' ' + end[1] + ':' + '00';   
        prevPageData.num = prevPageData.num.split('人')[0];
    this.setData({
      data: prevPageData,
      shopName: wx.getStorageSync('shop').shopName
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  submit:function(){
  let datas=this.data.data,
      data={
        summary: datas.summary||'',
        facilityName: datas.deviceText,
        customer: "吕莲莲",
        bespokeBeginTime: datas.appointStart,
        bespokeEndTime: datas.appointEnd,
        facilityId: datas.facilityId,
        receptionNum: datas.num,
        serviceName: datas.serviceNameText,
        customerId: wx.getStorageSync('scSysUser').id,
        serviceId: datas.serviceId,
        shopName: wx.getStorageSync('shop').shopName,
        shopId: wx.getStorageSync('shop').id,
        merchantId: wx.getStorageSync('shop').merchantId,
        waiter: datas.serviceText,
        mobile: "13813852226",
        waiterId: datas.waiterId
      }
    app.util.reqAsync('shop/addBespokeV2', data).then((res) => {
      if(res.data.code==1){
        wx.showToast({
          title: res.data.msg,
          icon:'none'
        })
        setTimeout(function(){
          wx.switchTab({
            url: '../index/index',
          })
        },1000)
      }else{
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
        return
      }  
    }).catch((err) => {
      console.log(err);
    })
  }
})