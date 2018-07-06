//获取应用实例
const app = getApp();
Page({
  data:{
    shopInformation: {},//商铺信息
    indicatorDots:true, //是否显示面板指示点
    autoplay:true,     //是否自动切换
    interval:3000,     //自动切换时间间隔3s
    duration:1000,
    imgUrls:[], 
    shopId:'' ,
    goodsId:'',
    //商品详情
    detailImg:[
      "http://7xnmrr.com1.z0.glb.clouddn.com/detail_1.jpg",
      "http://7xnmrr.com1.z0.glb.clouddn.com/detail_2.jpg",
      "http://7xnmrr.com1.z0.glb.clouddn.com/detail_3.jpg",
      "http://7xnmrr.com1.z0.glb.clouddn.com/detail_4.jpg",
      "http://7xnmrr.com1.z0.glb.clouddn.com/detail_5.jpg",
      "http://7xnmrr.com1.z0.glb.clouddn.com/detail_6.jpg"    
    ],
    hideView: true,
    num: 0,
    shopId: '',
    goodsId: '',
    //用户信息
    userData: []
  },
  previewImage:function(e){
    var current=e.target.dataset.src;
    wx.previewImage({
      current:current,//当前显示图片的http链接
      urls: this.data.imgUrls //需要预览的图片http链接列表
    })
  },
  onLoad: function(options){
    //获取店铺信息
    if (app.globalData.shopInfo) {
      this.setData({
        shopInformation: app.globalData.shopInfo,
        hasShopInfo: true
      })
    }
    //获取商品详情
    app.util.reqAsync('shop/goodsDetail',{
      shopId: options.shopId,
      goodsId: options.goodsId
    }).then((res) =>{
      var resData=res.data.data;     
      this.setData({
        shopId: options.shopId,
        goodsId: options.goodsId,
        goodsName: resData.goodsName,
        descContent: resData.descContent,
        batchPrice: resData.batchPrice,
        stockBalance: resData.stockBalance,
        payCount: resData.payCount,
        imgUrls: [resData.imageList[0].smallFilePath, resData.imageList[0].smallFilePath, resData.imageList[0].smallFilePath]
      })
    });
    //获取商品评论
    app.util.reqAsync('shop/commentList',{
      type: 0,
      hasPicture: 0,
      shopId: 808,
      goodsId: 2117,
      pageNo: 1,
      pageSize: 2
    }).then((res)=>{
      var data = res.data.data;
      for (var i = 0; i < data.length; i++) {
        var key = 'creatTime';
        var value = data[i].commentDate.slice(0, 11)
        data[i][key] = value
      };
      this.setData({
        userData: data,
        all:data.length
      });
      //判断数据并显示隐藏占位图
      if (this.data.userData.length == 0) {
        this.setData({
          hideView: false
        })
      } else {
        this.setData({
          hideView: true
        })
      }     
    });

    //获取问答内容
    app.util.reqAsync('shop/getGoodsQuestions', {
      shopId: 808,//options.shopId
      goodsId: 2117,//options.goodsId
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      var data = res.data.data
      this.setData({
        askAcount: res.data.total,
        askData: data
      })
    })    
  },

  //跳转到评价
  toAppraise(){
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + 288 + '&goodsId=' + goodsId
    })
  },
  //跳转到问答详情
  toAsk(){
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;    
    wx.navigateTo({
      url: '/pages/ask/ask?shopId=' + 288 + '&goodsId=' + goodsId,
    })
  },
  //跳转到购物车
  addCar(){
    wx.switchTab({
      // url: '/pages/shopping-cart/shopping-cart',
    })
  },
  immeBuy(){
    wx.showToast({
      title:'购买成功',
      icon:'success',
      duration:2000
    })
  },
  preventTouchMove: function(){

  }
})