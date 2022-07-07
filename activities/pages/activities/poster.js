const app = getApp()
var request = require('../../../utils/requestForHD.js')
var box = require('../../../utils/box.js')

Page({
  data: {
    hb_url: '',
    zfy_url: '',
    num: '',
    text1:'平安就是福 这是虎年发出的第',
    text2:'个平安福'
  },
  onLoad(options) {
    var that = this;
    console.log("进入poster页面")
    var q = decodeURIComponent(options.id) //https://store.coyotebio-lab.com:8443/lis_appointment/channel_id=146

    console.log('options');
    console.log(options);
    console.log('扫码进入页面携带的参数是');
    console.log('q:' + q);
    that.setData({
      pid: q
    })

    that.loginApp();

  },
  onShow() {
    console.log('onshow');

  },
  loginApp: function () {
    wx.login({
      success: (res) => {
        var code = res.code;
        console.log("获取code成功" + code);
        var that = this;
        request.request_get('/activity/getConnectInfo.hn', {
          code: code,
          pid: that.data.pid
        }, function (res) {
          console.info('回调', res);
          //判断为空时的逻辑
          if (!res) {
            box.showToast("网络不稳定，请重新进入小程序");
            return;
          }
          let msg = res.msg
          if (!res.success) {
            box.showToast(msg);
            return;
          }

          that.setData({
            hb_url: msg.hb_url,
            zfy_url: msg.zfy_url,
            num: msg.num
          })
          app.globalData.openid = msg.openid;
        })
      },
      fail: (res) => {
        box.showToast("网络异常，请检查网络是否连接")
      }
    })























  },

  goNext: function () {
    wx.navigateTo({
      url: '/activities/pages/activities/index',
    })

  
  },

})