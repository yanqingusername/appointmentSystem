const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:''
  },

  onShow: function () {
    
  },
  onLoad: function (options) {
    this.setData({
      id: options.id
    });
  },
  phoneCall: function (e) {
    var that = this;
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: '010-12345',
      success: function () {
        console.log("成功拨打电话")
      },
    })
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