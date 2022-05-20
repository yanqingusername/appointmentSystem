// index.js
// 获取应用实例
const app = getApp()
const box = require('../../utils/box.js')
const updateApp = require('../../utils/updateApp.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    fix_channel_id:-1,
    swiperCurrent:0,
    movies:[],
    links:[],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  onShow:function(){
    var that = this;
        console.log("进入index index页面")
        // 自动检查小程序版本并更新
        updateApp.updateApp("卡尤迪新冠检测预约小程序");
        // 获取设备信息
        wx.getSystemInfo({
            success: res => {
                app.globalData.systeminfo = res
            }
        })
        wx.showShareMenu({
          withShareTicket:true,
          menus:['shareAppMessage','shareTimeline']
        })
        // 获取微信小程序配置
        // 登录小程序
         that.loginApp();
  },
   // 获取微信code登录小程序
   loginApp: function () {
    wx.login({
        success: (res) => {
            var code = res.code;
            console.log("获取code成功" + code);
            request.request_get('/a/getOpenid.hn', {
                code: code
            }, function (res) {
                console.info('回调', res);
                //判断为空时的逻辑
                if (res) {
                    if (res.success) {
                        app.globalData.openid = res.msg;
                        console.log("获取的用户openid" + app.globalData.openid);
                    } else {
                        box.showToast(res.msg);
                    }
                }else{
                    box.showToast("网络不稳定，请重试");
                  }
            })
        },
        fail: (res) => {
            box.showToast("请求超时，请检查网络是否连接")
        }
    })
},
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad(query) {
    var that =this
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    that.getBannerList()
    // box.showToast('sakjssd')
    // box.showToast(decodeURIComponent(query))
    // box.showToast(decodeURIComponent(query.q))
    var q = decodeURIComponent(query.q) //https://store.coyotebio-lab.com:8443/lis_appointment/channel_id=146

    // var q = 'https://store.coyotebio-lab.com:8443/lis_appointment/channel_id=146'
    // console.log(q.substr((q.indexOf('=')+1)));
    
    if(q.indexOf('channel_id') != -1){  //查到
      // app.globalData.fixChannel = true,
      // app.globalData.channel_id = q.substr((q.indexOf('=')+1));
      var fix_channel_id = q.substr((q.indexOf('=')+1));
      that.setData({
        fix_channel_id:fix_channel_id
      })
      console.log("sdko")
    }
    

  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  bindOnsite:function(options){
    var that = this;
    console.log(options.currentTarget.dataset.type)
    wx.navigateTo({
      url: '/pages/onsiteAppointment/onsiteAppointment?choose_type='+options.currentTarget.dataset.type+'&fix_channel_id='+that.data.fix_channel_id,
    })
  },
  bindAppointment:function(){
    wx.navigateTo({
      url: '/pages/appointmentRecord/appointmentRecord'
    })
  },
  bindCoupon:function(){
    wx.navigateTo({
      url: '/pages/coupon/coupon',
    })
  },
  getBannerList: function () {
    var that = this;
    console.log('open_id='+app.globalData.openid)
    var open_id = app.globalData.openid;
    var data = {
      type:1
    }
    request.request_get('/activity/getBannerInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(res.msg);
            that.setData({
              movies:res.msg
            })
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  
  //轮播图的切换事件
  swiperChange: function(e) {
    //console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //点击图片触发事件 
  swipclick: function(e) {
    console.log(this.data.swiperCurrent);
    console.log(this.data.links);
    let open_way= this.data.movies[this.data.swiperCurrent].open_way
    let icon= this.data.movies[this.data.swiperCurrent].icon
    if(open_way==0){
      wx.navigateTo({
        url: icon
      })
    }else if(open_way==1){
      app.globalData.article = icon
      wx.navigateTo({
        url: '/pages/index/article?url='+icon
      })
    }else{
      app.globalData.article = icon
      wx.navigateTo({
        url: '/pages/index/article'
      })
    }
  },
  bindChooseMap:function(){
    wx.navigateTo({
      url: '/pages/chooseSamplingPointMap/index',
    })
  },

})
