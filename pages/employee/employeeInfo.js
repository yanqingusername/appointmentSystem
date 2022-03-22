// pages/createOrder/createOrder.js
const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/requestForHD.js')
"use strict";

Page({

  data: {
    reportPerson: '',
    name: '',
    phone: '',
    email: ''
  },
  onLoad: function () {
    var that = this;
    that.loginApp();
  },
  bindReportPerson: function (e) {
    var that = this;
    let str = e.detail.value;
    that.setData({
      reportPerson: str
    })
  },
  bindName: function (e) {
    var that = this;
    let str = e.detail.value;
    that.setData({
      name: str
    })
  },
  bindPhone: function (e) {
    var that = this;
    let str = e.detail.value;
    that.setData({
      phone: str
    })
  },
  bindEmail: function (e) {
    var that = this;
    let str = e.detail.value;
    that.setData({
      email: str
    })
  },
  // 获取微信code登录小程序
  loginApp: function () {
    let that = this;
    wx.login({
      success: (res) => {
        var code = res.code;
        console.log("获取code成功" + code);
        request.request_get('/staff/getopenid.hn', {
          code: code
        }, function (res) {
          console.info('回调', res);
          //判断为空时的逻辑
          if (res) {
            if (res.success) {
              app.globalData.openid = res.msg;
              console.log("获取的用户openid" + app.globalData.openid);
              //回显信息
              that.getData();
            } else {
              box.showToast(res.msg);
            }
          } else {
            box.showToast("网络不稳定，请重试");
          }
        })
      },
      fail: (res) => {
        box.showToast("请求超时，请检查网络是否连接")
      }
    })
  },

  getData: function () {
    let that = this;
    let data = {
      openid: app.globalData.openid
    }
    request.request_get('/staff/getpersoninfo.hn', data, function (res) {
      console.log('getData', res);
      if (!res) {
        return;
      }
      if (!res.success) {
        return;
      }
      let msg = res.msg;
      that.setData({
        reportPerson: msg.reportPerson,
        name: msg.name,
        phone: msg.phone,
        email: msg.email
      })
    })
  },
  submitData: function () {
    let that = this;
    let data = {
      reportPerson: that.data.reportPerson,
      name: that.data.name,
      phone: that.data.phone,
      email: that.data.email,
      openid: app.globalData.openid
    }
    console.log(data)
    request.request_get('/staff/Submitpersoninfo.hn', data, function (res) {
      console.log('getData', res);
      if (!res) {
        box.showToast('网络异常，请稍后再试');
        return;
      }
      box.showToast(res.msg);
    })

  }
})