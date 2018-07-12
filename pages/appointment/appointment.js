// pages/appointment/appointment.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    numText:'请选择您需要预约的人数',
    deviceText:'请选择设备/设施',
    serviceText:'请选择您需要服务的人员',
    serviceNameText:'请选择您需要的项目',
    startTime:'开始时间',
    endTime:'结束时间',
    showModal:false,
    modal:'',
    picker:false,
    multiArray:[],
    multiIndex:[0,0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let numArray=[];
    for(let i=1;i<=20;i++){
      numArray.push(i+'人');
    }
    this.setData({
      numArray:numArray
    })
    let data={
      shopId: wx.getStorageSync('shop').id
    };
    console.log(wx.getStorageSync('shop').id)
    app.util.reqAsync('shop/getBespokeSettingInfoV2', data).then((res) => {
      console.log(res.data.data)
      this.setData({
        data: res.data.data
      })
    }).catch((err) => {
      console.log(err);
    })
  },
  preventTouchMove: function () {

  },
  start:function(){
    this.change('start');
  },
  end:function(){
    if(this.data.startTime=='开始时间'){
      wx.showToast({
        title: '请先选择开始时间',
        icon:'none'
      })
      return
    }
    this.change('end')
  },
  //普通人数picker
  bindPickerChange: function (e) {
    this.setData({
      numText: this.data.numArray[e.detail.value],
      num: this.data.numArray[e.detail.value]
    })
  },
  //时间日期
  change:function(arr){
    this.setData({
      showModal:true,
      picker:true
    })
    var date1 = new Date(),
        date2 = new Date(date1);
    var multiArray = [];
    date2.setDate(date1.getDate() + 30);
    for (var i = Date.parse(app.util.formatPickerTime(date1)); i <= Date.parse(app.util.formatPickerTime(date2)); i += 3600000) {
      if (multiArray.indexOf(app.util.formatPicker(new Date(i))) == -1) {
        multiArray.push(app.util.formatPicker(new Date(i)));
      }
    }
    if(arr=='start'){
      var multiArray1 = [multiArray, ['7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']]
      this.setData({
        multiArray: multiArray1
      })
    }else{
      var multiArray2 = [[this.data.start], ['7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00']]
      this.setData({
        multiArray: multiArray2,
        multiIndex:[0,this.data.index]
      })
    }  
  },
  showModal: function (e) {
    this.setData({
      modal: e.currentTarget.id+'-modal',
      showModal:true
    })
    this.selectComponent('#' + e.currentTarget.id +'-modal').onLoad();
  },
  close:function(){
    this.setData({
      picker:false,
      showModal:false
    })
  },
  closeModal:function(e){
      var flag1=e.detail.flag1,
          flag2=e.detail.flag2;
      if(flag1!=undefined){
        this.setData({
          [flag1]: e.detail.text,
          [flag2]: e.detail.id
        })
      }
      this.setData({
        modal: '',
        showModal:false,
      })
  },
  getData:function(data){
    app.util.reqAsync('shop/getBespokeSettingInfoV2', data).then((res) => {
      this.setData({
        data: res.data.data
      })
    }).catch((err) => {
      console.log(err);
    })
  },
  summary:function(e){
    this.setData({
      summary:e.detail.value
    })
  },
  submit:function(){
    let endTime=this.data.endTime,
        num=this.data.num,
        facilityId = this.data.facilityId,
        waiterId = this.data.waiterId,
        serviceId = this.data.serviceId
        if (endTime == undefined ||endTime == ''|| num == undefined || facilityId == undefined || waiterId == undefined || serviceId ==undefined){
          wx.showToast({
            title: '请完善预约信息',
            icon:'none'
          })
          return
        }
        wx.navigateTo({
          url: 'success'
        })
  },
  bindChange: function (e) {
    let multiArray= this.data.multiArray,
        newmultiArray=[];
    for (let i = 0; i < multiArray[0].length;i++){
      newmultiArray.push(multiArray[0][i].split(' ')[1])
    }
    let date = newmultiArray[e.detail.value[0]],
        time = multiArray[1][e.detail.value[1]]
    if (multiArray[0].length>1){
      this.setData({
        startTime: date + ' ' + time,
        start: multiArray[0][e.detail.value[0]],
        index: e.detail.value[1]
      })
    }else{
      let startTime=this.data.startTime.split(' ')[1].split(':'),
          endTime = time.split(':');
      if (endTime[0] - startTime[0] == 0){
        if(endTime[1]-startTime[1]<=0){
          wx.showToast({
            title: '结束时间必须比开始时间晚',
            icon: 'none'
          })
          return
        }
      }else if(endTime[0] - startTime[0]<0){
        wx.showToast({
          title: '结束时间必须比开始时间晚',
          icon:'none'
        })
        return
      }
      this.setData({
        endTime: date + ' ' + time
      })
    }  
  }
})