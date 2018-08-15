// pages/appointment/modal/device-modal.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    facilityTypes:Array
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
      let list = this.data.facilityTypes;
      for (let i = 0; i < list.length; i++) {
        for (let j = 0;j<list[i].facilityList.length;j++){
          list[i].facilityList[j].flag = i+'-'+j;
          list[i].facilityList[j].active=false;
        }
      }
      this.setData({
        facilityTypes:list
      })
    },
    chose:function(e){
      let index = e.currentTarget.dataset.flag,
          facilityTypes = this.data.facilityTypes,
          cur1=index.split('-')[0],
          cur2=index.split('-')[1];
      for (let i = 0; i < facilityTypes.length;i++){
        for (let j = 0; j < facilityTypes[i].facilityList.length; j++) {
          facilityTypes[i].facilityList[j].active=false;
        }
      }
      facilityTypes[cur1].facilityList[cur2].active=true;
      this.setData({
        facilityTypes: facilityTypes,
        id: facilityTypes[cur1].facilityList[cur2].id,
        name: facilityTypes[cur1].facilityList[cur2].name,
        active:true,
        flag:index
      })
    },
    submit:function(){
      var myEventDetail = {
        text:this.data.name,
        id:this.data.id,
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
