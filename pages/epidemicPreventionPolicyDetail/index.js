const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:'',
    policyTitle: "政策标题",
    policyType: '部分地区中、高风险',
    policyContent: '本内容为该地区于5月31日12时报送，建议出行前先拨打当地电话咨询',
    policyText: '这里为政策的全文：',
    policyList: [
      {
        content: '1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字。'
      },
      {
        content: '1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字。'
      },
      {
        content: '1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字。'
      }
    ],
    policyCity: '北京市',
    policyPhone: '010-12345',
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
      phoneNumber: this.data.policyPhone,
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