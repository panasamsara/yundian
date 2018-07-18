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
const URL_QRCODE = 'https://wxapp.izxcs.com/qrcode/shop/';
const URL = 'https://wxapp.izxcs.com/zxcity_restful/ws/rest';  
// const URL = 'http://192.168.11.152:8080/zxcity_restful/ws/rest';


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
  var week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  return week[date.getDay()] + ' ' + formatNumber(month) + '月' + formatNumber(day) + '日'
}

//日期时间选择器时间格式
const formatPickerTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/');
}

//时间格式
const formatTimeArray = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [hour,minute].map(formatNumber).join(':');
}


//云店动态日期格式
const formatStoreDate = date => {
  const dates= date.split("-"); 
  return [dates[1], date[2]].map(formatNumber).join('-')
}

//活动详情日期格式
const formatActivityDate = date => {
  return date.split(" ")[0].split("-").join('.'); 
}

//预约成功日期格式
const formatAppoint= date => {
  const dates = date.split(' '),
        dateArr = dates[0].split('-')
  return dateArr[1]+"月"+dateArr[2]+"日"+dates[1]
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
function getParams(url) {
  var params = new Object();
  if (url.indexOf("?") != -1) {
    var str = url.substr(1);
    var strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      params[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
  }
  return params;
}

// 设置历史记录
const setHistories = (shop) => {
  var histories = wx.getStorageSync('histories');
  if (!histories) histories = [];
  histories.forEach((v, i) => {
    if (v.id == shop.id) {
      histories.splice(i ,1)
    }
  });
  histories.unshift(shop);  
  wx.setStorageSync('histories', histories);
}

// --------------------------------------登陆/注册/店铺-----------------------------------------------------------------
// 检测是否已微信登陆，否，则先登陆微信
// 微信登陆后判断是否登陆app，否，则跳转到app注册页
// app登陆后判断是否有店铺信息，否，则跳转到扫码页
const checkWxLogin = () => {
  wx.checkSession({
    success: () => {
      // 未登陆app则跳转到登陆/注册页
      if (!isAppUser()) {
        appLogin()
        return;
      }
      // 无本地店铺则跳转到扫码页
      if (!hasShop()) wx.navigateTo({ url: '/pages/scan/scan' });
    },
    // 未登陆，则登陆微信，获取code
    fail: function () {
      appLogin()
    }
  })
}
// app重新登陆
const appLogin = () => {
  wx.login({
    success: (res) => {
      // 后台登陆app账户
      reqAsync('payBoot/wx/miniapp/login', {
        code: res.code
      }).then((res) => {
        console.log(res)
        // 失败则跳到注册页
        if (res.data.code != 1) {
          loginFailed()
          wx.navigateTo({ url: '/pages/reg/reg' })
          return
        }
        // 未注册用户跳转到注册页面
        if (res.data.data.scSysUser == null) {
          wx.navigateTo({ url: '/pages/reg/reg' });
        }
        // 成功则设置本地数据
        wx.setStorageSync('loginToken', res.data.data.loginToken);
        wx.setStorageSync('scSysUser', res.data.data.scSysUser);
        // if (!isAppUser()) wx.navigateTo({ url: '/pages/reg/reg' });
      })
    },
    fail: loginFailed
  })
}

// 登陆失败处理
const loginFailed = () => {
  wx.hideLoading();
  wx.showToast({
    title: '登陆失败，请稍后再试！',
    icon: 'none',
    duration: 2000
  })
}
// 判断本地当前有无店铺
const hasShop = () => {
  var shop = wx.getStorageSync('shop');
  return shop && shop.id
}
// 判断是否App用户
const isAppUser = () => {
  var scSysUser = wx.getStorageSync('scSysUser');
  return scSysUser && scSysUser.id
}
// -------------------------------------------------------------------------------------------------------

// 16进制颜色替换成rgb => #000 -> rgb(0,0,0)
// 默认输入符合标准
const hexToRGB = (color) => {
  color = color.substring(1);
  var hexArr = color.length == 6 ? color.match(/\w{2}/g) : color.match(/\S{1}/g);
  if (color.length == 3) {
    hexArr.forEach(function (v, i) {
      hexArr[i] = v + v
    });
  }
  var r = parseInt(`0x${hexArr[0]}`);
  var g = parseInt(`0x${hexArr[1]}`);
  var b = parseInt(`0x${hexArr[2]}`);
  return `rgb(${r}, ${g}, ${b})`
}

module.exports = {
  formatTime: formatTime,
  formatMoney: formatMoney,
  formatPicker: formatPicker,
  formatStoreDate: formatStoreDate,
  formatActivityDate: formatActivityDate,
  formatAppoint: formatAppoint,
  formatPickerTime: formatPickerTime,
  formatTimeArray: formatTimeArray,
  reqAsync: reqAsync,
  isEmpty: isEmpty,
  inArray: inArray,
  getLocalTime: getLocalTime,
  area: area,
  checkWxLogin: checkWxLogin,
  isAppUser: isAppUser,
  hasShop: hasShop,
  setHistories: setHistories,
  URL_QRCODE: URL_QRCODE,
  hexToRGB: hexToRGB,
  getParams: getParams
}
