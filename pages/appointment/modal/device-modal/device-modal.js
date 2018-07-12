// pages/appointment/modal/device-modal.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    facilityList:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    active:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad:function(){

    },
    chose:function(e){
      var index = e.currentTarget.dataset.index;
      this.setData({
        cur:index,
        active:true
      })
    },
    submit:function(){
      var list = this.data.facilityList;
      var myEventDetail = {
        text:list[this.data.cur].name,
        id:list[this.data.cur].id,
        flag1:'deviceText',
        flag2: 'facilityId'
      }
      var myEventOption = {}
      this.triggerEvent('close', myEventDetail, myEventOption)
    },
    close:function(){
      var myEventDetail = {} 
      var myEventOption = {} 
      this.triggerEvent('close', myEventDetail, myEventOption)
    }
  }
})
