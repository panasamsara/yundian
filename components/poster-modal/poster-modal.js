// components/poster-modal/poster-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    posterData: String,
    btnData: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    shareShow:true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closeShare:function(){
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
    }
  }
})
