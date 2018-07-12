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
    hideView: true,
    num: 0,
    //用户信息
    userData: [],
    flag:false,
    flag1:false,
    flag2: false
  },
  previewImage:function(e){
    var current=e.target.dataset.src;
    wx.previewImage({
      current:current,//当前显示图片的http链接
      urls: this.data.imgUrls //需要预览的图片http链接列表
    })
  },
  onLoad: function(options){
    var shop = wx.getStorageSync('shop');
    //获取商品详情
    app.util.reqAsync('shop/goodsDetail',{
      shopId: options.shopId,
      goodsId: options.goodsId
    }).then((res) =>{
      var resData=res.data.data; 
      if (resData){
        // 富文本不能有id和#号，还要满足解析要求
        // console.log(resData.descContent)
        // var str = resData.descContent.replace(/id=\"\w+\"/g, '')
        // str = str.replace(/(#\w{6})|(#\w{3})/g, function (color) {
        //   return app.util.hexToRGB(color)
        // });
        this.setData({
          goodsName: resData.goodsName,
          descContent: resData.descContent,
          batchPrice: resData.batchPrice,
          stockBalance: resData.stockBalance,
          payCount: resData.payCount,
          imgUrls: [resData.imageList[0].smallFilePath, resData.imageList[0].smallFilePath, resData.imageList[0].smallFilePath]
        })
      }    

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
      if(data){
        for (var i = 0; i < data.length; i++) {
          var key = 'creatTime';
          var value = data[i].commentDate.slice(0, 11)
          data[i][key] = value
        };
        this.setData({
          userData: data,
          all: data.length
        });
      }else{
        this.setData({
          all:0
        })
      }
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
  //跳转到拼单
  toLayer(){
    this.setData({
      flag:true ,
      flag1:true
    })
  },
  //关闭拼单弹出层
  closeLayer(){
    this.setData({
      flag:false,
      flag1:false,
      flag2:false
    })
  },
  //去拼单
  toJoin(){
    this.setData({
      flag:true,
      flag2:true
    })
  },
  //跳转到评价
  toAppraise(){
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = 808;
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + 288 + '&goodsId=' + goodsId
    })
  },
  //跳转到问答详情
  toAsk(){
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = 808;    
    wx.navigateTo({
      url: '/pages/ask/ask?shopId=' + 288 + '&goodsId=' + goodsId,
    })
  },
  //跳转到店铺
  goShop(){
    wx.switchTab({
      url: '/pages/index/index'
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
  }
})