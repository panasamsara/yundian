import saveImg from '../../../utils/saveImg.js';

const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabActive: [1, 0, 0],
    comments: [],
    play: false,
    reply: { placeholder: '我来说一句~'},
    btnShow: 'normal'
  },
  // 获取课程详情
  getDetail: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    let params = {
      courseId: this.data.options.id,
      userId: wx.getStorageSync('scSysUser').id
    }
    app.util.reqAsync('masterCourse/getCourseInfo', params).then((res) => {
      if (res.data.code == 1) {
        this.setData({
          data: res.data.data
        });
        this.replyReset();
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
      wx.hideLoading();
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  },
  // 获取课程评论
  getComments: function (flag) {
    let arr_ = flag? []: this.data.comments;
    wx.showNavigationBarLoading();
    let params = {
      pageNo: parseInt(arr_.length / 10) + 1,
      pageSize: 10,
      courseId: this.data.options.id
    }
    app.util.reqAsync('masterCourse/pageCourseComment', params).then((res) => {
      if (res.data.code == 1) {
        res.data.data.comments.forEach((v, i) => {
          if (v.childs && v.childs.length > 2) v.fold = true
        });
        this.setData({
          comments: arr_.concat(res.data.data.comments),
          total: res.data.data.total
        });
      } else {
        wx.showToast({ title: res.data.msg || '请稍后再试！', icon: 'none' });
      }
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
    })
  },
  // 添加评论
  addComments: function () {
    let u = wx.getStorageSync('scSysUser');
    let params = this.data.reply;
    if (!params.content || params.content.length == 0) {
      return wx.showToast({title: '请输入内容！', icon: 'none'})
    }
    if (params.fid == params.uid) {
      return wx.showToast({ title: '不能回复你自己！', icon: 'none' })
    }
    wx.showLoading({ title: '提交中...' })
    app.util.reqAsync('masterCourse/addCommentV2', params).then((res) => {
      if(res.data.code == 1) {
        wx.hideLoading();
        let reply = this.data.reply;
        this.refreshComments(Object.assign({ createTime: app.util.formatTime(new Date())}, reply))
        // 重设回复
        reply.content = '';
        this.setData({
          reply: reply
        })
        this.replyReset({ content: ''});
        wx.showToast({ title: '评论成功！', icon: 'none' })
      } else {
        wx.showToast({ title: res.data.msg || '操作失败！', icon: 'none' })
      }
      wx.hideLoading()
    })
  },
  // 刷新列表
  refreshComments: function (c) {
    let comments = this.data.comments;
    // 根 - 子节点判断
    if(c.type == 1) {
      comments.push(c);
    } else {
      comments.forEach((v, i) => {
        if (v.id == c.rootId) {
          if (!v.childs) v.childs = [];
          v.childs.push(c)
        }
      });
    }
    this.setData({
      comments: comments
    })
  },
  // 点击评论时获取焦点并加上回复数据
  // 判断是否子评论
  replyFocus: function(e){
    let selected = e.currentTarget.dataset.selected;
    let isChild = Object.prototype.toString.call(selected) == '[object Array]';
    let reply = this.data.reply;

    let comment = {};
    if (isChild){
      let pComment = this.data.comments[selected[0]];
      reply.rootId = pComment.id;
      comment = this.data.comments[selected[0]].childs[selected[1]];
    } else {
      comment = this.data.comments[selected];
      reply.rootId = comment.id;
    }
    reply.focus = true;
    reply.placeholder = `回复 ${comment.fName}：`;
    reply.uid = comment.fid;
    reply.uName = comment.fName;
    reply.uPic = comment.fPic;
    reply.type = 2;
    // 更换回复对象则清空
    if (reply.lastUuid != comment.uuid) {
      reply.content = '';
    }
    reply.lastUuid = comment.uuid;
    this.setData({
      reply: reply
    })
  },
  // 初始化reply
  replyReset: function(obj){
    let reply = this.data.reply;
    reply.type = 1;
    reply.placeholder = '我来说一句~';
    reply.uid = this.data.options.id;
    reply.uName = this.data.data.name;
    reply.uPic = this.data.data.cover;
    reply.focus = false;
    if (obj) reply = Object.assign(reply, obj);
    this.setData({
      reply: reply
    })
  },
  // 回复内容改变
  relpyChange: function(e) {
    let reply = this.data.reply;
    reply.content = e.detail.value;
    reply.focus = true;
    this.setData({
      reply: reply
    })
  },
  // 初始化回复数据，页面高度，获取课程和评论
  onLoad: function (options) {
    // 回复的时候不变的参数
    let u = wx.getStorageSync('scSysUser');
    let reply = this.data.reply;
    reply.courseId = options.id;
    reply.fid = u.id;
    reply.fName = u.username;
    reply.fPic = u.userpic;
    this.setData({
      options: options,
      reply: reply
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({ height: res.windowHeight})
      }
    })
    this.getDetail();
    this.getComments();
  },
  // 点击播放视频，添加学习记录
  videoPlay: function () {
    this.setData({
      play: true
    })
    if (!this.videoContext) this.videoContext = wx.createVideoContext('myVideo');
    this.videoContext.play();
    // 添加学习记录
    let u = wx.getStorageSync('scSysUser');
    let params = {
      courseId: this.data.options.id,
      userId: u.id,
      type: 2,
      userName: u.username,
      phone: u.phone,
      shopId: wx.getStorageSync('shop').id
    }
    // 不做其他操作
    app.util.reqAsync('masterCourse/addOperation', params)

  },
  // 视频播完触发
  videoEnd: function () {
    this.setData({
      play: false
    })
  },
  fold: function (e) {
    let i = e.currentTarget.dataset.i;
    let comment = this.data.comments[i];
    comment.fold = false;
    this.setData({
      [`comments[${i}]`]: comment
    })
  },
  // 课程购买下单
  buy: function () {
    let u = wx.getStorageSync('scSysUser');
    wx.showNavigationBarLoading();
    // 提交购买操作，获取订单信息
    let params = {
      courseId: this.data.options.id,
      userId: u.id,
      type: 1,
      payType: 3,
      userName: u.username,
      phone: u.phone,
      deposit: this.data.data.price,
      shopId: wx.getStorageSync('shop').id
    }
    wx.showLoading({
      title: '请等待...',
      mask: true
    });
    app.util.reqAsync('masterCourse/addOperation', params).then((res) => {
      if (res.data.code == 1) {
        // 下单成功
        this.openWxPay(res.data.data)
      } else {
        wx.hideNavigationBarLoading();
        wx.showToast({ title: res.data.msg || '操作失败！', icon: 'none' })
      }
    })
  },
  // 调起微信支付
  openWxPay: function (orderNo){
    var data = {
      subject: this.data.data.name,
      orderType: 2,
      requestBody: {
        body: '云店课堂-购买课程订单',
        out_trade_no: orderNo,
        trade_type: 'JSAPI',
        openid: wx.getStorageSync('scSysUser').wxOpenId
      }
    };
    //发起网络请求 微信统一下单   
    app.util.reqAsync('payBoot/wx/pay/zxClass/unifiedOrder', data).then((res) => {
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
        let that = this;
        // 支付成功后刷新
        wx.requestPayment({
          timeStamp: timeStamp,
          nonceStr: nonceStr,
          package: packages,
          signType: 'MD5',
          paySign: paySign,
          success: (res) => {
            wx.showToast({ title: '支付成功！', icon: 'none', mask: true })
            let data = that.data.data;
            data.isEntry = true;
            that.setData({
              data: data
            })
          },
          fail: function (res) {
            wx.showToast({title: '支付失败！', icon: 'none'})
          }
        })
      } else {
        wx.showToast({ title: res.data.msg || '支付失败！', icon: 'none', mask: true })
      }
      wx.hideNavigationBarLoading();
      wx.hideLoading();
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getComments(true);
    this.getDetail();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.total > this.data.comments.length) this.getComments()
  },

  // 滚动监听
  onPageScroll: function (obj) {
    // 已滚动留着备用
    let scrollTop = obj.scrollTop;
    const query = wx.createSelectorQuery();
    let height = this.data.height || 0;
    // 滚动监听部分元素，以固定tab栏目，确定tab栏目active内容
    query.selectAll('#lesson-content, #teacher, #student').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((res) => {
      let fixed = res[0][0].bottom < 0;
      let activeTab = [1, 0, 0];
      if (res[0][1].top < height - 100) activeTab = [0, 1, 0];
      if (res[0][2].top < height - 100) activeTab = [0, 0, 1];
      this.setData({
        fixed: res[0][0].bottom < 1,
        tabActive: activeTab,
        scrollTop: scrollTop
      })
    })
  },
  // 点击滚动
  scrollTo: function(e){
    let scrollTop = this.data.scrollTop || 0;
    let height = this.data.height || 0;
    let id = e.currentTarget.dataset.id;
    const query = wx.createSelectorQuery();

    query.select('#'+ id).boundingClientRect((rect) => {
      let scroll = id == 'lesson-content' ? (rect.top + scrollTop + rect.height) : (rect.top + scrollTop - 45);
      wx.pageScrollTo({
        scrollTop: scroll
      })
    }).exec();
  },
  onShow:function(){
    let _this=this;
    saveImg.getCode(_this, {//获取商品二维码
      source: 0,
      page: "pages/QrToActivity/QrToActivity",
      params: {
        shopId: wx.getStorageSync('shop').id,
        userId: wx.getStorageSync('scSysUser').id,
        merchantId: wx.getStorageSync('shop').merchantId,
        courseId: this.data.options.id,
        sourcePart: '1',
        shareType: 8
      }
    })
  },
  goback: function () {//回到首页按钮
    wx.switchTab({
      url: '../index/index?shopId=' + this.data.shopId
    })
  },
  shareBtn: function () {//点击分享
    if (this.data.codeStatus!='done'||this.data.codeStatus==undefined){
      wx.showToast({
        title: '页面加载中，请稍后分享',
        icon: 'none'
      })
      return;
    }
    this.setData({
      posterShow: true
    })
  },
  closeShare: function () {//取消分享
    this.setData({
      posterShow: false
    })
  },
  drawPoster:function(){//绘制海报
    var _this=this;
    if(_this.data.canvasUrl){
      return;
    }
    wx.showLoading();
    wx.downloadFile({
      url: this.data.data.cover,
      success:function(res){
        let shopName = wx.getStorageSync('shop').shopName,
            context = wx.createCanvasContext('shareCanvas'),
            cover=res.tempFilePath,
            scale=wx.getSystemInfoSync().windowWidth/375*2;
        if (shopName.length > 7) {
          shopName = shopName.substring(0, 6) + '..';
        };
        context.setFillStyle('#ffffff');
        context.fillRect(0,0,690*scale,1000*scale);//设置白色背景
        context.drawImage(cover,20*scale,18*scale,305*scale,305*scale);//绘制视频封面
        context.drawImage('../../../images/video.png',142.5*scale,130*scale,60*scale,60*scale);//绘制播放按钮
        context.drawImage('../../../images/bg7.png',0,200*scale,345*scale,300*scale);//绘制背景图
        context.setFontSize(15*scale);
        let w=context.measureText(shopName).width+20;
        context.beginPath();
        context.setStrokeStyle('#ffffff');
        context.moveTo(50*scale,290*scale);
        context.lineTo(295*scale,290*scale);
        context.stroke();
        context.setFillStyle('#fb452d');
        context.fillRect(((345-w/2)/2)*scale,282.5*scale,w,15*scale);//绘制店铺名背景
        context.setFillStyle('#ffffff');
        context.fillText(shopName,((355-w/2)/2)*scale,294*scale);//绘制店铺名
        context.drawImage(_this.data.codeUrl,50*scale,413*scale,75*scale,75*scale);
        context.draw(false,function(){
          saveImg.temp(_this, 'shareCanvas', 1380, 2000, 1380, 2000);
        })
      }
    })
  },
  saveImg:function(){//保存图片
    let _this=this;
    saveImg.saveImg(_this);
  },
  handleSetting:function (e){//授权
    let that=this;
    saveImg.handleSetting(that, e.detail.e);
  }
})