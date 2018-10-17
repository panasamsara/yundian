// packageIndex/pages/appointmentNew/appointmentNew.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: '12月30号 周日 12:30',
    servant:'请选择您的服务人员',
    device:'请选择您的服务设备',
    checkStore: false,
    checkIndex: -1,
    cardList:[{ type: '次数卡', name: '脸部护理卡' }, { type: '次数卡', name: '脸部护理卡' },{ type: '次数卡', name: '脸部护理卡' }],
    checkTimes: 0,
    closeTip: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData();
  },
  getData:function(){//获取数据
    let cardList=this.data.cardList;
    for(let i=0;i<cardList.length;i++){
      cardList[i].check=false;
      cardList[i].checkServant=true;
      cardList[i].checkDevice=true;
    }
    this.setData({
      cardList:cardList
    })
  },
  checkStore:function(){//到店安排
    let checkStore=this.data.checkStore;
    this.setData({
      checkStore:!checkStore
    })
    if(checkStore){
      this.setData({
        check: 'check'
      })
    }
  },
  check:function(e){//选择服务卡|选择服务人员|选择服务设备
    let checkTimes=this.data.checkTimes;
        checkTimes+=1;
        this.setData({
          checkTimes:checkTimes
        })
    let index = e.currentTarget.dataset.index,
        flag=e.currentTarget.dataset.flag,
        cardList=this.data.cardList,
        check="cardList["+index+"]."+flag,
        checkStatus;
        if(flag=='check'){
          checkStatus=cardList[index].check;
        }else if(flag=='checkServant'){
          checkStatus=cardList[index].checkServant;
        }else{
          checkStatus=cardList[index].checkDevice;
        }
    if(checkStatus){ 
      this.setData({
        [check]:false
      })
    }else{
      this.setData({
        [check]:true
      })
    }
  },
  closeTip:function(){
    this.setData({
      closeTip:true,
      checkTimes: this.data.checkTimes+1
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
})