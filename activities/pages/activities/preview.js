const app = getApp()
var request = require('../../../utils/requestForHD.js')
var box = require('../../../utils/box.js')
const canvas = require('../../../utils/canvas.js')
Page({
  data: {
    hb_url: '',
    zfy_url: '',
    num: '',
    text1: '平安就是福 这是虎年发出的第',
    text2: '个平安福',
    hidden: true,
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
  },
  changeHidden: function () {
    console.log('=============改状态了=====================');
    this.setData({
      hidden: !this.data.hidden
    });
  },
  onShareAppMessage() {
    //获取当前使用的模板
    let that = this;
    let text = that.data.value_text;
    if (text == '' || text == '不写文案') {
      text = '福福帖帖过大年';
    }
    const promise = new Promise(resolve => {
      resolve({
        title: text,
        path: '/activities/pages/activities/poster?id=' + that.data.pid,
        imageUrl: that.data.hb_url
      })
    })
    //埋点
    request.request_get('/activity/share.hn', {
      id: that.data.pid
    }, function (res) {
      console.info('分享好友回调', res);
    })
    return {
      promise
    }
  },
  onLoad(options) {
    var that = this;
    console.log("进入poster页面")
    var q = decodeURIComponent(options.id) //https://store.coyotebio-lab.com:8443/lis_appointment/channel_id=146
    let x = app.globalData.fx_data
    console.log('options');
    console.log(options);
    console.log('x');
    console.log(x);
    console.log('扫码进入页面携带的参数是');
    console.log('q:' + q);
    // app.globalData.myuserInfo = res.userInfo;
    // app.globalData.hasUserInfo = true;
    that.setData({
      bj_url: x.bj_url,
      ewm_url: x.ewm_url,
      wz_url: x.wz_url,
      xc_text: x.xc_text,
      value: x.value,
      preview_url: x.preview_url,
      value_text: x.value_text,
      pid: x.pid,
      hb_url: x.hb_url,
      userInfo:app.globalData.myuserInfo,
      hasUserInfo:app.globalData.hasUserInfo
    })
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

  },
  onShow() {
    console.log('onshow');

  },

  goNext: function () {
    wx.navigateTo({
      url: '/activities/pages/activities/index',
    })


  },
  scpaf: function () {
    let that = this

    that.changeHidden();
    that.getTest();

  },
  getTest() {
    let that = this;
    console.log('-----------------------------------22222222222222----------------')
    //获取手机宽高 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight,
          windowWidth: res.windowWidth,
          pixelRatio: res.pixelRatio,
          platform: res.platform
        })
      }
    });
    let windowHeight = that.data.windowHeight;
    let windowWidth = that.data.windowWidth;
    let pixelRatio = that.data.pixelRatio;
    let platform = that.data.platform;
    console.log('==================================');
    console.log(windowHeight);
    console.log(windowWidth);
    console.log(pixelRatio);
    console.log(platform);

    console.log('==================================');
    //在这段代码中，我们通过使用wx.getImageInfo这个API来下载一个网络图片到本地（并可获取该图片的尺寸等其他信息），然后调用ctx.drawImage方法将图片绘制到画布上，填满画布。
    //图片的src地址，请使用小程序内合法域名生成的图片地址。
    const wxGetImageInfo = canvas.promisify(wx.getImageInfo)
    //绘制二维码

console.log(that.data.bj_url);
console.log(that.data.ewm_url);
console.log(that.data.value);

    let imgdata = [
      //背景图
      wxGetImageInfo({
        src: that.data.bj_url
      }),
      //二维码
      // wxGetImageInfo({
      //   src: 'https://cloud.coyotebio-lab.com/a/qrcode.jpg'
      // }),
      // TODO
      wxGetImageInfo({
        src: that.data.ewm_url
      }),
      wxGetImageInfo({
        src: 'https://cloud.coyotebio-lab.com/a/tips.png'
      }),
      wxGetImageInfo({
        src: 'https://cloud.coyotebio-lab.com/a/Mask.png'
      })
    ];

    if (that.data.value != '') {
      imgdata.push(wxGetImageInfo({
        src: that.data.value
      }))
    }

    Promise.all(imgdata).then(res => {
      console.log('=============6666666666666666666=====================');
      console.log(res)
      if (res[0].errMsg == "getImageInfo:ok" && res[1].errMsg == "getImageInfo:ok") {
        const ctx = wx.createCanvasContext('shareCanvas')

        // 底图
        //ctx.drawImage(res[0].path, windowWidth*0.15,0, windowWidth*0.5, windowHeight*0.5)
        ctx.drawImage(res[0].path, 0, 0, 240, 364.8)

        //写入文字
        //ctx.rect(0,windowHeight*0.7,windowWidth*0.85,windowHeight*0.15);
        ctx.drawImage(res[3].path, 0, 364.8, 240, 68.5)
        //ctx.setFillStyle('red')
        ctx.fill()
        // 小程序码
        const qrImgSize = 56
        //ctx.setFillStyle('yellow')
        //ctx.arc( (windowWidth*0.2, windowHeight*0.7, 0, 2, false));

        //ctx.clip();
        //ctx.drawImage(res[1].path, 182.4, 370.8, qrImgSize, qrImgSize) //带参小程序码
        //that.drawCircular(ctx,182.4, 370.8, qrImgSize, qrImgSize,res[1].path);
        ctx.save();
        ctx.beginPath();
        ctx.arc(qrImgSize / 2 + 182.4, qrImgSize / 2 + 370.8, qrImgSize / 2, 0, Math.PI * 2, false);
        ctx.clip();
        ctx.drawImage(res[1].path, 182.4, 370.8, qrImgSize, qrImgSize);
        ctx.restore();
        ctx.setStrokeStyle('#fff');

        ctx.drawImage(res[2].path, 150, 367.36, 29.6, 64) //长按二维码给亲友送平安

        ctx.setFillStyle('#FFF9D7')
        console.log('=============画完了=====================');
        // TODO

        //ctx.fillText('虎年第68678个平安帖已送出', 3*0.8, 508*0.8)

        //************************************ */
        // if (platform == 'ios') {
        //   ctx.setFontSize(12) // 文字字号：22px
        //   ctx.fillText('平安就是福', 10, 395)
        //   ctx.setFontSize(9) // 文字字号：22px
        //   ctx.fillText(that.data.xc_text.content, 10, 406.4)
        //   ctx.setFontSize(6) // 文字字号：22px
        //   ctx.fillText('送平安贴 赢平安礼 卡尤迪陪您福福贴贴过大年！', 10, 415)
        // } else {
        //   ctx.setFontSize(12) // 文字字号：22px
        //   ctx.fillText('平安就是福', 40, 395)
        //   ctx.setFontSize(9) // 文字字号：22px
        //   ctx.fillText(that.data.xc_text.content, 67, 406.4)
        //   ctx.setFontSize(6) // 文字字号：22px
        //   ctx.fillText('送平安贴 赢平安礼 卡尤迪陪您福福贴贴过大年！', 75, 415)
        // }
        console.log('开始画图啦----------------------用户信息');
        console.log(that.data.userInfo);
        if(that.data.hasUserInfo==true){
          let nickname= that.data.userInfo.nickName
          let str = nickname.replace(/[\u4e00-\u9fa5]/g,"aa");
          console.log('str',str.length);
          if(str.length>=20){
            ctx.setFontSize(9) // 文字字号：22px
          }else{
            ctx.setFontSize(12) // 文字字号：22px
          }
          ctx.fillText(nickname, 10, 395)
          ctx.setFontSize(9) // 文字字号：22px
          ctx.fillText('为您送上第'+that.data.xc_text+'个平安帖', 10, 406.4)
        }else{
          ctx.setFontSize(12) // 文字字号：22px
          ctx.fillText('平安就是福', 10, 395)
          ctx.setFontSize(9) // 文字字号：22px
          ctx.fillText('虎年第'+that.data.xc_text+'个平安帖已送出', 10, 406.4)
        }
        ctx.setFontSize(6) // 文字字号：22px
        ctx.fillText('送平安贴 赢平安礼 卡尤迪陪您福福贴贴过大年！', 10, 415)
        //ctx.setTextAlign('center') // 文字居中

        // ctx.textAlign = 'center';
        // ctx.setFillStyle('#FFF9D7') // 文字颜色
        // //ctx.setFontSize(12) // 文字字号：22px
        // ctx.font = 'normal bold 13px sans-serif';
        // ctx.setShadow(0, 10, 30, '#33ffff')
        // const ty = fillTextLineBreak(ctx, that.data.value, 120, 60, 140, 18)

        if (that.data.value != '') {
          ctx.drawImage(res[4].path, 19.2, 50, 216, 37.8)
        }

        //ctx.fillText(that.data.value, 120, 60)

        ctx.stroke()
        ctx.draw()
        console.log('=============画完了=====================');
        // that.setData({
        //   canvasFlag: ''
        // })
        that.changeHidden();
        console.log('=============画完了=====================');
        setTimeout(function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 240,
            height: 433.3,
            destWidth: 240 * pixelRatio,
            destHeight: 433.3 * pixelRatio,
            canvasId: 'shareCanvas',
            success: function (res) {
              that.setData({
                imgUrl: res.tempFilePath,
              })
              console.log('=============保存图片成功=====================');
              that.setData({
                canvasFlag1: 'hidden'

              })
              that.saveImg();
              that.setData({
                canvasFlag: 'hidden'

              })
              
              //that.saveImageToAlbum();
              // wx.hideLoading()
            },
            fail: function (res) {
              console.log('=============保存图片失败=====================');
            }
          })
        }, 500)

      } else {
        // wx.showToast({
        //   title: '邀请卡绘制失败!',
        //   image: '../../asset/images/warning.png'
        // })
      }
    })
  },

  // downloadcanvas: function () {
  //   //下载图片
  //   var that = this;
  //   //将图片保存到相册       
  //   console.log('xxxxxxxxxx')
  //   wx.saveImageToPhotosAlbum({
  //     filePath: that.data.postUrl,
  //     success(res) {
  //       wx.showModal({
  //         title: '保存成功',
  //         content: '图片成功保存到相册了，快去分享朋友圈吧',
  //         showCancel: false,
  //         confirmText: '好的',
  //         confirmColor: '#818FFB',
  //         success: function (res) {
  //           if (res.confirm) {
  //             that.setData({
  //               showPosterImage: true
  //             })
  //           }
  //           that.hideShareImg()
  //         }
  //       })
  //     }
  //   })


  // },
  // 保存图片
  saveImg: function (e) {
    let that = this;
    console.log('1111111111111111')
    //获取相册授权
    wx.getSetting({
      success(res) {
        console.log('222222222222')
        if (!res.authSetting['scope.writePhotosAlbum']) {
          console.log('33333333333333')
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              //这里是用户同意授权后的回调
              console.log('4444444444444444444')
              that.saveImgToLocal();
            },
            fail() { //这里是用户拒绝授权后的回调
              console.log('5555555555555555')
              that.setData({
                openSettingBtnHidden: false
              })
            }
          })
        } else { //用户已经授权过了
          console.log('66666666666666666')
          that.saveImgToLocal();
        }
      }
    })

  },
  saveImgToLocal: function (e) {
    let that = this;
    console.log('我是本地保存的图片路径')
    let imgSrc = that.data.imgUrl;
    console.log(imgSrc)
    //图片保存到本地
    wx.saveImageToPhotosAlbum({
      filePath: imgSrc,
      success: function (data) {
        console.log('88888888888888888888')
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })

        that.setData({
          canvasFlag: 'hidden'

        })
      },
      fail: function (data) {

        console.log('456456456')
        console.log(data)
      },
      complete: function (data) {

        console.log('789789789')
        console.log(data)
      }
    })


    //下载图片，发出平安帖个数加1
    //TODO
    request.request_get('/activity/downpic.hn', {
      id: that.data.pid
    }, function (res) {
      console.info('下载图片回调', res)
    })

    console.log('asasda')
  },

  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
})