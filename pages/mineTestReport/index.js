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
    var that = this;
    wx.navigateTo({
      url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + e.currentTarget.dataset.num + '&onlineFlagNum=' + e.currentTarget.dataset.onlineflagnum,
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
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    this.setData({
      searchText: e.detail.value
    })
    console.log("input-----" + e.detail.value)
    var value = e.detail.value;
    var that = this;
    var appointmentList = that.data.appointmentList;
    var appointmentListPlus = that.data.appointmentListPlus
    if (value == '' || value == null) {
      that.setData({
        flag1: true,
        flag2: false,
        tip: '',
        overflowFlag: false
      })
    } else {
      //  if (e.detail.cursor) { //e.detail.cursor表示input值当前焦点所在的位置
      var that = this;
      that.setData({
        flag1: false,
        flag2: true,
        tip: '',
        overflowFlag: false
      })
      var arr = [];
      for (var i = 0; i < appointmentList.length; i++) {
        if (appointmentList[i].name.indexOf(value) >= 0) {
          appointmentList[i].checked = false;
          arr.push(appointmentList[i]);
        }
      }
      console.log(arr);
      that.setData({
        appointmentListPlus: arr
      });
      if (that.data.appointmentListPlus.length == 0) {
        that.setData({
          tip: '没有搜索到该受检者',
          overflowFlag: true
          //  flagCheck: true
        });
      }
      //}
    }
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    console.log('hereeeeee')
    this.setData({
      searchText: '',
      tip: '',
      overflowFlag: false
    })
    var that = this;
    that.setData({
      flag1: true, //显示原始列表
      flag2: false //关闭查询列表
    })
    // that.getCompanyList();
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
  catchSelectHandle: function (e) {
    wx.navigateTo({
      url: "/pages/mineTestReportSelect/index"
    });
  },
})