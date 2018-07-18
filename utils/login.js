// // 检测是否已微信登陆，否，则先登陆微信
// // 微信登陆后判断是否登陆app，否，则跳转到app注册页
// // app登陆后判断是否有店铺信息，否，则跳转到扫码页
// console.log(1)
// const checkWxLogin = () => {
//   console.log(5646546556)
//   wx.checkSession({
//     success: () => {
//       console.log(895344805989458)
//       // 未登陆app则跳转到登陆/注册页
//       if (!isAppUser()) {
//         console.log(111111)
//         wx.navigateTo({ url: '/pages/reg/reg' });
//         return;
//       }
//       // 无本地店铺则跳转到扫码页
//       if (!hasShop()) wx.navigateTo({ url: '/pages/scan/scan' });
//     },
//     // 未登陆，则登陆微信
//     fail: function () {
//       console.log(222222)
//       wx.showLoading({
//         title: '微信登陆中，请稍候...',
//       })
//       wx.login({
//         success: (res) => {
//           // 微信登陆，获取code，调用后台接口登陆app账户
//           util.reqAsync('payBoot/wx/miniapp/login', {
//             code: res.code
//           }).then((res) => {
//             console.log(res)
//             if (res.data.code != 1) {
//               loginFailed()
//               wx.navigateTo({ url: '/pages/reg/reg' })
//               return
//             }
//             wx.setStorageSync('loginToken', res.data.data.loginToken);
//             wx.setStorageSync('scSysUser', res.data.data.scSysUser);
//             // 未注册用户跳转到注册页面
//             if (!isAppUser()) wx.navigateTo({ url: '/pages/reg/reg' });
//           })
//         },
//         fail: loginFailed
//       })
//     }
//   })
// }

// // 登陆失败处理
// const loginFailed = () => {
//   wx.hideLoading();
//   wx.showToast({
//     title: '登陆失败，请稍后再试！',
//     icon: 'none',
//     duration: '2000'
//   })
// }

// // 判断本地当前有无店铺
// const hasShop = () => {
//   var shop = wx.getStorageSync('shop');
//   return shop && shop.shopId
// }

// // 判断是否App用户
// const isAppUser = () => {
//   var scSysUser = wx.getStorageSync('scSysUser');
//   return scSysUser && scSysUser.id
// }
