// pages/appointment/modal/service-modal.js
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
      { name: '王月月1', class: 'normal' },
      { name: '王月月2', class: 'normal' },
      { name: '王月月3', class: 'normal' },
      { name: '王月月4', class: 'normal' },
      { name: '王月月5', class: 'normal' },
      { name: '王月月6', class: 'normal' },
      { name: '王月月7', class: 'normal' },
      { name: '王月月8', class: 'normal' },
      { name: '王月月9', class: 'normal' },
      { name: '王月月10', class: 'normal' },
      { name: '王月月11', class: 'normal' },
      { name: '王月月12', class: 'normal' },
      { name: '王月月13', class: 'normal' }
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
            flag: 'service'
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
