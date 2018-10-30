const app=getApp();

function getCode(obj,params){//获取二维码地址
  let _this=obj;
  var p = new Promise(function (resolve, reject){
    app.util.reqAsync('payBoot/wx/acode/build', params).then((res) => {
      if (res.data.code == 1) {
        wx.downloadFile({//缓存二维码
          url: res.data.data.url,
          success: function (res) {
            _this.setData({
              codeUrl: res.tempFilePath
            })
            resolve();
          }
        })
      }
    })
  })
  return p;
}

function saveImg(obj){//保存图片判断授权
  var that = obj;
  //获取相册授权
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success() {//这里是用户同意授权后的回调
            wx.showToast({
              title: '保存中...',
              icon: 'none'
            })
            save(that);
          },
          fail() {//这里是用户拒绝授权后的回调
            wx.showToast({
              title: '授权后才能保存至手机相册',
              icon: 'none'
            })
            that.setData({
              btnShow: 'authorize'
            })
            return
          }
        })
      } else {//用户已经授权
        wx.showToast({
          title: '保存中...',
          icon: 'none'
        })
        save(that);
      }
    }
  })
}

function temp(obj,id,width,height,destWidth,destHeight){//canvas绘制完成缓存为图片
  var _this=obj;
  wx.canvasToTempFilePath({
    x: 0,
    y: 0,
    width: width,
    height: height,
    destWidth: destWidth,
    destHeight: destHeight,
    fileType: 'jpg',
    canvasId: id,
    success: function (res) {
      _this.setData({
        canvasUrl: res.tempFilePath
      })
    }
  })
  wx.hideLoading();
}

function save(obj){//保存图片到相册
  let _this = obj;
  if (!_this.data.canvasUrl) {
    return;
  }
  wx.saveImageToPhotosAlbum({
    filePath: _this.data.canvasUrl,
    success(res) {
      wx.showToast({
        title: '保存成功',
        icon: 'none'
      })
    }
  })
}

function handleSetting(obj,e){//调起授权设置页
  let that = obj;
  // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
  if (!e.detail.authSetting['scope.writePhotosAlbum']) {
    wx.showModal({
      title: '提示',
      content: '若不打开授权，则无法将图片保存在相册中！',
      showCancel: false
    })
    that.setData({
      saveImgBtnHidden: true,
      openSettingBtnHidden: false
    })
  } else {
    wx.showToast({
      title: '已授权',
      icon: 'none'
    })
    that.setData({
      saveImgBtnHidden: false,
      openSettingBtnHidden: true,
      btnShow: 'normal'
    })
  }
}

function cut(text,length,_this){//截取文字
  if(text.length>length){
    text=text.substring(0,length)+'..';
  }
  return text
}

function drawShadow(context,scale,x,y,blur,color){//绘制阴影
  context.shadowOffsetX=x*scale;
  context.shadowOffsetY=y*scale;
  context.shadowColor=color;
  context.shadowBlur=blur*scale;
}

function roundRect(context,scale,x,y,w,h,radius){//绘制圆角矩形
  if(w<2*radius) {
    radius= w/2;
  }
  if(h<2*radius) {
    radius=h/2;
  }
  let r=radius*scale;
  context.beginPath();
  context.moveTo((x+r) * scale,y * scale);//a
  context.arcTo((x+w)*scale,y*scale,(x+w)*scale,(y+h)*scale,r);//b-c
  context.arcTo((x+w) * scale, (y+h) * scale,x*scale,(y+h)*scale,r);//c-d
  context.arcTo(x * scale, (y+h) * scale, x * scale, y * scale,r);//d-e
  context.arcTo(x * scale, y * scale,(x+r)*scale,y*scale,r);//e-a
  context.closePath();
  context.setStrokeStyle('#ffffff');
  context.stroke();
  context.fill();
}

module.exports={
  getCode: getCode,
  saveImg: saveImg,
  temp: temp,
  save: save,
  handleSetting: handleSetting,
  cut:cut,
  drawShadow:drawShadow,
  roundRect:roundRect
}