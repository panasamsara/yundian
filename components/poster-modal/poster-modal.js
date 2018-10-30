// components/poster-modal/poster-modal.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    posterData: String,
    btnData: String,
    couponType: String,
    couponLogId: String,
    couponId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    shareShow:true,
    couponType:String
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeShare:function(){
      wx.hideLoading();
      this.trigger('closeShare');
    },
    drawPoster:function(){
      this.setData({
        posterShow:true,
        shareShow:false
      })
      this.trigger('drawPoster')//绘制海报
    },
    saveImg:function(){
      this.trigger('saveImg');//保存图片
    },
    handleSetting:function(e){
      this.trigger('handleSetting',e);//授权
    },
    trigger:function(event,e){
      var myEventDetail = {e:e};
      var myEventOption = {};
      this.triggerEvent(event, myEventDetail, myEventOption);
    },
    // 新增06字段的海报分享需要分享需要传给后台formid,调用优惠券详情的父组件方法
    submitInfo: function (e) {
      if (this.data.couponType == "06") {
        var openid = wx.getStorageSync("scSysUser").wxOpenId;
        let formId = e.detail.formId;
        console.log("formId:", formId);
        let params = {
          openid: openid,
          couponId: this.data.couponId,
          formId: formId
        }
        app.util.reqAsync("payBoot/wx/templateMessage/coupon", params).then((res) => {
          console.log(res);
        })
      }
    }
  },
})
