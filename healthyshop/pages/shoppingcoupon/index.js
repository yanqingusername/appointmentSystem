const app = getApp()
const box = require('../../../utils/box.js')
const request = require('../../../utils/request.js')
"use strict";

Page({
  data: {
    number: 1,
    couponArr:[],
    user_id: '',
    openid: '',

    mineCouponList: []
  },
  onLoad: function (options) {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
      openid: wx.getStorageSync('coyote_userinfo').openid || '',
    });

    this.getCouponList();
    this.getMineCouponList();
  },
  getCouponList(){
    var that = this;
    var data = {
      openid:this.data.openid,
    }
    request.request_get('/activity/getCouponInfo.hn',data,function(res){
      if(res){
        if(res.success){
          var arr = res.msg;
          let newTime = new Date().getTime();
         for(var i = 0; i< arr.length ;i++){
          var end_time = Date.parse(arr[i].end_time.replace(/-/g, '/'));
          if((end_time-newTime)>0){
            arr[i].overdueFlag = false;
          }else{
            arr[i].overdueFlag = true;
          }
         }

          that.setData({
            couponArr: arr
          });
        }else{
        // box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  bindAppointment:function(){
    wx.redirectTo({
      url: '/pages/onsiteAppointment/onsiteAppointment?choose_type=0',
    });
  },
  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },
  clickTab(e){
    let number = e.currentTarget.dataset.number;
    this.setData({
      number: number
    });
    if(number == 1){
      this.getMineCouponList();
    }else{
      this.getCouponList();
    }
  },
  /**
   * 获取我的优惠卷
   */
  getMineCouponList(){
    var that = this;
    var data = {
      user_id: this.data.user_id
    }
    request.request_get('/Newacid/getMineCouponList.hn',data,function(res){
      if(res){
        if(res.success){
          that.setData({
            mineCouponList: res.msg
          });
        }else{
          box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  /**
   * 立即使用
   */
  handlerClickCoupon(e){
    let h5href = e.currentTarget.dataset.h5href;
    let wxhref = e.currentTarget.dataset.wxhref;

    if(wxhref){
      wx.navigateTo({
        url: wxhref
      })
    }else if(h5href){
      app.globalData.article = h5href;
      wx.navigateTo({
        url: '/pages/index/article?url='+h5href
      });
    }
  }
})