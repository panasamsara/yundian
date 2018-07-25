// pages/appraise/appraise.js
//获取应用实例
const app = getApp();
Page({
  data: {
    hideView:true,
    num:0,
    shopId:'',
    goodsId:'',
    //用户信息
    userData:[],
    pageNo:1,
    hasPicture:0
  },
  //公用方法
  getData:function (type){
    var parm={
      type: 0,
      hasPicture: this.data.hasPicture,
      shopId: this.data.shopId,
      goodsId: this.data.goodsId,
      pageNo: this.data.pageNo,
      pageSize: 20,
      viewType: type      
    };
    app.util.reqAsync('shop/commentList',parm).then((res)=>{
      var data = res.data.data;
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        var key = 'creatTime';
        var value = data[i].commentDate.slice(0, 11)
        data[i][key] = value
      };
      this.setData({
        userData: data
      }) ;
      //判断数据并显示隐藏占位图
      if(this.data.userData.length==0){
        this.setData({
          hideView:false
        })
      } else {
        this.setData({
          hideView:true
        })
      }   
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var shop = wx.getStorageSync('shop');
    //获取评论列表
    this.data.shopId = options.shopId
    this.data.goodsId = options.goodsId
    this.getData(0);

    //获取商品各种评论数
    app.util.reqAsync('shop/getGoodsKindsCommentNum',{
      shopId: this.data.shopId,
      goodsId: this.data.goodsId
    }).then((res)=>{
      var resData=res.data.data
      this.setData({
        all:resData.all,
        nice: resData.nice,
        medium: resData.medium,
        negative: resData.negative,
        hasPic: resData.hasPic
      })
    })
  },
  //点击切换
  chose: function (e) {
    if (e.currentTarget.dataset.type==66){
      app.util.reqAsync('shop/commentList',{
        type: 0,
        hasPicture:1,
        shopId: this.data.shopId,
        goodsId: this.data.goodsId,
        pageNo: this.data.pageNo,
        pageSize: 20        
      }).then((res)=>{
        var data=res.data.data;
        if(data.length==0){
          this.setData({
            hideView:false
          })
        }else{
          this.setData({
            userData: data,
            hideView: true
          })
        }
      })
    }else{
      this.getData(e.currentTarget.dataset.type);
    }
    
    this.setData({
      num: e.currentTarget.dataset.type
    })
  },
  //上拉加载

  onReachBottom: function () {
    // this.setData({
    //   pageNo: this.data.pageNo+1
    // });
    // console.log(this.data.pageNo)
    // var num=this.data.num
    // this.getData(num)
  }

})