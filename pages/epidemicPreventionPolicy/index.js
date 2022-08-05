const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appointmentList: [],
    page: 1, //当前页数
    pageSize: 6, //每页六条
    tip: "",
    tip_temp: '暂无数据',
    city: '',
    type_name: "",
    source_type: "",
    policyList:[]
  },

  onShow: function () {
    this.getAppointmentList();
  },
  onLoad: function () {
    
  },
  toInfo: function (e) {
    let id = e.currentTarget.dataset.id; 
    wx.navigateTo({
      url: '/pages/epidemicPreventionPolicyDetail/index?id='+id
    })
  },
  onReachBottom: function () {
    
  },
  getAppointmentList: function () {
    var that = this;
   
    var data = {}
    request.request_get('/a/getPreventionPolicyList.hn', data, function (res) {
      if (res) {
        if (res.code == 0) {
          that.setData({
            policyList: res.data,
            city: res.city,
            source_type: res.source_type,
            type_name: res.type_name,
          });
        } else {
          box.showToast(res.msg);
        }
      }
    });
  },
})