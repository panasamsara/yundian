// pages/myHome/order/applyRefund/applyRefund.js
const app = getApp();
var user = wx.getStorageSync('scSysUser');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderStatus:'',
    orderNo:'',
    returnAmount:'',
    returnType: '',//类型0-退货退款，1-仅退款",
    returnReason: '',//退款原因
    returnDesc:'',//退款描述
    array: ['请选择退款原因','未按约定时间发货', '多拍/错拍/不想要', '其他'],
    img1:'',
    img2:'',
    img3:'',
    objectArray: [
      {
        id:0,
        name:'请选择退款原因'
      },
      {
        id: 1,
        name: '未按约定时间发货'
      },
      {
        id: 2,
        name: '多拍/错拍/不想要'
      },
      {
        id: 3,
        name: '其他'
      }
    ],
    index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.orderStatus==2){
      var returnType = 0
    }else{
      var returnType = 1
    }
    this.setData({
      orderStatus: options.orderStatus,//货物状态0-代发货,1-配送中,2-已收货",
      orderNo: options.orderNo, //订单编号
      returnAmount: options.returnAmount, //退款金额
      returnType: returnType //类型0-退货退款，1-仅退款"
    })
  },

  selectImg: function () {
    //上传图片
    var self = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        self.setData({
          img1: res.tempFilePaths[0]
        })
      }
    })
  },
  selectImg1: function () {
    //上传图片
    var self = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        self.setData({
          img2: res.tempFilePaths[0]
        })
      }
    })
  },
  selectImg2: function () {
    //上传图片
    var self = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        self.setData({
          img3: res.tempFilePaths[0]
        })
      }
    })
  },
  /**
   * 切换退款原因
   */
  bindPickerChange: function (e) {
    var val = e.target.dataset.val,
      inx = e.detail.value;
    this.setData({
      index: e.detail.value,
      returnReason: this.data.array[inx]
    })
  },
  sure:function(e){
    if(this.data.index==0){
      wx.showToast({
        title: '请选择退款原因……',
        icon: 'none'
      })
      return false;
    }
    var returnCertificate = (this.data.img1 + ',' + this.data.img2 + ',' + this.data.img3).split(',');
    
    app.util.reqAsync('shop/returnOnlineOrder', {
      returnCertificate: returnCertificate,//凭证
      orderStatus: this.data.orderStatus,//货物状态0-代发货,1-配送中,2-已收货",
      orderNo: this.data.orderNo, //订单编号
      returnAmount: this.data.returnAmount, //退款金额
      returnType: this.data.returnType, //类型0-退货退款，1-仅退款"
      returnReason: this.data.returnDesc, //退款原因
      returnDesc: this.data.returnDesc //退款描述
    }).then((res) => {
      if(res.data.data.code==1){ //申请成功回到订单
        wx.navigateTo({
          url: '../orderDetail/orderDetail?orderNo=' + this.data.orderNo 
        })       
      }else{
        wx.showToast({
          title: res.data.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  }

})