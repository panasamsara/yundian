// pages/appointment/modal/serviceName.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    list: [
      { name: '面部补水套餐1', class: 'normal' },
      { name: '面部补水套餐2', class: 'normal' },
      { name: '面部补水套餐3', class: 'normal' },
      { name: '面部补水套餐4', class: 'normal' },
      { name: '面部补水套餐5', class: 'normal' },
      { name: '面部补水套餐6', class: 'normal' },
      { name: '面部补水套餐7', class: 'normal' },
      { name: '面部补水套餐8', class: 'normal' },
      { name: '面部补水套餐9', class: 'normal' },
      { name: '面部补水套餐10', class: 'normal' },
      { name: '面部补水套餐11', class: 'normal' },
      { name: '面部补水套餐12', class: 'normal' },
      { name: '面部补水套餐13', class: 'normal' }
    ],
    active: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chose: function (e) {
      var activeIndex = "list[" + e.currentTarget.id + "].class"
      for (var i = 0; i < this.data.list.length; i++) {
        var index = "list[" + i + "].class";
        this.setData({
          [index]: 'normal'
        })
      }
      this.setData({
        [activeIndex]: 'active',
        active: true
      })
    },
    submit: function () {
      var list = this.data.list;
      for (var i = 0; i < list.length; i++) {
        if (list[i].class == 'active') {
          var myEventDetail = {
            text: list[i].name,
            flag: 'serviceName'
          }
          var myEventOption = {}
          this.triggerEvent('close', myEventDetail, myEventOption)
        }
      }
    },
    close: function () {
      var myEventDetail = {}
      var myEventOption = {}
      this.triggerEvent('close', myEventDetail, myEventOption)
    }
  }
})
