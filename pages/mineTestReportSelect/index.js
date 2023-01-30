const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
"use strict";

Page({
  data: {
    selectTab: 1, //1-样本编号查询 2-受检人手机验证
    phoneCode: ["", ""], //正确的 手机号 和 验证码
    codeBtText: '获取验证码',
    codeBtState: false,
    currentTime: 60,
    submitState: false,
    submitState2: false,

    sample_number: '',
    sample_phone: '',
    phone_code: '',

    user_id: ''
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });
  },
  changeOnlineFlag(e){
    let selectTab = e.currentTarget.dataset.onlineid;
    this.setData({
      selectTab: selectTab
    });
  },
  input1(e){
    this.setData({
      sample_number: e.detail.value
    });
    this.setisSubmit();
  },
  input2(e){
    let str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      sample_phone: e.detail.value
    });
    
    this.setisSubmit();
  },
  input4(e){
    let str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      sample_phone: e.detail.value
    });
    
    this.setisSubmit2();
  },
  input3(e){
    this.setData({
      phone_code: e.detail.value
    });
    this.setisSubmit2();
  },
  getCode: function () {
    var that = this;
    var phone = that.data.sample_phone;
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
            codeBtText: currentTime + '秒重新发送'
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
  bindSelectResult1(){
    let phone = this.data.sample_phone;
    if(this.data.sample_number == ''){
      box.showToast('请输入样本编号');
      return;
    }
    if(this.data.sample_phone == ''){
      box.showToast('请输入受检人手机号');
      return;
    }
    if (!utils.checkPhone(phone)) {
      box.showToast("手机号码格式不正确");
      return;
    }

    wx.navigateTo({
      url: `/pages/mineTestReportResult/index?isreport=1&snumber=${this.data.sample_number}&sphone=${this.data.sample_phone}`
    });
  },
  setisSubmit(){
    if(this.data.sample_number != '' && this.data.sample_phone != ''){
      this.setData({
        submitState: true
      });
    } else {
      this.setData({
        submitState: false
      });
    }
  },
  bindSelectResult2(){
    var phoneCode = this.data.phoneCode;
    let phone = this.data.sample_phone;
    let code = this.data.phone_code
    
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

    let data = {
      phone: phone,
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/overwriteiphone.hn', data, function (res) {});

    wx.navigateTo({
      url: `/pages/mineTestReportResult/index?isreport=2&pcode=${this.data.phone_code}&sphone=${this.data.sample_phone}`
    });
  },
  setisSubmit2(){
    if(this.data.sample_phone != '' && this.data.phone_code != ''){
      this.setData({
        submitState2: true
      });
    } else {
      this.setData({
        submitState2: false
      });
    }
  },
  /**
   * 广州报告查询
   */
   bindGZHouReport: function () {
    wx.navigateTo({
      url: "/pages/mineTestReportSelectGZhou/index"
    })
  },
})