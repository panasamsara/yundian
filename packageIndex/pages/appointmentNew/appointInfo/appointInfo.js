// packageIndex/pages/appointmentNew/appointInfo/appointInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    choseIndex:0,
    userIndex:0,
    numList:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    userList: [{ name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }, { name: '测试一号', phone: '123456789' }],
    textareaShow:false,
    focusStatus:false,
    remark:'如果您有其他需求，请备注在这里~'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  showNum:function(){//显示人数选择
    this.setData({
      numShow: true
    })
  },
  hideNum:function(){//关闭人数选择
    this.setData({
      numShow:false
    })
  },
  choseNum:function(e){//选择人数
    this.setData({
      choseIndex:e.currentTarget.dataset.index
    })
  },
  choseUser:function(e){//选择预约用户信息
    this.setData({
      userIndex: e.currentTarget.dataset.index
    })
  },
  showModal:function(){//显示用户信息弹框
    this.setData({
      showModal:true,
      showShade:true
    })
  },
  closeModal:function(){//关闭弹框
    this.setData({
      showModal:false,
      showText:false,
      showShade:false
    })
  },
  showTextModal:function(){//显示输入框弹框
    this.setData({
      showText:true,
      showShade:true
    })
  },
  setRemark:function(e){//存入textarea的value
    let remarkFormatExp = new RegExp("[~'!@#￥$%^&*()-+_=:]"),
        text = e.detail.value;
    if (remarkFormatExp.test(text)) {
      return
    }else{
      this.setData({
        text: e.detail.value.replace(/\s+/g, '')
      });
    }
  },
  confirm:function(){//确定
    let ranges = [
          '\ud83c[\udf00-\udfff]',
          '\ud83d[\udc00-\ude4f]',
          '\ud83d[\ude80-\udeff]'
        ],
        text=this.data.text.replace(new RegExp(ranges.join('|'), 'g'), '');
    this.setData({
      text: text,
      remark: text,
      showShade:false,
      showText:false
    });
  },
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})