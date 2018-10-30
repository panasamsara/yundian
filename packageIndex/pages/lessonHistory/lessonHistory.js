// packageIndex/pages/lessonHistory/lessonHistory.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arr: [],
    total: 0
  },
  timeAgo: function (time) {
    //今天0：0：0
    var integral_point = Date.parse(new Date(new Date(new Date().toLocaleDateString()).getTime())), // 当天0点
      oneDay_point = integral_point - 24 * 60 * 60 * 1000,//前一天0点
      twoDay_point = integral_point - 48 * 60 * 60 * 1000,//前两天0点
      oneMonth_point = integral_point - 30 * 24 * 60 * 60 * 1000,
      oneYear_point = integral_point - 365 * 24 * 60 * 60 * 1000;
    var _this = this;
    var now = new Date().getTime();
    var dateTimeStamp = Date.parse(time.replace(/-/gi, "/"));
    var day = 24 * 60 * 60;
    var month = day * 30;
    var year = month * 12;
    //时间戳详减得到秒
    var diffValue = parseInt((now - dateTimeStamp) / 1000);
    var result = "";
    var temp1 = diffValue / day,
      temp2 = diffValue / month,
      temp3 = diffValue / year;
    //计算具体多少天前
    var newdateTimeStampstr = Date.parse(time.substring(0, 10).replace(/-/gi, "/")+" 00:00:00");
    if (dateTimeStamp - integral_point >= 0) {
      result = "今天";
      if (now - dateTimeStamp < 60 * 1000 &&now - dateTimeStamp > 0) {
        result = "刚刚";
      }
    } else {
      result = _this.toChinesNum(parseInt((integral_point - newdateTimeStampstr)/1000/day)) + "天前";
      if (dateTimeStamp - oneDay_point > 0) {
        result = '昨天';
      } else if (dateTimeStamp - oneDay_point < 0 && dateTimeStamp - twoDay_point > 0) {
        result = '前天';
      } if (dateTimeStamp - oneMonth_point < 0) {
        result = _this.toChinesNum(parseInt(temp2)) + "个月前";
        if (dateTimeStamp - oneYear_point < 0) {
          result = _this.toChinesNum(parseInt(temp3)) + "年前";
        }
      }
    }
    return result;
  },
  // flag，true，表示初始化
  getList: function (flag) {
    wx.showNavigationBarLoading();
    let arr_ = flag ? [] : this.data.arr;
    let selected = this.data.selected;
    let conditions = this.data.conditions;
    let params = {
      pageNo: parseInt(arr_.length / 10) + 1,
      pageSize: 10,
      source: 2,
      type: 2,
      shopId: wx.getStorageSync('shop').id,
      userId: wx.getStorageSync('scSysUser').id
    }
    app.util.reqAsync('masterCourse/getMyRecordByCondition', params).then((res) => {
      if (res.data.code == 1) {
        let arr = arr_.concat(res.data.data);
        let lastTimeAgo = '';
        for (let i = 0; i < arr.length; i++) {
          let ta = this.timeAgo(arr[i].createTime);
          // 对比上一个timeAgo，若相同，则省略该字段
          if (lastTimeAgo == ta) {
            arr[i].timeAgo = ''
          } else {
            arr[i].timeAgo = ta;
            lastTimeAgo = ta
          }
        }
        this.setData({
          arr: arr,
          total: res.data.total
        })
      } else {
        wx.showToast({ title: res.data.msg || '加载失败！', icon: 'none' })
      }
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
    })
  },
  // 跳转到详情界面
  toDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/packageIndex/pages/lessonDetail/lessonDetail?id=' + id + "&shopId=" + this.data.shopId,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //当前时间戳
    // var now = new Date().getTime();
    var shopId = wx.getStorageSync("shop").id;
    this.setData({
      shopId: shopId,
      // now: now
    })
    this.getList()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.total > this.data.arr.length) this.getList()
  },
  toChinesNum:function(num) {
    let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
    let unit = ["", "十", "百", "千", "万"];
    num = parseInt(num);
    let getWan = (temp) => {
      let strArr = temp.toString().split("").reverse();
      let newNum = "";
      for (var i = 0; i < strArr.length; i++) {
        newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
      }
      return newNum;
    }
    let overWan = Math.floor(num / 10000);
    let noWan = num % 10000;
    if (noWan.toString().length < 4) noWan = "0" + noWan;
    return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
  }
})