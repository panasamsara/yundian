import area from 'area.js'

// 时间格式化-自带
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
// // 测试链接
const URL_QRCODE = 'https://wxapp.izxcs.com/zxcity_restful/ws/rest';
// 测试环境
const URL = 'https://wxappprod.izxcs.com/zxcity_restful/ws/rest';
const SHARE_URL ='https://share.zxtest.izxcs.com';
const SOCKET_URL = 'wss://wxappprod.izxcs.com'

// 正式环境
// const URL = 'https://wxapp.izxcs.com/zxcity_restful/ws/rest';
// const URL_QRCODE = 'https://wxapp.izxcs.com/qrcode/shop/';
// const SHARE_URL = 'https://share.izxcs.com';
// const SOCKET_URL = 'wss://wxapp.izxcs.com'

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 判断是否有缓存店铺，没有就缓存，有就看是否需要替换（分享进小程序时使用）
const cacheShop = (shopId, shop, that) => {
  if (!shop) {
    if (shopId == undefined) {
      wx.redirectTo({
        url: '../scan/scan'
      })
    } else {
      util.getShop(loginRes.id, shopId).then(function (res) {
        that.setData({
          shopInformation: res.data.data
        })
        //shop存入storage
        wx.setStorageSync('shop', res.data.data.shopInfo);
        //活动
        wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
        // 所有信息
        wx.setStorageSync('shopInformation', res.data.data);

      })
    }
  } else {
    if (shopId == undefined || shopId == '' || shopId == null) {
      if (shop.shopHomeConfig) {
        if (shop.shopHomeConfig.videoPathList.length != 0) {
          let videoInfo = {}
          videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
          videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
          wx.setStorageSync('videoInfo', videoInfo)
        }
      }
      let shopInformation = wx.getStorageSync('shopInformation')
      that.setData({
        shopInformation: shopInformation
      })

    } else {
      if (shopId == shop.id) {
        if (shop.shopHomeConfig) {
          if (shop.shopHomeConfig.videoPathList.length != 0) {
            let videoInfo = {}
            videoInfo.url = shop.shopHomeConfig.videoPathList[0].filePath
            videoInfo.cover = shop.shopHomeConfig.videoPathList[0].coverImagePath
            wx.setStorageSync('videoInfo', videoInfo)
          }
        }
        let shopInformation = wx.getStorageSync('shopInformation')
        that.setData({
          shopInformation: shopInformation
        })

      } else {
        wx.removeStorageSync('shop')
        wx.removeStorageSync('goodsInfos')
        wx.removeStorageSync('shopInformation')
        util.getShop(loginRes.id, shopId).then(function (res) {
          that.setData({
            shopInformation: res.data.data
          })
          //shop存入storage
          wx.setStorageSync('shop', res.data.data.shopInfo);
          //活动
          wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
          // 所有信息
          wx.setStorageSync('shopInformation', res.data.data);

        })
      }
    }

  }
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
  return [dates[0], dates[1], date[2]].map(formatNumber).join('-')
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

//兼容IOS时间格式转换
const formatIOS= date =>{
  const arr = date.split(/[- :]/);
  return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
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
  var idx = url.indexOf("?");
  if (idx != -1) {
    var str = url.substr(idx + 1);
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

const boolCheckSession = () => {
  var hasUser = false
  let promi = new Promise((resolve, reject) => {
    wx.checkSession({//检查小程序登录是否过期
      success: (res) => {//未过期
      console.log(res)
        if (!isAppUser()) {
          // hasUser = false
          // return
          resolve({
            hasUser: false
          })
        }
        resolve({
          hasUser: true
        })
        // hasUser = true
      },
      fail: (res) => {//已过期重新登录小程序

        // hasUser = false
        resolve({
          hasUser: false
        })
      }
    })
  })
  
  return promi
}
const checkWxLogin = (source=null) => {

  let promi = new Promise((resolve, reject) => {
    boolCheckSession().then((res)=>{
      if (res.hasUser){
        var user = wx.getStorageSync('scSysUser');
        resolve(user)
        wx.hideLoading();
        // if(!source)
        // setTimeout(function(){
        //   wx.switchTab({ url: '/pages/index/index' });
        // },1000)
      }else{
        wx.login({
          success: (res) => {
            console.log(res)
            // 后台登陆app账户
            reqAsync('payBoot/wx/miniapp/login', {
              code: res.code,
              source:'0',
              platform:'0'
            }).then((res) => {
              console.log(res)
              // console.log('登录app', res.data.data.scSysUser)
              wx.setStorageSync('loginToken', res.data.data.loginToken);
              wx.setStorageSync('isAuth', res.data.data.isAuth);
              // 失败则跳到注册页
              if (res.data.code != 1) {
                loginFailed()
                wx.redirectTo({ url: '/pages/reg/reg' });
                return
              }
              // 未注册用户跳转到注册页面
 				    if (res.data.data.scSysUser == null) {
                // wx.redirectTo({ url: '/pages/reg/reg' });
                  var result={
                  msg:'新用户',
                  status:0
                }
                resolve(result)
                return
              }else {
                wx.setStorageSync('scSysUser', res.data.data.scSysUser);
                resolve(res.data.data.scSysUser)
                wx.hideLoading();
                if(!source)
                wx.switchTab({ url: '/pages/index/index' });

              }
            })
          },
          fail: () => {
            // reject({
            //   title: '登陆失败，请稍后再试！',
            //   icon: 'none',
            //   duration: 2000
            // })
          }
        })
      }
     
    })
  })
  return promi
}
//判断优惠券详情分享是否登录
const checkWxLoginShare = (source = null) => {
  console.log(wx.getStorageSync('shop'))
  let promi = new Promise((resolve, reject) => {

    boolCheckSession().then((res) => {
      console.log('boolCheckSession')
      console.log(res)
      if (res.hasUser) {
        var user = wx.getStorageSync('scSysUser');
        resolve(user)
        wx.hideLoading();
      } else {
        wx.login({
          success: (res) => { 
            console.log(res)
            // 后台登陆app账户
            reqAsync('payBoot/wx/miniapp/login', {
              code: res.code,
              source: '0',
              platform: '0'
            }).then((res) => {
              console.log(res)
              console.log('登录app', res.data.data.scSysUser)
              wx.setStorageSync('loginToken', res.data.data.loginToken);
              // 失败则跳到注册页
              if (res.data.code != 1) {
                loginFailed()
                wx.redirectTo({ url: '/pages/reg/reg' });
                return
              }
              // 未注册用户跳转到注册页面
              if (res.data.data.scSysUser == null) {
                wx.redirectTo({ url: '/pages/reg/reg' });
                return
              }
              else {
                wx.setStorageSync('scSysUser', res.data.data.scSysUser);
                resolve(res.data.data.scSysUser)
                wx.hideLoading();
              }
            })
          },
          fail: () => {
            reject({
              title: '登陆失败，请稍后再试！',
              icon: 'none',
              duration: 2000
            })
          }
        })
      }

    })
  })
  return promi
}
//登录小程序和app账户
const appLogin = () => {
 
  console.log('登录小程序')
  return wx.login({
    success: (res) => {
      console.log('wx.login:',res)
      // 后台登陆app账户
      reqAsync('payBoot/wx/miniapp/login', {
        code: res.code,
        source: '0',
        platform: '0'
      }).then((res) => {
        console.log('登录app',res.data.data.scSysUser)
        wx.setStorageSync('loginToken', res.data.data.loginToken);
        // 失败则跳到注册页
        if (res.data.code != 1) {
          loginFailed()
          wx.redirectTo({ url: '/pages/reg/reg' })
          return
        }
        // 未注册用户跳转到注册页面
        if (res.data.data.scSysUser == null) {
          wx.redirectTo({ url: '/pages/reg/reg' });
        }
        else{
          wx.setStorageSync('scSysUser', res.data.data.scSysUser);
          
          //因index获取店铺信息接口调用时取不到userid，所以在此添加访问记录
          // if (hasShop()){
          //   reqAsync('shop/addVisitorShopRecord', {
          //     customerId: res.data.data.scSysUser.id,
          //     visitFrom: 3,
          //     shopId: hasShop()
          //   })
          // }
          
        }
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
// 获取店铺信息 promise
const getShop = (userId,shopId) => {
  if (!shopId && shopId == "" && shopId == null){
    shopId = 0
  }
  let promi = new Promise((resolve, reject) => {
    reqAsync('shop/getShopHomePageInfo', {
      customerId: userId,
      shopId: shopId,
      visitFrom: 3,  // 访问来源
      pageNo: 1,
      pageSize: 100
    }).then((res) => {
      // 查询失败跳转到扫码页
      if(res.data.code != 1) {
        wx.redirectTo({ url: '../scan/scan' });
        return wx.showToast({ title: res.data.msg, icon: 'none' })
      }
      // 未上线店铺跳转到扫码页
      if(res.data.data.shopInfo.shopStatus != 0) {
        wx.redirectTo({ url: '../scan/scan'});
        wx.showToast({ title: '店铺已下线！',  icon: 'none' })
        return;
      }
      //shop存入storage
      // wx.setStorageSync('shop', res.data.data.shopInfo);
      //活动
      // wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
      // 所有信息
      // wx.setStorageSync('shopInformation', res.data.data);
      // 所有信息
      wx.setStorageSync('shopInformation', res.data.data);
      resolve(res)
    }).catch((res) =>{
      reject(res)
    })
  });
  return promi;
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
// 向后台发消息
const sendMessage = (orderNo, shopId, userCode, messageType=null) => {
  let promi = new Promise((resolve, reject) => {
    reqAsync('shop/getRoomIdSendMessage', {
      orderNo: orderNo,
      shopId: shopId,
      userCode: userCode,
      type: messageType // 1是餐饮线下， 2是预约， null是线上
    }).then((res) => {
      resolve(res)
    }).catch((res) => {
      reject(res)
    })
  })
  return promi
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
  formatIOS: formatIOS,
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
  getParams: getParams,
  appLogin: appLogin,
  getShop: getShop,
  checkWxLoginShare: checkWxLoginShare,
  SHARE_URL: SHARE_URL,
  SOCKET_URL: SOCKET_URL,
  sendMessage: sendMessage,
  cacheShop: cacheShop
}
