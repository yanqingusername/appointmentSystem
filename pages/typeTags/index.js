const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    sample_id:'',
    name: '',
    phone: '',
    idcard: '',
    service_result:[],
    sampleid: "",
    user_id:""
  },
  onLoad: function (options) {
    
    this.setData({
      sampleid: options.sampleid,
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });

    this.getServiceRecordInfo();
    // let that = this;
    // if(this.data.service_result.length > 0){
    //   var query = wx.createSelectorQuery() 
    //   query.select('#schedule').boundingClientRect() 
    //   query.exec((ress) => { 
    //     that.setData({ 
    //       H: ress[0].height 
    //     });
    //   });
    // }

  },
  getServiceRecordInfo: function () {
    var that = this;
    var data = {
      sample_id: this.data.sampleid,
      user_id: this.data.user_id,
    }
    request.request_get('/a1/getTypeTags.hn', data, function (res) {
      if (res) {
        console.log('---->:',res)
        if (res.success) {
          let userinfo = res.res;
          var service_result = res.service_result;
          that.setData({
            sample_id: userinfo[0].sample_id,
            name: userinfo[0].name,
            phone: userinfo[0].phone,
            idcard: userinfo[0].idcard,
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