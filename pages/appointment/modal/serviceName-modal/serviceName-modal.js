// pages/appointment/modal/serviceName.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    serviceList:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    active: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad:function(){

    },
    chose: function (e) {
      var index = e.currentTarget.dataset.index;
      this.setData({
        cur: index,
        active: true
      })
    },
    submit: function () {
      var list = this.data.serviceList;
      var myEventDetail = {
        text: list[this.data.cur].name,
        id: list[this.data.cur].id,
        flag1: 'serviceNameText',
        flag2:'serviceId'
      }
      var myEventOption = {}
      this.triggerEvent('close', myEventDetail, myEventOption)
    },
    close: function () {
      var myEventDetail = {}
      var myEventOption = {}
      this.triggerEvent('close', myEventDetail, myEventOption)
    }
  }
})
