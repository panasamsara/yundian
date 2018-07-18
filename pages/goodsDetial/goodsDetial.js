//获取应用实例
const app = getApp();
Page({
  data:{
    shopInformation: {},//商铺信息
    indicatorDots:true, //是否显示面板指示点
    // imgUrls:[], 
    hideView1: true,
    hideView2:true,
    num: 0,
    shopId:'',
    goodsId:'',
    //用户信息
    userData: [],
    //商品信息
    goodsData:{},
    flag:false,
    flag1:false,
    flag2: false,
    //拼单部分参数
    groupBuyingId: '',//对应拼团表的id
    status:'',//状态
    cUser:'',//发起拼团者id,
    list:[],
    flagCount:'',
    flagSpellList:''

  },
  // previewImage:function(e){
  //   console.log(e)
  //   var current=e.target.dataset.src;
  //   wx.previewImage({
  //     current:current,//当前显示图片的http链接
  //     urls: this.data.imgUrls.bigFilePath //需要预览的图片http链接列表
  //   })
  // },
  onLoad: function(options){
     if (options.groupBuyingId && options.cUser && options.status){
       this.setData({
         groupBuyingId: options.groupBuyingId,
         cUser: options.cUser,
         status: options.status,
         flagCount:true,
         flagSpellList:true
       });
       var parm = {
         shopId: 111 ,// options.shopId,//
         goodsId: 101  // options.goodsId //     
       }
       this.getData(parm);
       var timer = setInterval(() => { this.count() }, 1000);       
     }else{
       this.setData({
         flagCount:false,
         flagSpellList:false
       })
     }

    
    //获取店铺信息
    var shop = wx.getStorageSync('shop');
    this.setData({
      shopId: options.shopId,
      goodsId: options.goodsId,      
      shopName:shop.shopName,
      picImg: shop.logoUrl,
      shopDesc: shop.shopDesc,
      score: shop.score
    });
 


    //获取商品详情
    app.util.reqAsync('shop/goodsDetail',{
      shopId: options.shopId,
      goodsId: options.goodsId
    }).then((res) =>{
      var resData=res.data.data;
       console.log(resData)
      if (resData){
        wx.setStorageSync('stock', resData.stockList)
        if (resData.descContent==null){
          this.setData({
            descContent: ''
          })
        }else{
          var content = resData.descContent.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' '); 
          this.setData({
            descContent: content
          })         
        }
        this.setData({
          goodsData: resData,
          goodsName: resData.goodsName,//商品名称
          goodsType: resData.goodsType,//商品类别
          shopId: resData.shopId,//店铺id
          id: resData.id,//id
          shopName: resData.shopName,//店铺名
          deliveryCalcContent: resData.deliveryCalcContent,//商品运费
          stockList: resData.stockList,//商品规格
          batchPrice: app.util.formatMoney(resData.price,2),//
          price: resData.price,//商品价格
          stockBalance: resData.stockBalance,//库存
          payCount: resData.payCount,//销量
          picUrl: resData.pictureUrl,//商品图片地址
          imgUrls: resData.imageList
        })
        console.log(this.data.imgUrls)
        //存储商品信息
        wx.setStorageSync('goodsInfo', resData)        
      } 
    });
    //获取商品评论
    app.util.reqAsync('shop/commentList',{
      type: 0,
      hasPicture: 0,
      shopId: options.shopId,
      goodsId: options.goodsId,
      pageNo: 1,
      pageSize: 2
    }).then((res)=>{
      var data = res.data.data;
      // console.log(data)
      if(data){
        for (var i = 0; i < data.length; i++) {
          var key = 'creatTime';
          var value = data[i].commentDate.slice(0, 11)
          data[i][key] = value
        };
        this.setData({
          userData: data,
          all: res.data.total
        });
      }else{
        this.setData({
          all:0
        })
      }
      //判断数据并显示隐藏占位图
      if (this.data.userData.length == 0) {
        this.setData({
          hideView1: false
        })
      } else {
        this.setData({
          hideView1: true
        })
      }     
    });

    //获取问答内容
    app.util.reqAsync('shop/getGoodsQuestions', {
      shopId: options.shopId,
      goodsId: options.goodsId,
      pageNo: 1,
      pageSize: 2
    }).then((res) => {
      var data = res.data.data 
      this.setData({
        askAcount: res.data.total,
        askData: data
      });
      if (this.data.askData.length == 0){
        this.setData({
          hideView2: false
        })
      }else{
        hideView2: true
      }
    });  
  },
  // 获取拼单详情
  // getData: function (parm) {
  //   app.util.reqAsync('shopSecondskilActivity/getServerNowTime').then((res) => {
  //     if (res.data) {
  //       this.setData({
  //         nowTime: res.data.data
  //       })
  //     }
  //   })
  //   app.util.reqAsync('shop/goodsDetailAddGroupBuying',parm).then((res) => {
  //     if(res.data){
  //       var oldData = this.data.list;
  //       var data = res.data.data
  //       var list = data.groupBuyingList;

  //       var newData = oldData.concat(list);
  //       for (var i = 0; i < list.length; i++) {
  //         list[i].activityStartTime = Date.parse(this.data.nowTime);
  //         list[i].activityEndTime = Date.parse(list[i].endTime);
  //         list[i].count = list[i].activityEndTime - list[i].activityStartTime;
  //       };
  //       this.setData({
  //         list: newData,
  //         groupBuyingPrice: data.groupBuyingPrice,
  //         groupBuyingAllNum: data.groupBuyingAllNum,
  //         plistData: data.groupBuyingList
  //       })
  //     }
  //   })
  // },  
  // //跳转到拼单
  // toLayer(){   
  //   this.setData({
  //     flag:true ,
  //     flag1:true
  //   });
  //   app.util.reqAsync('shop/getSmallGroupListYQ',{
  //     groupBuyingId:'',// this.data.groupBuyingId,//对应拼团表的id"
  //     status:'',// this.data.status,   //状态：0未生效，1成功,2过期"
  //     cUser:'',// this.data.cUser,   //发起拼组者id",
  //     pageNo: 1,
  //     pageSize: 10        
  //   }).then((res)=>{
  //     var data=res.data.data;
  //     this.setData({
  //       allListData:data
  //     })
  //   })
  // },
  // //关闭拼单弹出层
  // closeLayer(){
  //   this.setData({
  //     flag:false,
  //     flag1:false,
  //     flag2:false
  //   })
  // },
  // //去拼单
  // toJoin(e){         //需要的数据已存到e里面
  //   this.setData({
  //     flag:true,
  //     flag1:false,
  //     flag2:true
  //   });
  //   app.util.reqAsync('shop/getSmallGroupUserListYQ',{
  //     groupId:'',
  //     smallGroupId:'' ,//   #（选填）对应拼组表id",
  //     status:'', //状态：0已付款，1申请退款",
  //     cUser:'',   //参与者用户id",
  //     pageNo:'', 
  //     pageSize: ''    
  //   }).then((res)=>{
  //     var data=res.data.data 
  //     this.setData({
  //       picData:data
  //     })
  //   })
  // },
  // //参与并拼单
  // joinBuy(e){
  //   var pictureUrl = this.data.goodsData.pictureUrl;//图片地址
  //   var groupBuyingPrice = this.data.groupBuyingPrice;//价格
  //   var stockBalance = this.data.stockBalance;//库存
  //   wx.navigateTo({
  //     url: '../buyNow/buyNow?pictureUrl=' + pictureUrl + '&groupBuyingPrice=' + groupBuyingPrice + '&stockBalance=' + stockBalance
  //   })

  // },
  //跳转到评价
  toAppraise(){
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;
    wx.navigateTo({
      url: '../appraise/appraise?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  //跳转到问答详情
  toAsk(){
    var shop = wx.getStorageSync('shop');
    var goodsId = this.data.goodsId;
    var shopId = this.data.shopId;    
    wx.navigateTo({
      url: '/pages/ask/ask?shopId=' + shopId + '&goodsId=' + goodsId
    })
  },
  //跳转到店铺
  goShop(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  //跳转到立即购买
  tobuy(){
    wx.navigateTo({
      url: '/pages/buyNow/buyNow',
    })
  },
  //购物车
  addCar(){
    wx.switchTab({
      url: '/pages/proList/proList',
    })
  },
  // 倒计时方法
  count(){
    let _this = this;
    for (let i = 0; i < this.data.list.length; i++) {
      let leftTime = this.data.list[i].count;
      leftTime -= 1000;
      if (leftTime <= 0) {
        leftTime=0
      }
      let d = Math.floor(leftTime / 1000 / 60 / 60 / 24),
        h = Math.floor(leftTime / 1000 / 60 / 60 % 24),
        m = Math.floor(leftTime / 1000 / 60 % 60),
        s = Math.floor(leftTime / 1000 % 60),
        rh =h,
        count = "plistData[" + i + "].count",
        rhCount = "plistData[" + i + "].rh",
        mCount = "plistData[" + i + "].m",
        sCount = "plistData[" + i + "].s";
      if (h < 10) {
        h = "0" + h;
      }
      if (m < 10) {
        m = "0" + m;
      }
      if (s < 10) {
        s = "0" + s;
      }
      this.setData({
        [count]: leftTime,
        [rhCount]: rh,
        [mCount]: m,
        [sCount]: s
      })
    }
  }  
})