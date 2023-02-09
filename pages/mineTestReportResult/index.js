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
    isreport: 1, // 1--样本编号/手机号查询   2--手机号查询  3--广州核酸检测报告查询
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

    if(this.data.isreport == 3){
      //广州核酸检测报告查询 2.1.4.2
      this.getSelectJinShaZhouReportQuery();
      
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2];
      prevPage.setData({
        isReport: true
      });
    }else if(this.data.isreport == 1){
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
    request.request_get('/Newacid/getSelectTestRecordsBySampleId.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            appointmentList: res.res
          });
          if (that.data.appointmentList.length == 0) {
            that.setData({
              tip: '该受检人手机号下未查到样本编号的信息',
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
    request.request_get('/Newacid/getSelectTestRecordsByPhone.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            appointmentList: res.res
          });
          if (that.data.appointmentList.length == 0) {
            that.setData({
              tip: '该受检人手机号下未查到样本编号的信息',
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
    let that = this
    var report_temp = e.currentTarget.dataset.report;
    var sample_id = e.currentTarget.dataset.sampleid;

    var id = e.currentTarget.dataset.id;

    box.showLoading("加载中...");

    if (report_temp == '' || report_temp == undefined || report_temp == null) {

      if(that.data.isreport == 3){
        if(id){
          that.getRequestExcelFilePath(id);
        }
      } else{
        if(sample_id){
          that.getBatchConfirmation(sample_id);
        }
      }
      
      // box.showToast('报告不存在，请联系客服')
      // return;
    }else{
      // box.showLoading("加载中...");
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
              },
              complete:function(){
                box.hideLoading();
              }
            })
          } else {
            // box.hideLoading();

            if(that.data.isreport == 3){
                that.getRequestExcelFilePath(id);
            } else{
                that.getBatchConfirmation(sample_id);
            }
          }
        },
        fail: function (res) {
          // box.showToast('报告不存在，请联系客服')
          console.log(res); //失败
          // box.hideLoading();

          if(that.data.isreport == 3){
            if(id){
              that.getRequestExcelFilePath(id);
            }
          } else{
            if(sample_id){
              that.getBatchConfirmation(sample_id);
            }
          }
        }
      })
    }
  },
  getSelectJinShaZhouReportQuery: function () {
    var that = this;
    var data = {
      idCard:  that.data.snumber, //证件号
      phone: that.data.sphone, //手机号
    }
    request.request_get('/Newacid/JinShaZhouReportQuery.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            appointmentList: res.res
          });
          if (that.data.appointmentList.length == 0) {
            that.setData({
              tip: '该用户暂时还没有报告，请稍后再查询',
              overflowFlag: true
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
    /**
   * 获取用户报告
   */
    getBatchConfirmation: function (sample_id) {
      let that = this;
      let data = {
        sampleId: sample_id
      };
      request.request_get('/Newacid/batchConfirmation.hn', data, function (res) {
        if (res) {
          if (res.success) {
            let report_temp = res.pdf
            report_temp = report_temp.replace('http://', 'https://');

            // box.showLoading("加载中...");

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
                    },
                    complete:function(){
                      box.hideLoading();
                    }
                  })
                }else{
                  box.hideLoading();
                }
              },
              fail: function (res) {
                // box.hideLoading();
                // box.showToast('报告不存在，请联系客服')
                console.log(res); //失败
                that.getBatchConfirmation(sample_id);
              }
            })
          } else {
            box.hideLoading();

            box.showToast(res.msg)
          }
        }
      })
    },
    /**
   *  金沙洲获取用户报告
   * https://cloud.coyotebio-lab.com/Jinshazhou/api/requestExcelFilePath.hn?id=14198900
   */
     getRequestExcelFilePath: function (id) {
      let that = this;
      let data = {
        id: id
      };
      request.request_getJinshazhou('/requestExcelFilePath.hn', data, function (res) {
        if (res) {
          if (res.success) {
            let report_temp = res.reportUrl
            report_temp = report_temp.replace('http://', 'https://');
            
            // box.showLoading("加载中...");

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
                    },
                    complete:function(){
                      box.hideLoading();
                    }
                  })
                }else{
                  box.hideLoading();
                }
              },
              fail: function (res) {
                // box.hideLoading();
                // box.showToast('报告不存在，请联系客服')
                console.log(res); //失败
                that.getRequestExcelFilePath(id);
              }
            })
          } else {
            box.hideLoading();

            box.showToast(res.msg)
          }
        }
      })
    },
})