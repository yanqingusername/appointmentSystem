const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const utilMd5 = require('../../../utils/md5.js');
"use strict";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    ordernum: "",
      
  },
  onLoad: function (options) {
    this.setData({
      ordernum: options.ordernum
    });
  },
  getYHQ:function(){
    //获取优惠券
    //通过openid
    let that = this;
    let data = {
      openid:app.globalData.openid
    }
    request.request_get('/activity/getCouponBest.hn', data, function (res) {
      if (!res) {
        return;
      }
      if (!res.success) {
        return;
      }
      // TODO
      that.setData({
        coupon_id:res.msg.coupon_id,
        coupon_payment:res.msg.coupon_payment,
        best_coupon:1
      })
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },
  onUnload() {
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