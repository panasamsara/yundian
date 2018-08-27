// pages/ask/ask.js
//获取应用实例
const app = getApp();
Page({
  data: {
    myValue:'',
    askData:[],
    placeholder:'向买过的人提问',
    tips:'',
    shopId:'',
    goodsId:''
  },
  onLoad: function (options) {
    console.log('111111111111111111111',options);
    shopId = options.shopId,
    goodsId = options.goodsId
  },
  // 获取页面信息
  getData:function(){
    var parm={
      shopId: this.data.shopId,
      goodsId: this.data.goodsId,
      pageNo: 1,
      pageSize:10
    };
    app.util.reqAsync('shop/getGoodsQuestions',parm).then((res)=>{
      var data = res.data.data
      if(data.length==0){
        this.setData({
          isShow3:true,
          askAcount:0
        })
      }else{
        isShow3:false;
        for (var i = 0; i < data.length; i++) {
          var key = 'time';
          var value = data[i].createTime.slice(0, 11)
          data[i][key] = value;
        }; 
        this.setData({
          askAcount: res.data.total,
          askData: data,
          isShow3: false
        }) ;
        if (data.answers == null) {
          this.setData({
            isShow1: true,
            isShow2: true
          })
        }              
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var user = wx.getStorageSync('scSysUser')
    console.log(user);

    this.setData({
      goodsId: options.goodsId,
      shopId: options.shopId,
      userId: user.id,
    })
    var shop = wx.getStorageSync('shop');
    this.getData();  
  },
  onShow: function(){
    var _this = this
    var goodsId = this.data.goodsId
    var shopId = this.data.shopId

    var parm = {
      shopId: shopId,
      goodsId: goodsId,
      customerId: wx.getStorageSync('scSysUser').id
    }
    //获取商品信息
    app.util.reqAsync('shop/goodsDetailAddGroupBuying', parm).then((res) => {
      console.log(res.data.data)
      _this.setData({
        picImg: res.data.data.pictureUrl,
        goodsName: res.data.data.goodsName,
        goodsDesc: res.data.data.descTitle
      })
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    var that=this
    wx.showNavigationBarLoading()//在标题栏中显示加载
    setTimeout(function(){
      that.getData();
      wx.hideNavigationBarLoading()//完成停止加载
      wx.stopPullDownRefresh();
    },1500)
  },  
  //跳转到问题详情页
  tosakDetail(e){
    var questionId = e.currentTarget.dataset.questionid;
    wx.navigateTo({
      url: '/pages/askDetail/askDetail?questionId=' + questionId + '&userId=' + this.data.userId,
    })
  },
  //获取input框的内容
  inputvalue(e){
    this.setData({
      myValue:e.detail.value
    })
  },
  //提交我的问答
  myAsk(){
    var shop = wx.getStorageSync('shop');
    var parm={
      shopId: shop.id,
      goodsId: this.data.goodsId,
      content: this.data.myValue,
      createUser: this.data.userId
    };
    app.util.reqAsync('shop/addQuestion',parm).then((res) =>{
      this.setData({
        placeholder:'向买过的人提问',
        myValue:'',
        tips:res.data.msg
      })
      wx.showModal({
        title: this.data.tips,
        icon:'none',
        duration: 2000
      });      
    })
  }

})