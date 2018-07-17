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
  submit:function(){
  let datas=this.data.data,
      data={
        summary: datas.summary||'',
        facilityName: datas.deviceText,
        customer: datas.name,
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
        mobile: datas.phone,
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
        console.log(res)
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