// packageMyHome/pages/eventChoose/eventChoose.js
const app =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrdata:[],
    listData:[],
    shopList:[],
    activeId: '',
    msgData:'',
    flagOrder:true,
    isSend: 2,//0-快递  1-店内下单 2-自提    
    orderNo:'',
    modeList:{
        "goodsPrice": "",                  //商品价格
        "posterGoodsType": "", //添加海报商品类型 1: 商品、2: 服务卡、3: 服务套餐、4: 服务套盒 5: 手动输入商品
        "stockId": "",                 //规格id
        "goodsName": "", //商品名称
        "pictureUrl": "", //商品展示图
        "stockName": "", //规格名称
        "goodsId": '', //商品id
        "posterItemId": ''  
    }
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      activeId: options.activeId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var _this = this
    
    let shopLists=[];
    let listData=[];

    app.util.reqAsync('shop/selectActivePosterById', { "activeId": this.data.activeId }).then(res => {
      if (res.data.code == 1) {
        var msgData = res.data.data
        this.setData({
          // isSend：          
        })
        // msgData.descContent ="<view> sdasdasdasdasd</view>"
        if (msgData.itemCategoryList){
          for (var i = 0; i < msgData.itemCategoryList.length; i++) {
            if (msgData.itemCategoryList[i].activePosterItemList){
              for (var j = 0; j < msgData.itemCategoryList[i].activePosterItemList.length; j++) {
                msgData.itemCategoryList[i].activePosterItemList[j].posterItemId = msgData.itemCategoryList[i].activePosterItemList[j].id
                var modeList = {
                  "goodsPrice": msgData.itemCategoryList[i].activePosterItemList[j].goodsPrice,                  //商品价格
                  "posterGoodsType": msgData.itemCategoryList[i].activePosterItemList[j].goodsType, //添加海报商品类型 1: 商品、2: 服务卡、3: 服务套餐、4: 服务套盒 5: 手动输入商品
                  "stockId": msgData.itemCategoryList[i].activePosterItemList[j].stockId,                 //规格id
                  "goodsName": msgData.itemCategoryList[i].activePosterItemList[j].goodsName, //商品名称
                  "pictureUrl": msgData.itemCategoryList[i].activePosterItemList[j].pictureUrl, //商品展示图
                  "stockName": msgData.itemCategoryList[i].activePosterItemList[j].stockName, //规格名称
                  "goodsId": msgData.itemCategoryList[i].activePosterItemList[j].goodsId, //商品id
                  "posterItemId": msgData.itemCategoryList[i].activePosterItemList[j].posterItemId  
                }
                console.log(modeList)
                
                // Object.assign(modeList, msgData.itemCategoryList[i].activePosterItemList[j])
                // console.log(modeList)
                if(msgData.itemCategoryList[i].activePosterItemList.length==1){
                  msgData.itemCategoryList[i].activePosterItemList[j].select = true
                  listData.push(modeList)
                }else{
                  msgData.itemCategoryList[i].activePosterItemList[j].select = false

                }

              }
              this.setData({
                listData: listData
              })
              console.log(this.data.listData)
            }
            
          }
        }
        
        msgData.descContent = msgData.descContent.replace(/\s+(id|class|style)(=(([\"\']).*?\4|\S*))?/g, "").replace(/(background-color|font-size)[\s:]+[^;]*;/gi, '').replace(/\"=\"\"/g, "")
        console.log(msgData.descContent)
        _this.setData({
          arrdata: msgData.itemCategoryList
        })
        for (let i = 0; i < this.data.arrdata.length; i++) {
          if (this.data.arrdata[i].activePosterItemList.length==1){
            shopLists.push(true);
            
          }else{
            shopLists.push(false);

          }
        }
        this.setData({
          shopList: shopLists,
          msgData: msgData
        })
        console.log(shopLists)
        console.log(this.data.arrdata)

      }
    })
    
    
  },
  //微信支付
  bindTestCreateOrder: function (code) {
    // console.log(app.globalData.notify_url)
    var data = {
      subject: this.data.arrdata.activityName,
      openid: wx.getStorageSync('scSysUser').wxOpenId,
      shopId: wx.getStorageSync('shop').id,
      requestBody: {
        body: '云店小程序普通订单',
        out_trade_no: code,
        trade_type: 'JSAPI'
      }

    };
    //发起网络请求 微信统一下单   
    app.util.reqAsync('payBoot/wx/pay/unifiedOrder', data).then((res) => {
      this.setData({
        showLoading: true
      })
      if (res.data.code == 1) {
        //获取预支付信息
        var wxResult = res.data.data.wxResult;
        var prepayInfo = res.data.data.prepayInfo;
        var self = this;
        //预支付参数
        var timeStamp = '';
        var nonceStr = '';
        var packages = '';
        var paySign = '';

        if (wxResult) {
          timeStamp = res.data.data.timeStamp;
          nonceStr = wxResult.nonceStr;
          packages = 'prepay_id=' + wxResult.prepayId;
          paySign = res.data.data.paySign;
        } else if (prepayInfo) {
          timeStamp = prepayInfo.timestamp;
          nonceStr = prepayInfo.nonceStr;
          packages = prepayInfo.packages;
          paySign = prepayInfo.paySign;
        }
        //发起支付
        wx.requestPayment({
          'timeStamp': timeStamp,
          'nonceStr': nonceStr,
          'package': packages,
          'signType': 'MD5',
          'paySign': paySign,
          'success': function (res) {
            console.log('支付成功')
            self.getMessage(code);
            self.setData({
              flagOrder: false,
            })
          },
          'fail': function (res) {
            // wx.setStorageSync('isPay', 0);
            console.log(res)
            //支付失败或者未支付跳到购物车
            wx.showToast({
              title: '支付失败',
              icon: 'none'
            })
            // self.setData({
            //   isPay: 0
            // })
            // setTimeout(function () {
            //   wx.switchTab({
            //     url: '../shoppingCart/shoppingCart'
            //   }, 3000);
            // })
          },
          'complete': function (res) {
          }
        })
      } else {
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    }).catch((err) => {
      wx.showToast({
        title: '失败……',
        icon: 'none'
      })
    });
  },
  //选择商品
  chooseList:function(e){
    console.log(e.currentTarget.dataset)
    var indexs = e.currentTarget.dataset.indexs;
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id;
    var choosenum = e.currentTarget.dataset.choosenum;
    var arrdatas = this.data.arrdata;
    var shopList=this.data.shopList;
    var listData = this.data.listData;
    var lenth=0;
    for (let v of arrdatas[indexs].activePosterItemList) {
      if (v.select){
        lenth++
        
      }
    }
   
    
    // this.setData({
    //   arr[0]:
    // })
    
    if (lenth < choosenum || arrdatas[indexs].activePosterItemList[index].select){
      if (!arrdatas[indexs].activePosterItemList[index].select){
        lenth++
        if (lenth  == choosenum) {
          shopList[indexs] = true
        }
        var modeList = {
          "goodsPrice": arrdatas[indexs].activePosterItemList[index].goodsPrice,                  //商品价格
          "posterGoodsType": arrdatas[indexs].activePosterItemList[index].goodsType, //添加海报商品类型 1: 商品、2: 服务卡、3: 服务套餐、4: 服务套盒 5: 手动输入商品
          "stockId": arrdatas[indexs].activePosterItemList[index].stockId,                 //规格id
          "goodsName": arrdatas[indexs].activePosterItemList[index].goodsName, //商品名称
          "pictureUrl": arrdatas[indexs].activePosterItemList[index].pictureUrl, //商品展示图
          "stockName": arrdatas[indexs].activePosterItemList[index].stockName, //规格名称
          "goodsId": arrdatas[indexs].activePosterItemList[index].goodsId, //商品id
          "posterItemId": arrdatas[indexs].activePosterItemList[index].posterItemId
        }
        listData.push(modeList)
      }else{
        if (arrdatas[indexs].activePosterItemList.length==1){
          return
        }
        listData.splice(listData.findIndex(item => item.id === id), 1)
        shopList[indexs] = false
        
      }
      console.log(arrdatas[indexs].activePosterItemList[index].select)
      
      arrdatas[indexs].activePosterItemList[index].select = !arrdatas[indexs].activePosterItemList[index].select
      console.log(!arrdatas[indexs].activePosterItemList[index].select)
      
      this.setData({
        arrdata: arrdatas,
        listData: listData,
        shopList: shopList    
      })
      console.log(this.data.listData)
    }else{
      return
    }
    // if (arrdatas[indexs].arr[index].select){
    
    // }
  },
  //下单
  subBuy:function(){
    var subdata = {
        "amount": this.data.msgData.activePrice,                          //活动海报总金额
        "contactName": wx.getStorageSync('scSysUser').username, //顾客名称
        "payType": 3, //支付方式（货到付款0，在线支付1，支付宝支付2，微信支付3，积分兑换4）
        "customerId": wx.getStorageSync('scSysUser').id, //顾客id
        "shopOrderItemList": [],
        "contactMobile": wx.getStorageSync('scSysUser').phone, //顾客电话
        "realMoney": this.data.msgData.activePrice, //实际支付金额
        "payStatus": "0", //支付状态（未支付0，成功1，失败2, 已完成3）
        "bussinessId": wx.getStorageSync('shop').id, //店铺id
        "extend6": this.data.activeId, //活动海报id
        "referrerId": "",                //分享者id（选填）
        "areaId": "",         //区编码
        "provinceId": "", //省编码
        "cityId": "",
    }
    subdata.shopOrderItemList=this.data.listData;
    for (var i = 0; i < this.data.shopList.length;i++){
      if (!this.data.shopList[i]){
        wx.showToast({
          title: '请按规则选择商品！',
          icon: "none"
        })
        return
      }
    }
    app.util.reqAsync('shop/submitActivePosterOrder', subdata).then(res => {
      console.log(res)
      if (res.data.code==1){
        this.bindTestCreateOrder(res.data.data)
        this.setData({
          orderNo: res.data.data
        })
      }else{
        wx.showToast({
          title: res.data.msg,
          icon: 'none'
        })
      }
    })
    console.log(subdata)
  },
  getMessage: function (no) {
    //支付成功调接口
    app.util.reqAsync('shop/getRoomIdSendMessage', {
      orderNo: no, //订单编号
      shopId: this.data.shopId, //店铺id
      userCode: this.data.userCode//云信账号
    }).then((data) => {
      if (data.data.code == 1) {

      } else {
        console.log(data.data.msg);
      }

    })
  },
  look: function (e) {
    // wx.setStorageSync('isPay', 0);
    this.setData({
      flagOrder: true
    })
    if (this.data.isSend == 1) { //店内下单
      //跳到店内下单
      wx.redirectTo({
        url: '/packageMyHome/pages/shopOrder/shopOrder'
      })
    } else {
        wx.redirectTo({
          url: '/packageMyHome/pages/orderDetail/orderDetail?orderNo=' + this.data.orderNo + '&isGroupBuying=' + 0
        })
    }

  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../../../pages/index/index'
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

 
})