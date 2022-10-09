const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
"use strict";

Page({
  data: {
    
  },
  onLoad: function (options) {
    

  },
  phoneCall: function () {
    wx.makePhoneCall({
      phoneNumber: '4008693888',
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
})