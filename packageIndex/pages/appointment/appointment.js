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
    multiIndex:[0,0],
    change:'area'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //创建人数选择器数组
    let numArray=[];
    for(let i=1;i<=20;i++){
      numArray.push(i+'人');
    }
    this.setData({
      numArray:numArray
    })
    //获取店铺名和用户电话号码
    if(options&&options.name){
      this.setData({
        name: options.name,
        phone: options.phone
      })
    }
    let data={
      shopId: wx.getStorageSync('shop').id
    };
    this.getData(data)
  },
  onShow:function(){
    app.util.checkWxLogin('appointment');
  },
  start:function(){//开始时间
    this.change('start');
    this.setData({
      endTime:'结束时间',
      change:'text'
    })
  },
  end:function(){//结束时间
    if(this.data.startTime=='开始时间'){
      wx.showToast({
        title: '请先选择开始时间',
        icon:'none'
      })
      return
    }
    this.setData({
      change:'text'
    })
    this.change('end')
  },
  //普通人数picker
  bindPickerChange: function (e) {
    this.setData({
      numText: this.data.numArray[e.detail.value],
      num: this.data.numArray[e.detail.value]
    })
  },
  //时间日期picker
  change:function(arr){
    this.setData({
      showModal:true,
      picker:true
    })
    var date1 = new Date(),
        date2 = new Date(date1),
        date3 = new Date(date1.getTime() + 24 * 60 * 60 * 1000);
    var multiArray = [],//日期星期数组
        timeArray = [];//时间数组
    date2.setDate(date1.getDate() + 30);//当前日为始的30天
    //左边日期星期数组
    for (let i = Date.parse(app.util.formatPickerTime(date1)); i <= Date.parse(app.util.formatPickerTime(date2)); i += 86400000) {
        multiArray.push(app.util.formatPicker(new Date(i)));
    }
    var businessStartTime = this.data.data.businessStartTime.split(':'),//店铺营业开始时间
        businessEndTime = this.data.data.businessEndTime.split(':'),//店铺营业结束时间
        sm = businessStartTime[0],//开始时
        ss = businessStartTime[1],//开始分
        em = businessEndTime[0],//结束时
        es = businessEndTime[1],//结束分
        intervalTime = this.data.data.intervalTime*60*1000;//店铺设置的最小间隔时间
        this.setData({
          sm:sm,
          ss:ss,
          em:em,
          es:es
        })
    //右边营业时间数组
    //营业时间是否跨天
    if (date1.setHours(em, es) - date1.setHours(sm, ss)>0){ //不跨天
      for (let i = date1.setHours(sm, ss); i <= (date1.setHours(em, es)); i += 1800000) {
        timeArray.push(app.util.formatTimeArray(new Date(i)))
      }
      if (arr == 'start') {//开始时间数组
        let multiArray1 = [multiArray, timeArray]
        this.setData({
          multiArray: multiArray1
        })
      } else {//结束时间数组
        let arr = [this.data.start],
          multiArray2 = [arr, timeArray];
        this.setData({
          multiArray: multiArray2,
          multiIndex: [0, this.data.index]
        })
      }
    }
    else{ //跨天
      for (let i = date1.setHours(sm, ss); i <= (date3.setHours(em, es)); i += 1800000) {
        timeArray.push(app.util.formatTimeArray(new Date(i)))
      }
      if (arr == 'start') {//开始时间数组
        let multiArray1 = [multiArray, timeArray]
        this.setData({
          multiArray: multiArray1,
          multiIndex: [0,0]
        })
      } else {//结束时间数组
        let arr = [this.data.start,this.data.start1],
          multiArray2 = [arr, timeArray];
        this.setData({
          multiArray: multiArray2,
          multiIndex: [0, this.data.index]
        })
      }   
    }
  },
  showModal: function (e) {//模板弹框
    this.setData({
      modal: e.currentTarget.id+'-modal',
      showModal:true,
      change:'text'
    })
    this.selectComponent('#' + e.currentTarget.id +'-modal').onLoad();
  },
  close:function(){//关闭时间日期选择器
    if(this.data.startTime!='开始时间'||this.data.endTime!='结束时间'){//开始时间选择数据
      let startTime = this.data.startTime,
          date = startTime.split(' ')[0],
          time = startTime.split(' ')[1],
          date1 = new Date(),
          //选择的的开始时间完整格式
          chose = date1.getFullYear() + '/' + date.split('月')[0] + '/' + date.split('月')[1].split('日')[0] + ' ' + time, 
          intervalTime = this.data.data.intervalTime;
      if(this.data.endTime!='结束时间'){//结束时间选择数据
        let endTime=this.data.endTime,
            dates = endTime.split(' ')[0],
            time1 = endTime.split(' ')[1],
            //选择的结束时间完整格式
            chose1 = date1.getFullYear() + '/' + dates.split('月')[0] + '/' + dates.split('月')[1].split('日')[0] + ' ' + time1;
        if (intervalTime == 60) {//根据店铺设置最小间隔时间为半小时还是一小时
            if(Date.parse(chose1)-Date.parse(chose)<3600000){
              wx.showToast({
                title: '预约时间间隔不能小于一个小时',
                icon:'none'
              })
              return
            }
        }
        if (Date.parse(chose1) - Date.parse(chose) >= 86400000){//判断预约时间是否超过24小时
          wx.showToast({
            title: '预约时间间隔不能超过或等于24小时',
            icon: 'none'
          })
          return
        }
        //判断是否跨天
        if (date1.setHours(this.data.em, this.data.es) - date1.setHours(this.data.sm, this.data.ss) < 0){
          let begin1 = new Date(chose).getTime(),
              end1 = new Date(chose1).getTime(),
              businessBegin1 = date1.getFullYear() + '/' + date.split('月')[0] + '/' + date.split('月')[1].split('日')[0] + ' ' + this.data.data.businessStartTime,
              // businessEnd1 = date1.getFullYear() + '/' + date.split('月')[0] + '/' + date.split('月')[1].split('日')[0] + ' ' + this.data.data.businessEndTime,
              businessBegin2 = date1.getFullYear() + '/' + dates.split('月')[0] + '/' + dates.split('月')[1].split('日')[0] + ' ' + this.data.data.businessStartTime,
              // businessEnd2 = date1.getFullYear() + '/' + dates.split('月')[0] + '/' + dates.split('月')[1].split('日')[0] + ' ' + this.data.data.businessEndTime,
              begin2=new Date(businessBegin1).getTime(),
              begin3 =new Date(businessBegin2).getTime();
              // end2 = new Date(businessEnd1).getTime(),
              // end3 = new Date(businessEnd2).getTime();
          if (begin2>begin1&&begin2<end1){//判断预约时间是否包含非营业时间
            wx.showToast({
              title: '预约时间不能包含非营业时间',
              icon:'none'
            })
            return 
          }
          if(begin3>begin1&&begin3<end1){
            wx.showToast({
              title: '预约时间不能包含非营业时间',
              icon:'none'
            })
            return
          }
        }
      }
      if (Date.parse(chose) - Date.parse(new Date()) <= 0) {
        wx.showToast({
          title: '开始时间不能小于或等于当前时间',
          icon: 'none'
        })
        return
      }
    }
    this.setData({
      picker:false,
      showModal:false,
      change:'area'
    })
  },
  closeModal:function(e){//关闭模板弹窗
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
        change:'area'
      })
  },
  getData:function(data){//获取页面数据
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
  submit:function(){//立即预约
    let endTime=this.data.endTime,
        num=this.data.num||'',
        facilityId = this.data.facilityId||'',
        waiterId = this.data.waiterId||'',
        serviceId = this.data.serviceId||''
        if (endTime == undefined ||endTime == '结束时间'||num==''){
          wx.showToast({
            title: '请完善预约信息',
            icon:'none'
          })
          return
        }
        let pageData = {
          summary: this.data.summary || '',
          facilityName: this.data.deviceText,
          customer: this.data.name,
          bespokeBeginTime: this.data.startTime,
          bespokeEndTime: this.data.endTime,
          facilityId: this.data.facilityId,
          receptionNum: this.data.num,
          serviceName: this.data.serviceNameText,
          customerId: wx.getStorageSync('scSysUser').id,
          serviceId: this.data.serviceId,
          shopName: wx.getStorageSync('shop').shopName,
          shopId: wx.getStorageSync('shop').id,
          merchantId: wx.getStorageSync('shop').merchantId,
          waiter: this.data.serviceText,
          mobile: this.data.phone,
          waiterId: this.data.waiterId
        }
        wx.setStorageSync('pageData', pageData)
        wx.navigateTo({
          url: 'success'
        })
  },
  bindChange: function (e) {//时间日期选择器监听滚动事件
    var sm = this.data.sm,
        ss = this.data.ss,
        em = this.data.em,
        es = this.data.es,
        date1 = new Date();
    let multiArray= this.data.multiArray,
        newmultiArray=[];
    for (let i = 0; i < multiArray[0].length;i++){
      newmultiArray.push(multiArray[0][i].split(' ')[1])
    }
    let date = newmultiArray[e.detail.value[0]],
        time = multiArray[1][e.detail.value[1]]
    if (multiArray[0].length>2){//开始时间选择数组变化
      this.setData({
        startTime: date + ' ' + time,
        start: multiArray[0][e.detail.value[0]],
        index: e.detail.value[1]
      })
      if (date1.setHours(em, es) - date1.setHours(sm, ss) < 0){//如果跨天获取选择的开始时间的往后一天的日期
        this.setData({
          start1: multiArray[0][e.detail.value[0]+1]
        })
      }
    }else{//结束时间选择数组变化
      let nowDate = new Date(),   
          endTime =nowDate.getFullYear()+'/'+date.split("月")[0] +'/'+date.split('月')[1].split('日')[0]+' '+time,
          start=this.data.startTime,
          startTime = nowDate.getFullYear() + '/' + start.split('月')[0] + '/' + start.split('月')[1].split('日')[0]+' '+start.split(' ')[1]
      if(Date.parse(endTime)-Date.parse(startTime)<=0){
        wx.showToast({
          title: '结束时间不能小于或等于开始时间',
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