// pages/appointment/modal/device-modal.js
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
      { name: '单人房1', class: 'normal'},
      { name: '单人房2', class: 'normal'},
      { name: '单人房3', class: 'normal'},
      { name: '单人房4', class: 'normal'},
      { name: '单人房5', class: 'normal'},
      { name: '单人房6', class: 'normal'},
      { name: '单人房7', class: 'normal'},
      { name: '单人房8', class: 'normal'},
      { name: '单人房9', class: 'normal'},
      { name: '单人房10', class: 'normal'},
      { name: '单人房11', class: 'normal'},
      { name: '单人房12', class: 'normal'},
      { name: '单人房13', class: 'normal'}
    ],
    active:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    chose:function(e){
      var activeIndex = "list[" + e.currentTarget.id+"].class"
      for(var i=0;i<this.data.list.length;i++){
        var index = "list["+i+"].class";
        this.setData({
          [index]:'normal'
        })
      }
      this.setData({
        [activeIndex]:'active',
        active:true
      })
    },
    submit:function(){
      var list=this.data.list;
      for (var i = 0; i < list.length; i++) {
        if(list[i].class=='active'){
          var myEventDetail = {
            text:list[i].name,
            flag:'device'
          }
          var myEventOption = {}
          this.triggerEvent('close', myEventDetail, myEventOption)
        }
      }
    },
    close:function(){
      var myEventDetail = {} 
      var myEventOption = {} 
      this.triggerEvent('close', myEventDetail, myEventOption)
    }
  }
})
