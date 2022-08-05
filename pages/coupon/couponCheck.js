const box = require("../../utils/box")
const app = getApp()
const utils = require('../../utils/utils.js')
const request = require('../../utils/request.js')
// pages/coupon/couponCheck.js
Page({

  /**
   * Page initial data
   */
  data: {
    isIphoneX:false,
    couponArr:[],
    coupon_payment:'不使用',
    old_coupon_id:'',
    user_id: '',
    openid: ''
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      openid: wx.getStorageSync('coyote_userinfo').openid || '',
    });

    console.log('options');
    console.log(options);
    var that = this
    that.getCouponList()
    that.setData({
      "isIphoneX": this.isIphoneX(),
      coupon_id:options.coupon_id,
      old_coupon_id:options.coupon_id,
      coupon_payment:options.coupon_payment
    
    })
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
          for(var i = 0; i< arr.length ;i++){
            if(arr[i].award_status == '1'){ //已使用
              arr.splice(i,1);
              console.log('用过了',i)
              i--;
            }
           }
           let newTime = new Date().getTime();
           for(var i = 0; i< arr.length ;i++){
            var end_time = Date.parse(arr[i].end_time.replace(/-/g, '/'));
              if((end_time-newTime)<=0){ //已过期
                arr.splice(i,1);
                console.log('过期了',i)
                i--;
              }
          }
          that.setData({
            couponArr: arr
          })
        }else{
        box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindBackIndex:function(e){ //不使用
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 2];
    // var sampling_place = e.currentTarget.dataset.sp;             
    prevPage.setData({  
      coupon_payment: '不使用',
      coupon_id:''
    })
    wx.navigateBack({
      delta: 1, 
    })
  },
  bindBack:function(e){ //确认  
    var that = this;
  
      let pages = getCurrentPages(); 
      let prevPage = pages[pages.length - 2];
      console.log(that.data.coupon_payment)
      // var sampling_place = e.currentTarget.dataset.sp;
      let x = that.data.coupon_payment;
      let y = that.data.coupon_id;
    console.log(x);
    console.log(y);

      prevPage.setData({  
        coupon_payment: that.data.coupon_payment,
        coupon_id:that.data.coupon_id
      })
      wx.navigateBack({
        delta: 1, 
      })
   
    
  },
  
  changeCoupon:function(e){
    console.log(e)
    //TODO
    var coupon_payment = e.detail.value.substring(0,e.detail.value.indexOf('+'));
    var coupon_id = e.detail.value.substring(e.detail.value.indexOf('+')+1,e.detail.value.length);
    console.log(coupon_payment)
    console.log(coupon_id)
    this.setData({
      coupon_payment:coupon_payment,
      coupon_id:coupon_id
      // use_type:e.currentTarget.dataset.type
    })
    
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  isIphoneX() {
    let info = wx.getSystemInfoSync();
    if (/iPhone X/i.test(info.model)) {
      return true;
    } else {
      return false;
    }
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

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {

  }
})