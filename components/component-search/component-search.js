// components/component-search/component-search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    searchList:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    key:''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showSearch: function (e) {//显示搜索按钮
      this.setData({
        status: 'search',
        shadeShow: true,
        unscroll: true
      })
    },
    setKey: function (e) {//存入input输入value
      this.setData({
        key: e.detail.value.replace(/\s+/g, '')
      })
    },
    clear: function () {//清空输入框
      if(this.data.key!=''){
        this.setData({
          key: ''
        })
      }
    },
    closeShade: function () {//关闭遮罩
      this.setData({
        shadeShow: false
      })
    },
    search: function () {//搜索
      if (this.data.key == '') {
        wx.showToast({
          title: '请先输入搜索内容',
          icon: 'none'
        })
        return;
      }
      this.setData({
        shadeShow: false
      });
      wx.showLoading();
      let key=this.data.key,
          searchList=this.data.searchList,
          newList=[];
      for(let i=0;i<searchList.length;i++){
        if(searchList[i].name.indexOf(key)>-1){
          newList.push(searchList[i]);
        }
      }
      this.setData({
        newList:newList
      })
      this.triggerEvent('search',{newList:this.data.newList},{});
    },
  }
})
