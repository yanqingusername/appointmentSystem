const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    overflowFlag: false,
    tip: "",
    isreport: 1, // 1--样本编号/手机号查询   2--手机号查询
    snumber: '',
    sphone: '',
    appointmentList: []
  },

  onShow: function () {
    
  },
  onLoad: function (options) {
    let isreport = options.isreport;
    let snumber = options.snumber;
    let sphone = options.sphone;

    this.setData({
      isreport: isreport,
      snumber: snumber,
      sphone: sphone
    });

    if(this.data.isreport == 1){
      this.getSelectTestRecordsBySampleId();
    }else{
      this.getSelectTestRecordsByPhone();
    }

  },
  toInfo: function (e) {
    // var that = this;
    // wx.navigateTo({
    //   url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + e.currentTarget.dataset.num + '&onlineFlagNum=' + e.currentTarget.dataset.onlineflagnum,
    // })
  },
  onReachBottom: function () {
    
  },
  getSelectTestRecordsBySampleId: function () {
    var that = this;
    var data = {
      sample_id:  that.data.snumber, //样本编号
      sample_number: that.data.sphone, //手机号
    }
    request.request_get('/a/getSelectTestRecordsBySampleId.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            appointmentList: res.res
          });
          if (that.data.appointmentList.length == 0) {
            that.setData({
              tip: '暂无报告',
              overflowFlag: true
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  getSelectTestRecordsByPhone: function () {
    var that = this;
    var data = {
      sample_number: that.data.sphone, //手机号
    }
    request.request_get('/a/getSelectTestRecordsByPhone.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            appointmentList: res.res
          });
          if (that.data.appointmentList.length == 0) {
            that.setData({
              tip: '暂无报告',
              overflowFlag: true
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  bindDownloadReport: function (e) {
    var report_temp = e.currentTarget.dataset.report
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('报告不存在，请联系客服')
      return;
    }
    report_temp = report_temp.replace('http://', 'https://');
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/卡尤迪核酸检测报告.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          wx.openDocument({
            filePath: Path,
            showMenu: true,
            //要打开的文件路径
            success: function (res) {
              console.log('打开PDF成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('报告不存在，请联系客服')
        console.log(res); //失败
      }
    })
  },
})