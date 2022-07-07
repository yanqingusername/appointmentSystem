const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    service_result:[
      {
        time:'08:49',
        date:'6月1日',
        title:'出具报告',
        type: 1,
        text: '点击查看',
        pdf_url: ''
      },
      {
        time:'07:00',
        date:'6月1日',
        title:'开始检测',
        type: 2,
        text: '',
        pdf_url: ''
      },
      {
        time:'06:59',
        date:'6月1日',
        title:'样本处理',
        type: 3,
        text: '',
        pdf_url: ''
      },
      {
        time:'23:21',
        date:'5月31日',
        title:'送达实验室',
        type: 4,
        text: '下一步，样本处理',
        pdf_url: ''
      },
      {
        time:'21:03',
        date:'5月31日',
        title:'转运中',
        type: 5,
        text: '',
        pdf_url: ''
      },
      {
        time:'20:32',
        date:'5月31日',
        title:'完成采样',
        type: 6,
        text: '',
        pdf_url: ''
      }
    ]
  },
  onLoad: function (options) {
    

    // this.getServiceRecordInfo();
    let that = this;
    if(this.data.service_result.length > 0){
      var query = wx.createSelectorQuery() 
      query.select('#schedule').boundingClientRect() 
      query.exec((ress) => { 
        that.setData({ 
          H: ress[0].height 
        });
      });
    }

  },
  getServiceRecordInfo: function () {
    var that = this;
    var data = {
      "instrument_SN": this.data.instrumentsn
    }
    request.request_new('/instrument/supprot/getInstrumentServiceRecordInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          var service_result = res.service_result;
          that.setData({
            service_result: service_result
          });
          if(service_result.length > 0){
            var query = wx.createSelectorQuery() 
            query.select('#schedule').boundingClientRect() 
            query.exec((ress) => { 
              that.setData({ 
                H: ress[0].height 
              });
            });
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindDownloadReport: function (e) {
    var report_temp = e.currentTarget.dataset.report;
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