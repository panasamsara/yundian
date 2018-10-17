const app = getApp();

// 根据当前时间获取当月有多少天
const getDayTotal = date => {
  var lastDay = new Date(date.getFullYear(), date.getMonth()+1, 0);
  return lastDay.getDate();
}
// 获取时间段
const getTimeRange = (startTime, endTime, intervalTime) => {
  var arr = [];
  var timeStr = app.util.dateFormat('yyyy/MM/dd ', new Date());
  var startDate = new Date(timeStr + startTime);
  var endDate = new Date(timeStr + endTime);
  while (startDate.getTime() < endDate.getTime()) {
    arr.push(app.util.dateFormat('hh:mm', startDate));
    startDate.setMinutes(startDate.getMinutes() + intervalTime);
  }
  return arr;
}
// 判断当前日期是否在日期范围内
const isInRange = (date, _d) => {
  if (!_d) _d = dayRange;
  return _d[0].getTime() <= date.getTime() && date.getTime() <= _d[1].getTime()
}
// 判断当日是否接待
const isInDays = (_date, disableDays) => {
  return disableDays.includes(_date.getDay())
}

// 获取当月【可选】时间
const getDays = (date, selectedDate, disableDays) => {
  // 获取当月总时间
  var dayArr = new Array(getDayTotal(date)).fill({});
  // 基于concat的BUG重新赋值
  dayArr = JSON.parse(JSON.stringify(dayArr));
  // 设置日期为当月日期,从月头到月尾判断日期范围内可选
  var _date = new Date(date.getFullYear(), date.getMonth())
  dayArr.forEach((v, i) => {
    v.day = i + 1;
    _date.setDate(i + 1);
    // 不可选日期判断
    v.disabled = !isInRange(_date, dayRange) || isInDays(_date, disableDays);
  });
  // 如果取的时间与已选择时间年月相同，已选时间当日高亮
  if (selectedDate.getFullYear() == date.getFullYear() && selectedDate.getMonth() == date.getMonth()) {
    dayArr[selectedDate.getDate() - 1].active = true
  }
  // 从1号是周x开始填充空白
  date.setDate(1);
  var days = new Array(date.getDay()).fill().concat(dayArr);
  // 并补全7的整数倍到数组中
  if (days.length % 7 != 0) days = days.concat(new Array(7 - days.length % 7).fill());
  // 基于concat的BUG重新赋值
  return JSON.parse(JSON.stringify(days));
}
// 获取当日可选时间
var getTimeArr = (startTime, endTime, intervalTime) =>{
  var rangeArr = getTimeRange(startTime, endTime, intervalTime);
  var timeArr = new Array(rangeArr.length).fill({});
  timeArr = JSON.parse(JSON.stringify(timeArr))
  timeArr.forEach((v, i) => {
    v.text = rangeArr[i]
  });
  // 补全空格，4的整数倍
  if (timeArr.length % 4 != 0) timeArr = timeArr.concat(new Array(4 - timeArr.length % 4).fill(null));
  return timeArr
}

let dateStart = new Date(app.util.dateFormat('yyyy/MM/dd', new Date()));
let dayEnd = new Date(app.util.dateFormat('yyyy/MM/dd', new Date()));
let monthEnd = new Date(app.util.dateFormat('yyyy/MM/dd', new Date()));
dayEnd.setMonth(dayEnd.getMonth() + 1);
monthEnd.setMonth(monthEnd.getMonth() + 2);
monthEnd.setDate(0);
// 预约时间段，精确到日
const dayRange = [dateStart, dayEnd];
// 预约时间段，精确到月
const monthRange = [new Date(app.util.dateFormat('yyyy/MM', dateStart)), monthEnd];
// 最大预约时间段，默认初始化设置一个
const timeRange = getTimeRange('00:00', '23:30', 60);

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 每月的天数
    days: [],
    // 每天的可选时间
    timeArr: timeRange,
    // 切换
    toggleArr: [true, false],
    // 用于展示的时间
    dateVal: app.util.dateFormat('yyyy/MM/dd hh:mm', new Date()),
    dateStr: app.util.dateFormat('yyyy年MM月', new Date()),
    // 已选择的时间
    dateSelected: app.util.dateFormat('yyyy/MM/dd hh:mm', new Date())
  },
  // 初始化月份/日期/可预约时间
  onLoad: function (options) {
    wx.showNavigationBarLoading()
    app.util.reqAsync('shop/getBespokeSettingInfoV2', {
      shopId: wx.getStorageSync('shop').id
    }).then(res => {
      if(res.data.code == 1) {
        var timeArr = getTimeArr(res.data.data.businessStartTime, res.data.data.businessEndTime, res.data.data.intervalTime);
        this.setData({
          timeArr: timeArr,
          data: res.data.data
        })
        this.changeMonth();
        this.checkTime(new Date());
      } else {
        wx.showToast({title: res.data.msg, icon: 'none'})
      }
      wx.hideNavigationBarLoading();
    }).catch(err => {
      wx.hideNavigationBarLoading();
      wx.showToast({ title: '查询失败，请刷新再试~', icon: 'none' })
    })
  },
  // 月份选择，只能选择当前月份和下一个月份
  changeMonth: function(e){
    // 当前选择时间
    var dateVal = new Date(this.data.dateVal);
    // 判断当前是否能选择上/下一月
    if (e) {
      // 预计处理时间
      var m = parseInt(e.currentTarget.dataset.m);
      var _dateVal = new Date(dateVal.getFullYear(), dateVal.getMonth() + m);
      // 预计处理时间应该在时间范围内
      if (!isInRange(_dateVal, monthRange)) return;
      dateVal.setMonth(dateVal.getMonth() + m);
    }

    // 选择完毕之后判断左右边界，即能否继续增减
    var _dateVal = new Date(dateVal.getFullYear(), dateVal.getMonth() - 1);
    var limitLeft = isInRange(_dateVal, monthRange);
    _dateVal.setMonth(_dateVal.getMonth() + 2)
    var limitRight = isInRange(_dateVal, monthRange);
    
    // 确定哪些日子不能选
    var disableDays = [];
    if(this.data.data) {
      var recessTime = this.data.data.recessTime;
      switch (recessTime) {
        case 0: break;
        case 8: disableDays = [0, 1];break;
        case 7: disableDays = [0]; break;
        default: disableDays = [parseInt(recessTime)];
      }
    }
    // 获取当前月份天数
    var days = getDays(dateVal, new Date(this.data.dateSelected), disableDays);

    this.setData({
      dateStr: app.util.dateFormat('yyyy年MM月', dateVal),
      days: days,
      dateVal: app.util.dateFormat('yyyy/MM/dd hh:mm', dateVal),
      limitLeft: limitLeft,
      limitRight: limitRight
    })
  },
  // 天选择
  changeDay: function(e){
    var i = parseInt(e.currentTarget.dataset.i);
    let days = this.data.days;
    if (!days[i] || days[i].disabled) return

    var dateVal = new Date(this.data.dateVal);
    days.forEach((v, j) => {
      if(!v) return;
      if (i == j) {
        v.active = true;
        dateVal.setDate(v.day);
      } else {
        v.active = false;
      }
    });
    this.checkTime(dateVal);
    this.setData({
      days: days,
      dateVal: app.util.dateFormat('yyyy/MM/dd hh:mm', dateVal),
      dateSelected: app.util.dateFormat('yyyy/MM/dd hh:mm', dateVal)
    })
  },
  // 时间选择
  changeTime: function (e) {
    var i = parseInt(e.currentTarget.dataset.i);
    let timeArr = this.data.timeArr;
    if (!timeArr[i] || timeArr[i].disabled) return;

    var dateVal = new Date(this.data.dateVal);
    var timeStr = '';
    timeArr.forEach((v, j) => {
      if (!v) return;
      if (i == j) {
        v.active = true;
        timeStr = v.text;
      } else {
        v.active = false;
      }
    })
    var dateSelected = new Date(this.data.dateSelected);
    dateSelected = app.util.dateFormat('yyyy/MM/dd ', dateSelected) + timeStr
    this.setData({
      timeArr: timeArr,
      dateSelected: dateSelected
    })
  },
  // 检查时间，若选择当日，则判断预约到店时间能否选择
  checkTime: function(today){
    var todayStr = app.util.dateFormat('yyyy/MM/dd', new Date());
    var timeArr = this.data.timeArr;
    var timeStampNow = Date.now();
    // 找出第一个active
    var hasActive = false;

    if (app.util.dateFormat('yyyy/MM/dd', today) == todayStr) {
      timeArr.forEach((v) => {
        if (!v) return;
        var d = new Date(todayStr + ' ' + v.text);
        v.disabled = d.getTime() < timeStampNow;
        // 已禁用，则禁止点击
        if (v.disabled) v.active = false;
        if (v.active) hasActive = true
      })
    } else {
      timeArr.forEach((v) => {
        v.disabled = false;
        if (v.active) hasActive = true;
      })
    }
    // 若都没有，则取第一个非disabled为active
    if(!hasActive) {
      for (let i = 0; i < timeArr.length; i++) {
        if (timeArr[i] && !timeArr[i].disabled) {
          timeArr[i].active = true;
          break;
        }
      }
    }
    this.setData({ timeArr: timeArr })
  },
  // 切换收起展示
  toggleContent: function (e) {
    var i = parseInt(e.currentTarget.dataset.i);
    var toggleArr = this.data.toggleArr;
    toggleArr[i] = !toggleArr[i];
    this.setData({
      toggleArr: toggleArr
    })
  },
  // 下一页
  toNextStep: function () {
    var dateSelected = this.data.dateSelected;
    var timeArr = this.data.timeArr;
    // 可能存在当日营业时间快结束的情况，即没有active
    var hasActive = false
    timeArr.forEach((v) => {
      if (v.active) hasActive = true;
    });
    if(!hasActive) return wx.showToast({title: '预约时间已结束！', icon: 'none'});
    wx.navigateTo({
      url: '/packageIndex/pages/appointmentNew/appointmentNew?date=' + dateSelected
    })
  }
})