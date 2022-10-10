const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
"use strict";

Page({
  data: {
    number: 1,
    couponArr:[],
    user_id: '',
    openid: ''
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      openid: wx.getStorageSync('coyote_userinfo').openid || '',
    });

    var that = this
    that.getCouponList()

  },
  getCouponList(){
    var that = this
    var data = {
      openid:this.data.openid,
    }
    request.request_get('/activity/getCouponInfo.hn',data,function(res){
      console.log('getCouponInfo',res);
      if(res){
        if(res.success){
          console.log(res.msg);
          var arr = res.msg;
          let newTime = new Date().getTime();
         for(var i = 0; i< arr.length ;i++){
          var end_time = Date.parse(arr[i].end_time.replace(/-/g, '/'));
          if((end_time-newTime)>0){
            arr[i].overdueFlag = false
          }else{
            arr[i].overdueFlag = true
          }
         }

          that.setData({
            couponArr: arr
          })
        }else{
        // box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindAppointment:function(){
    wx.redirectTo({
      url: '/pages/onsiteAppointment/onsiteAppointment?choose_type=0',
    })
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
   onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    console.log('111')
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  },
  clickTab(e){
    let number = e.currentTarget.dataset.number;
    this.setData({
      number: number
    });
  }
})