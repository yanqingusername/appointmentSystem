const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
"use strict";

Page({
  data: {
    phoneCode: ["", ""], //正确的 手机号 和 验证码
    codeBtText: '获取验证码',
    codeBtState: false,
    currentTime: 60,
    submitState: false,
    user_phone: '',
    user_code: '',
    user_id: '',
    user_info:{}
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      user_info: wx.getStorageSync('coyote_userinfo') || '',
    });
  },
  getCode: function () {
    var that = this;
    var phone = that.data.user_phone;
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
        request.request_get('/Newacid/Verification.hn', {
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
  input1(e){
    this.setData({
      user_phone: e.detail.value
    });
    this.setisSubmit();
  },
  input2(e){
    this.setData({
      user_code: e.detail.value
    });
    this.setisSubmit();
  },
  bindSubmit(){
    var phoneCode = this.data.phoneCode;
    let phone = this.data.user_phone;
    let code = this.data.user_code;
    
    if (phone == '') {
      box.showToast("请输入受检人手机号");
      return
    } else if (!utils.checkPhone(phone)) {
      box.showToast("手机号码格式不正确")
      return
    } else if (code == '') {
      box.showToast("请输入短信验证码");
      return
    } else if (phoneCode[0] == "") {
      //进入这里说明未点击获取验证码
      box.showToast("请获取验证码")
      return
    } else if (phoneCode[0] != phone) {
      box.showToast("手机号和验证码不匹配")
      return
    } else if (phoneCode[1] != code) {
      box.showToast("验证码错误")
      return
    }

    let that = this;
    let data = {
      phone: phone,
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/updateiphone.hn', data, function (res) {
      if (res) {
        if (res.success) {
          box.showToast(res.msg,'',1000);
          let user_info = that.data.user_info;
          user_info.phone_number = phone;
          wx.setStorageSync('coyote_userinfo',user_info);
          setTimeout(()=>{
            wx.navigateBack({
              delta: 1
            });
          },1200);
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
   
  },
  setisSubmit(){
    if(this.data.user_phone != '' && this.data.user_code != ''){
      this.setData({
        submitState: true
      });
    } else {
      this.setData({
        submitState: false
      });
    }
  },
});