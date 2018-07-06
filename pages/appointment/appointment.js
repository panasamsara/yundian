// pages/appointment/appointment.js
const util = require('../../utils/util.js'),
      dateTimePicker = require('../../utils/dateTimePicker.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // list: [
    //   {
    //     name: '人数',
    //     flag:'numbers',
    //     array: [1,2,3,4,5,6],
    //     text:'请选择您需要预约的人数',
    //     indexs: 0
    //   },
    //   {
    //     name: '设备/设施',
    //     flag:'device',
    //     array: ['设备', '设施', '测试'],
    //     text:'请选择设备/设施',
    //     indexs: 0
    //   },
    //   {
    //     name: '服务人员',
    //     flag:'serviceNum',
    //     array: ['张三', '李四', '服务'],
    //     text:'请选择您需要服务的人员',
    //     indexs: 0
    //   },
    //   {
    //     name: '服务项目',
    //     flag: 'serviceName',
    //     array: ['美容', '美发', '护肤'],
    //     text:'请选择您需要的项目',
    //     indexs: 0
    //   },
    // ],
    num:{
      numArray: [1, 2, 3, 4, 5],
      text: '请选择您需要预约的人数'
    },
    device:{
      deviceArray: ['设备', '设施', '测试'],
      text: '请选择设备/设施',
      modal: false
    },
    service:{
      serviceArray: ['张三', '李四', '服务'],
      text: '请选择您需要服务的人员',
      modal: false
    },
    serviceName:{
      serviceNameArray: ['美容', '美发', '护肤'],
      text: '请选择您需要的项目',
      modal:false
    },
    time:'',
    appointTime:'结束时间',
    dateTimeArray: null,
    dateTime: null,
    showModal:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var day=new Date();
    let obj = dateTimePicker.dateTimePicker();
    // 精确到分的处理，将数组的秒和年去掉
    let lastArray = obj.dateTimeArray.pop();
    let lastTime = obj.dateTime.pop();

    this.setData({
      time: util.formatPicker(day),
      dateTime: obj.dateTime,
      dateTimeArray: obj.dateTimeArray,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  //普通picker
  bindPickerChange: function (e) {
    console.log(e.detail.value)
    var text = "list["+e.currentTarget.dataset.index+"].text";
    this.setData({
      [text]: this.data.list[e.currentTarget.dataset.index].array[e.detail.value]
    })
  },
  //时间日期picker
  changeDateTime(e) {
    this.setData({ dateTime: e.detail.value });
  },
  changeDateTimeColumn(e) {
    var arr = this.data.dateTime, 
        dateArr = this.data.dateTimeArray;

    arr[e.detail.column] = e.detail.value;
    //判断月份格式是否正确
    dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

    this.setData({
      dateTimeArray: dateArr,
      dateTime: arr,
      appointTime: dateArr[1][arr[1]] + '月' + dateArr[2][arr[2]] + '日' + dateArr[3][arr[3]] + ':' + dateArr[4][arr[4]]
    });
  },
  showModal: function (e) {
    var flag=e.currentTarget.id+".modal";
    this.setData({
      [flag]:true,
      showModal:true
    })
  },
  closeModal:function(e){
    if(e.detail.flag==undefined){
      var modal1="device.modal",
          modal2="service.modal",
          modal3="serName.modal";
      this.setData({
        showModal:false,
        [modal1]:false,
        [modal2]: false,
        [modal3]: false,
      })
    }else{
      var text = e.detail.flag + ".text";
      var modal = e.detail.flag + ".modal";
      this.setData({
        [text]: e.detail.text,
        showModal: false,
        [modal]: false
      })
    }
  }
})