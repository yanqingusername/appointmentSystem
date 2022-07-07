const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    phoneCode: ["", ""], //正确的 手机号 和 验证码
    codeBtText: '获取验证码',
    codeBtState: false,
    currentTime: 60,
    submitState: true,
  },
  onLoad: function (options) {

  },
  getCode: function () {
    var that = this;
    var phone = that.data.phone;
    var currentTime = that.data.currentTime;
    console.log("需要获取验证码的手机号" + phone);
    if (that.data.codeBtState) {
      console.log("还未到达时间");
    } else {
      if (phone == '') {
        box.showToast("请输入手机号码")
      } else if (!utils.checkPhone(phone)) {
        box.showToast("手机号码格式不正确")
      } else {
        box.showToast("验证码已发送")
        //倒计时,不管验证码发送成功与否，都进入倒计时，防止多次点击造成验证码发送失败**************************
        that.setData({
          codeBtState: true
        })
        var interval = setInterval(function () {
          currentTime--;
          that.setData({
            codeBtText: currentTime + 's'
          })
          if (currentTime <= 0) {
            clearInterval(interval)
            that.setData({
              codeBtText: '重新发送',
              currentTime: 60,
              codeBtState: false,
            })
          }
        }, 1000);

        // 服务器发送验证码***********************
        request.request_get('/a/Verification.hn', {
          phone: phone
        }, function (res) {
          console.info('回调', res)
          if (res) {
            if (res.success) {
              console.log('验证码发送成功，获取的验证码' + res.msg);
              that.setData({
                phoneCode: [phone, res.msg]
              });
            } else {
              box.showToast("验证码发送失败");
            }
          }else{
            box.showToast('网络异常，请稍后再试');
          }
        })
      }
    }
  },
  bindSubmit(){
   
  }
})