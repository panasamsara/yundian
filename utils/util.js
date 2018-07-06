import area from 'area.js'

// 时间格式化-自带
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
// 测试链接
const URL = 'https://wxapp.izxcs.com/zxcity_restful/ws/rest';

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 格式化金额
const formatMoney = (num, digit) => {
  num = Number(num) || 0;
  digit = Number(digit) || 2;
  var num_prefix = num.toLocaleString().split('.')[0];
  var num_suffix = num.toFixed(digit).split('.')[1] || null;
  return num_prefix + (!num_suffix ? '' : `.${num_suffix}`);
}

//日期时间选择器格式化
const formatPicker = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  // const second = date.getSeconds()

  return formatNumber(month) + '月' + formatNumber(day) + '日' + [hour, minute].map(formatNumber).join(':')
}

//云店动态日期格式
const formatStoreDate = date => {
  const dates= date.split("-"); 
  return [dates[1], date[2]].map(formatNumber).join('-')
}


// 封装小程序异步请求为Promise
const reqAsync = (cmd, data) => {
  var p = new Promise((resolve, reject) => {
    wx.request({
      url: URL,
      method: 'POST',
      header: {
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        apikey: wx.getStorageSync('apikey') || 'test'
      },
      dataType: 'json',
      data: {
        cmd: cmd,
        data: JSON.stringify(data),
        version: 1
      },
      success: (res) => {
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      }
    })
  });
  return p;
}
const isEmpty = (obj) =>{
  if (typeof obj == "undefined" || obj == null || obj == "") {
    return true;
  } else {
    return false;
  }
}
const inArray = (array, value) => {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == element) {
      return i;
    }
  } return -1;
}
function getLocalTime(now) {
  var now = new Date(parseInt(now));
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var date = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  return year + "-" + month + "-" + date + " " + hour + ":" + minute //+ ":" + second; 
}

module.exports = {
  formatTime: formatTime,
  formatMoney: formatMoney,
  formatPicker: formatPicker,
  formatStoreDate: formatStoreDate,
  reqAsync: reqAsync,
  isEmpty: isEmpty,
  inArray: inArray,
  getLocalTime: getLocalTime,
  area: area

}
