// packageIntegral/pages/goodsdetail/goodsdetail.js
import saveImg from "../../../utils/saveImg.js"
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId:'',
    goodsId:'',
    goodsType:'',
    loginType:0,
    data:{},
    btnShow: 'normal'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('测试转发',options)
    if (options.shareUser) {//转发进入页面记录推荐关系
      this.record({
        currentId: wx.getStorageSync('scSysUser').id,
        shareShop: options.shopId,
        shareUser: options.shareUser,
        sourcePart: '1',
        shareType: options.shareType,
        businessId: options.goodsId
      })
    }
    if (options && options.q) {
      var uri = decodeURIComponent(options.q)
      var p = util.getParams(uri)
      let shopId = p.shopId
      wx.setStorageSync('shopId', shopId);
      this.setData({
        shopId: shopId,
      })
    } else {
      if (options && options.shopId) {
        wx.setStorageSync('shopId', options.shopId);
        this.setData({
          shopId: options.shopId
        })
      }
    }
    this.setData({
      goodsId: options.goodsId,
      goodsType: options.goodsType
    })
    // let shopId = options.id,
       
  },
  record: function (data) {//记录推荐关系
    console.log('测试入参',data)
    app.util.reqAsync('payBoot/wx/acode/record', data).then((res) => {})
  },
  getPoint:function(params){//获取账户积分
    app.util.reqAsync('shop/selectOrderSettleInfo', params).then((res) => {
      if (res.data.data.userCreditsInfo){
        this.setData({
          usablePoint: res.data.data.userCreditsInfo.usablePoint
        })
      }
    }).catch((err) => {
      console.log(err);
    })
  },
  getData:function(params){//获取商品详情
    wx.showLoading({
      title: '加载中',
      icon: 'none'
    })
    app.util.reqAsync('shop/selectCreditsGoodsById', params).then((res) => {
      if (res.data.data) {
        let data = res.data.data;
        if (data.descContent != null && data.descContent != '') {//商品详情富文本编辑器处理
          data.descContent = data.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/(background-color|font-size)[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "").replace(/\<img/gi, '<img style="max-width:100%;height:auto" ');
        }
        this.setData({
          data:res.data.data,
          status:'done'
        })
      }
      wx.hideLoading();
    }).catch((err) => {
      console.log(err);
      wx.hideLoading();
    })
  },
  exchange:function(){//立即兑换
    if(this.data.status!='done'){
      return;
    }
    let usablePoint = this.data.usablePoint;
    if (usablePoint < this.data.data.point){
      wx.showToast({
        title: '您的积分不足',
        icon:'none'
      })
      return 
    }
    wx.navigateTo({
      url: '../orderConfirm/orderConfirm?id=' + this.data.data.id
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this =this;
    app.util.checkWxLogin('share').then((loginRes) => {
      if (loginRes.status == 0) {
        // if (wx.getStorageSync('isAuth') == 'no') {
        // this.setData({
        //   loginType: 2
        // })
        // } else if (wx.getStorageSync('isAuth') == 'yes') {
        this.setData({
          loginType: 1
        })
        // }
      }else{
        if (wx.getStorageSync('shop')){
           var params1 = {
              userId: wx.getStorageSync('scSysUser').id,
             shopId: _this.data.shopId,
              pageNo: 1,
              pageSize: 10,
              merchantId: wx.getStorageSync('shop').merchantId
            },
           params2 = {
             goodsId: _this.data.goodsId,
             shopId: _this.data.shopId,
             merchantId: wx.getStorageSync('shop').merchantId,
             goodsType: _this.data.goodsType
            }
          //查询账户剩余积分
          _this.getPoint(params1);
          //查询积分商品详情
          _this.getData(params2);
        }else{
          app.util.getShop(loginRes.id, _this.data.shopId).then(function (res) {
            //shop存入storage
            wx.setStorageSync('shop', res.data.data.shopInfo);
            //活动
            wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
            // 所有信息
            wx.setStorageSync('shopInformation', res.data.data);
            var params1 = {
              userId: wx.getStorageSync('scSysUser').id,
              shopId: _this.data.shopId,
              pageNo: 1,
              pageSize: 10,
              merchantId: wx.getStorageSync('shop').merchantId
              },
             params2 = {
                goodsId: _this.data.goodsId,
                shopId: _this.data.shopId,
                merchantId: wx.getStorageSync('shop').merchantId,
                goodsType: _this.data.goodsType
              }; 
              //查询账户剩余积分
            _this.getPoint(params1);
              //查询积分商品详情
            _this.getData(params2);
          })
        }
        
      }
    })
    
  },
  //注册回调
  resmevent:function(){
    var _this =this
    if (wx.getStorageSync('scSysUser')) {
      _this.setData({
        loginType:0
      })
      app.util.getShop(wx.getStorageSync('scSysUser').id, _this.data.shopId).then(function (res) {
        //shop存入storage
        wx.setStorageSync('shop', res.data.data.shopInfo);
        //活动
        wx.setStorageSync('goodsInfos', res.data.data.goodsInfos);
        // 所有信息
        wx.setStorageSync('shopInformation', res.data.data);
        var params1 = {
          userId: wx.getStorageSync('scSysUser').id,
          shopId: _this.data.shopId,
          pageNo: 1,
          pageSize: 10,
          merchantId: wx.getStorageSync('shop').merchantId
        },
          params2 = {
            goodsId: _this.data.goodsId,
            shopId: _this.data.shopId,
            merchantId: wx.getStorageSync('shop').merchantId,
            goodsType: _this.data.goodsType
          };
        //查询账户剩余积分
        _this.getPoint(params1);
        //查询积分商品详情
        _this.getData(params2);
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.data.goodsName,
      desc: this.data.data.goodsName,
      imageUrl: this.data.data.pictureUrl,
      path: '/packageIntegral/pages/goodsdetail/goodsdetail?shopId=' + this.data.shopId + '&goodsId=' + this.data.data.id + '&share=share' + '&shareUser=' + wx.getStorageSync('scSysUser').id + '&shareType=4&sourcePart=1' + '&goodsType=' + this.data.goodsType,
      success: function () {
      }
    }
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../../../pages/index/index?shopId=' + this.data.shopId
    })
  },
  shareBtn: function () {//点击分享
    this.setData({
      posterShow: true,
      untouch: 'untouch'
    })
  },
  closeShare: function () {//关闭分享
    this.setData({
      posterShow: false,
      untouch: 'touch'
    })
  },
  drawPoster: function () {//绘制海报
    if (this.data.canvasUrl) {
      return;
    }
    wx.showLoading();
    var _this = this,
        shopName=saveImg.cut(this.data.data.shopInfo.shopName,7,_this),
        proName=saveImg.cut(this.data.data.goodsName,10,_this); 
    if (!this.data.codeUrl) {
      saveImg.getCode(_this, {
        source: 0,
        page: "pages/QrToActivity/QrToActivity",
        params: {
          shopId: wx.getStorageSync('shop').id,
          userId: wx.getStorageSync('scSysUser').id,
          shareUser: wx.getStorageSync('scSysUser').id,
          merchantId: wx.getStorageSync('shop').merchantId,
          goodsId: _this.data.goodsId,
          goodsType: _this.data.goodsType,
          sourcePart: '1',
          shareType: 4
        }
      }).then(function () {
        var pictureUrl=_this.data.data.pictureUrl;
        wx.downloadFile({//缓存积分商品图片，直接使用网络路径真机无法显示或绘制
          url: pictureUrl.split(':')[0]=='http'?pictureUrl.replace('http','https'):pictureUrl,
          success: function (res) {
            _this.setData({
              proPic: res.tempFilePath
            });
            var context=wx.createCanvasContext('shareCanvas'),
                scale=wx.getSystemInfoSync().windowWidth/375;
            context.setFillStyle('#ffffff');
            context.fillRect(0,0,690*scale,1000*scale);//设置白色背景
            context.drawImage('images/xcx_schb_jfdh_bg@2x.png', 0, 0, 690 * scale, 1000 * scale);
            context.setFontSize(28*scale);
            let w=context.measureText(shopName).width;
            context.fillText(shopName,(690-w)/2*scale,57*scale);//绘制店铺名
            saveImg.roundRect(context,scale,36,80,618,618,26);//绘制圆角矩形
            context.save();
            saveImg.roundRect(context,scale,39,83,612,612,26);//绘制圆角矩形显示白色边框
            context.clip();
            context.drawImage(_this.data.proPic,39*scale,80*scale,612*scale,612*scale);//绘制商品图片
            context.restore();
            context.drawImage('images/xcx_schb_jfdh_top@2x.png',0,0,690*scale,1000*scale);//绘制背景图
            context.fillText('价值￥'+_this.data.data.memberPrice,70*scale,900*scale);//绘制价值
            context.setFontSize(24*scale);
            context.fillText(proName,70*scale,845*scale);//绘制商品名
            context.drawImage(_this.data.codeUrl,518*scale,817*scale,138*scale,138*scale);
            context.draw(false,function(){
              setTimeout(function () {
                saveImg.temp(_this,'shareCanvas',1380,2000,1380,2000);
              }, 1000);
            })
          }
        })
      });
    }
  },
  saveImg: function () {//保存图片
    var that = this;
    saveImg.saveImg(that);
  },
  handleSetting: function (e) {//授权
    let that = this;
    saveImg.handleSetting(that, e.detail.e);
  }
})