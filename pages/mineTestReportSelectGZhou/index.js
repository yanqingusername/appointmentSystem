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

    user_id: ''
  },
  onShow(){
    this.setData({
      sample_number: wx.getStorageSync('gzhou_snumber') || '',
      sample_phone: wx.getStorageSync('gzhou_sphone') || '',
    });
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
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
  bindSelectResult1(){
    let phone = this.data.sample_phone;
    if(this.data.sample_number == ''){
      box.showToast('请输入受检人证件号');
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

    wx.setStorageSync('gzhou_snumber', this.data.sample_number);
    wx.setStorageSync('gzhou_sphone', this.data.sample_phone);

    wx.navigateTo({
      url: `/pages/mineTestReportResult/index?isreport=3&snumber=${this.data.sample_number}&sphone=${this.data.sample_phone}`
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
})