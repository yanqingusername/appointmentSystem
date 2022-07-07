const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fix_channel_id: -1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false,
        userInfo: e.detail.userInfo
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  onShow: function(){
   
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
  bindChooseMap:function(){
    wx.navigateTo({
      url: '/pages/chooseSamplingPointMap/index',
    })
  },
  bindTestReport:function(){
    wx.navigateTo({
      url: "/pages/mineTestReport/index"
    })
  },
  bindEpidemicPreventionPolicy:function(){
    wx.navigateTo({
      url: "/pages/epidemicPreventionPolicy/index"
    })
  },
  bindXinguanSelfInspection:function(){
    wx.navigateTo({
      url: "/pages/xinguanSelfInspection/index"
    })
  },
  bindNoticeClick(e){
    let index = e.currentTarget.dataset.index;
    console.log('---->:',index)
  }
})