var app = getApp();
Page({
  data: {
    orderList: [],
    activeIndex:""
  },
  onLoad: function (options) {
    var arr=[];
    arr.push(JSON.parse( options.arr));
    this.setData({ orderList: arr})
    console.log(options.activeIndex)
  }
})