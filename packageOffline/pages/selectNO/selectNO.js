// packageIndex/pages/selectNO/selectNO.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tableNo: 'A04',
    btnArr: new Array(12).fill({active: false}),
    val: '0'
  },
  // 计算
  calc: function (e) {
    // 先做样式处理
    this.btnTap(e.currentTarget.dataset.i);

    var num = e.currentTarget.dataset.num + '';
    var val = this.data.val;
    // 再做数字处理
    if(num != 'c') {
      if (val.length > 3) return;
      val = val == '0' ? num: val+num;
    } else {
      val = val.length <= 1 ? '0' : val.substr(0, val.length-1)
    }
    this.setData({
      val: val,
    })
  },
  // 跳转
  toNextPage: function (e){
    this.btnTap(e.currentTarget.dataset.i);
    if(this.data.val == '0') return wx.showToast({ title: '请输入人数！', icon: 'none' });
    wx.showToast({ title: '跳转测试！', icon: 'none' })
  },
  // 按钮样式处理
  btnTap: function (i) {
    var btnArr = this.data.btnArr;
    btnArr[i].active = true
    this.setData({
      btnArr: btnArr
    })
    setTimeout(() => {
      btnArr[i].active = false;
      this.setData({
        btnArr: btnArr
      })
    }, 100)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  }
})