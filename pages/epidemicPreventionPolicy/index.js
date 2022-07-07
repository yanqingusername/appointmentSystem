const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    circulationList: [],
    setInter: '',
    overflowFlag: false,
    support_id: "",
    appointmentList: [],
    appointmentListPlus: [],
    TabCur: 0,
    status: 0,
    statusList: ['调拨出库', '领用出库'],
    circulationListTemp: [],
    page: 1, //当前页数
    pageSize: 6, //每页六条
    hasMoreData: true,
    alreadyChecked: false,
    tip: "",
    tip_temp: '暂无数据',
    flag1: true,
    flag2: false,
    swiperCurrent: 0,
  },

  onShow: function () {
    var that = this;
    //获取全局openid，如果获取不到，则重新授权一次
    let openid = app.globalData.openid;
    console.log(openid);
    if (openid == '' || typeof (openid) == 'undefined') {
      wx.login({
        success: (res) => {
          var code = res.code;
          console.log("获取code成功" + code);
          request.request_get('/a/getOpenid.hn', {
            code: code
          }, function (res) {
            console.info('回调', res);
            //判断为空时的逻辑
            if (!res) {
              box.showToast("网络不稳定，请重试");
              return;
            }
            if (!res.success) {
              box.showToast(res.msg);
              return;
            }
            app.globalData.openid = res.msg;
            console.log("获取的用户openid" + app.globalData.openid);
            that.getAppointmentList();
          })
        },
        fail: () => {
          box.showToast("请求超时，请检查网络是否连接")
        }
      })
    } else {
      that.getAppointmentList();
    }
  },
  onLoad: function () {
    // var that = this;
    //  that.getAppointmentList();
  },
  toInfo: function (e) {
    let id = e.currentTarget.dataset.id; 
    wx.navigateTo({
      url: '/pages/epidemicPreventionPolicyDetail/index?id='+id
    })
  },
  onReachBottom: function () {
    console.log('成功下拉+++++++++++')
    var that = this;
    // that.getcirculationList();
  },
  getAppointmentList: function () {
    var that = this;
    console.log('当前页数=' + that.data.page)
    console.log('circulationList=' + that.data.circulationList)
    console.log('hasMoreData=' + that.data.hasMoreData)
    console.log('open_id=' + app.globalData.openid)
    var open_id = app.globalData.openid;
    var data = {
      open_id: open_id
    }
    request.request_get('/a/getTestRecords.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(res.msg);
          var appointmentList = res.msg;
          that.setData({
            appointmentList: appointmentList
          })
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
})