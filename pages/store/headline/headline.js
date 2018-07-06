// pages/store/headline/headline.js
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
      {
        title: '夏天出油严重,怎么选择合适的洗发水',
        text: '夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水',
        url: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=2018626',
        userName: '乐小丽',
        readNum: '1500',
        replyNum: '150'
      },
      {
        title: '夏天出油严重,怎么选择合适的洗发水',
        text: '夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水',
        url: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=2018626',
        userName: '乐小丽',
        readNum: '1500',
        replyNum: '150'
      },
      {
        title: '夏天出油严重,怎么选择合适的洗发水',
        text: '夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水',
        url: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=2018626',
        userName: '乐小丽',
        readNum: '1500',
        replyNum: '150'
      },
      {
        title: '夏天出油严重,怎么选择合适的洗发水',
        text: '夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水,夏天出油严重,怎么选择合适的洗发水',
        url: 'https://developers.weixin.qq.com/miniprogram/dev/image/cat/0.jpg?t=2018626',
        userName: '乐小丽',
        readNum: '1500',
        replyNum: '150'
      }
    ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLoad: function (options) {
      var list = this.data.list;
      for (var i = 0; i < list.length; i++) {
        list[i].text = list[i].text.substring(0, 60) + '...'
      }
      this.setData({
        list: list
      })
      wx.hideLoading();
    }
  }
})
