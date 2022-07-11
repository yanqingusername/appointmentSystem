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
    city: '北京市',
    type_name: "部分地区中、高风险",
    source_type: "数据来源为中国政府网及国务院客户端，最新更新时间5月31日12时",
    policyList:[
      {
        id:'1',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      },
      {
        id:'2',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      },
      {
        id:'3',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      },
      {
        id:'4',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      },
      {
        id:'5',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      },
      {
        id:'6',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      },
      {
        id:'7',
        title: '出京政策',
        time: "5月31日12时",
        content: '列表中展示时，空格代替原文的回车。 1 鉴于当前北京疫情形势，为防止疫情外溢扩散，首都严格进京管理xxx政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措施文字政策措古古怪怪是否法师打发是短发阿斯顿发生对方'
      }
    ]
  },

  onShow: function () {
    // this.getAppointmentList();
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