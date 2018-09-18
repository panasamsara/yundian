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
    // let pages = getCurrentPages(),
    //     prevPageData = pages[pages.length - 2].data,
    let prevPageData=wx.getStorageSync('pageData'),
        day=new Date(),
        year=day.getFullYear(),
        start = prevPageData.bespokeBeginTime.split(' '),
        end = prevPageData.bespokeEndTime.split(' ');
        prevPageData.bespokeBeginTime = year + '-' + start[0].split('月')[0] + '-' + start[0].split('月')[1].split('日')[0] + ' ' + start[1] + ':' + '00';
        prevPageData.bespokeEndTime = year + '-' + end[0].split('月')[0] + '-' + end[0].split('月')[1].split('日')[0] + ' ' + end[1] + ':' + '00';  
        if (prevPageData.receptionNum) {
          prevPageData.receptionNum = parseInt(prevPageData.receptionNum.split('人')[0]);
        }
        if (prevPageData.facilityName =="请选择设备/设施")  {
          prevPageData.facilityName=''
        } 
        if (prevPageData.serviceName == "请选择您需要的项目") {
          prevPageData.serviceName = ''
        } 
        if (prevPageData.waiter == "请选择您需要服务的人员") {
          prevPageData.waiter = ''
        } 
    this.setData({
      data: prevPageData,
      shopName: wx.getStorageSync('shop').shopName
    })
  },
  submit:function(){
    if(this.data.status=='appointed'){
      wx.showToast({
        title: '您已经预约过了',
        icon:'none'
      })
      return
    }
    let datas=this.data.data,
        data={
          summary: datas.summary||'',
          facilityName: datas.deviceText,
          customer: datas.customer,
          bespokeBeginTime: datas.bespokeBeginTime,
          bespokeEndTime: datas.bespokeEndTime,
          facilityId: datas.facilityId,
          receptionNum: datas.receptionNum,
          serviceName: datas.serviceNameText,
          customerId: wx.getStorageSync('scSysUser').id,
          serviceId: datas.serviceId,
          shopName: wx.getStorageSync('shop').shopName,
          shopId: wx.getStorageSync('shop').id,
          merchantId: wx.getStorageSync('shop').merchantId,
          waiter: datas.serviceText,
          mobile: datas.mobile,
          waiterId: datas.waiterId
        }
    app.util.reqAsync('shop/addBespokeV2', data).then((res) => {
      if(res.data.code==1){
        // this.setData({
        //   status:'appointed'
        // })
        console.log('预约成功------------------------回调数据-预约单号', res.data.data)
        app.util.sendMessage(res.data.data.orderNo, wx.getStorageSync('shop').id, wx.getStorageSync('scSysUser').usercode, 2)
        wx.showToast({
          title: res.data.msg,
          icon:'none'
        })
        setTimeout(function(){
          wx.switchTab({
            url: '../../../pages/index/index',
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
    this.setData({
      status: 'appointed'
    })
  }
})