const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
"use strict";

Page({
  data: {
    submitState: false,
    sample_number: '',
    sample_phone: '',

    user_id: '',
    isReport: false
  },
  onShow(){
    if(this.data.isReport){
      this.setData({
        sample_number: wx.getStorageSync('gzhou_snumber') || '',
        sample_phone: wx.getStorageSync('gzhou_sphone') || '',
      });
      this.setisSubmit();
    }
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      sample_number: wx.getStorageSync('gzhou_snumber') || '',
      sample_phone: wx.getStorageSync('gzhou_sphone') || '',
    });
    this.setisSubmit();
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
  bindSelectResult1: utils.newthrottle(function (e) {
    let phone = this.data.sample_phone;
    
    if(this.data.sample_phone == ''){
      box.showToast('请输入受检人手机号');
      return;
    }
    if (!utils.checkPhone(phone)) {
      box.showToast("手机号码格式不正确");
      return;
    }

    if(this.data.sample_number == ''){
      box.showToast('请输入受检人证件号');
      return;
    }

    this.getCheckValidByPhoneAndIdCard();
  },2000),
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
  getCheckValidByPhoneAndIdCard: function () {
    var that = this;
    var data = {
      idCard:  that.data.sample_number, //证件号
      phone: that.data.sample_phone, //手机号
    }
    request.request_get('/Newacid/checkValidByPhoneAndIdCard.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          wx.setStorageSync('gzhou_snumber', that.data.sample_number);
          wx.setStorageSync('gzhou_sphone', that.data.sample_phone);

          wx.navigateTo({
            url: `/pages/mineTestReportResult/index?isreport=3&snumber=${that.data.sample_number}&sphone=${that.data.sample_phone}`
          });
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
})