Page({
  winHeight: "",//窗口高度
  data: {
    type: 2, //0 待付款，1 待发货 2 待收货 3待评价 4取消 5已退款 6申请退款审核中 7已评价
    sentType:1, //1-快递 2-店内
    typeVal:"代发货",
    sentVal:"申通快递",
    sentNumber:"1665656565656",
    userName:"乐小李",
    phone:15645956565,
    address:"湖北省武汉市武昌区中北路青鱼嘴东沙大厦13楼湖北省武汉市武昌区中北路青鱼嘴东沙大厦13楼",
    orderNum:1555656565656652,
    orderTime:"2015-6-15 15:30:26",
    shopName:"乐盯旗舰店",
    payType:1,
    paytypeVal:"智享账户支付",
    discounts:20,
    sentPrice:0,
    paid:300,
    goods: [
      {
        goodsName: '新款夏季连衣裙荷ins热门款',
        size: '藕粉色-S码',
        price: '300.00',
        num: '10',
        url: 'img/1.gif'
      },
      {
        id: 0,
        goodsName: '新款夏季连衣裙荷叶袖收腰ins热门款',
        size: '藕粉色-S码',
        price: '300.00',
        num: '10',
        url: 'img/1.gif'
      }]
  },
  onLoad: function () {
    var that = this;
    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id
    query.select('#userInfo').boundingClientRect()
    query.exec(function (res) {
      //res就是 所有标签为userInfo的元素的信息 的数组
      console.log(res);
      //取高度
      console.log(res[0].height);
      var height = res[0].height + 420;
      console.log(height);
      that.setData({
        winHeight: height
      })
    })

    //调接口
    app.util.reqAsync('shop/getOneOrderDetail', {
      id: 54667
    }).then((data) => {
      console.log(data)
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    })
  },
  calling: function () {
    //拨打电话
    wx.makePhoneCall({
      phoneNumber: '12345678900', //此号码并非真实电话号码，仅用于测试
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  
})