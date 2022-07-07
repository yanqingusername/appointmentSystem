// pages/myOrder/myOrder.js
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
    movies: [],
  },

  onShow: function () {
    var that = this;
    that.getBannerList();
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
  bindDetail: function (e) {
    var circulation_num = e.currentTarget.dataset.id;
    console.log("circulation_num=" + circulation_num)
    wx.navigateTo({
      url: 'goodsDetail?circulation_num=' + circulation_num,
    })
  },
  onReachBottom: function () {
    console.log('成功下拉+++++++++++')
    var that = this;
    // that.getcirculationList();
  },

  //跳转专用tabSelect
  jumpTabSelect(e) {
    var that = this;
    if (e == 1) { //跳转至已接单
      this.setData({
        TabCur: 0,
        status: 1,
        page: 1,
        circulationList: [],
        tip: ''
      })
      //清除跳转标识缓存
      wx.removeStorage({
        key: 'jumpStatus',
        success(res) {
          console.log(res)
        }
      })
      that.getcirculationList();
    } else if (e == 2) { //跳转至已完成
      this.setData({
        TabCur: 1,
        status: 2,
        page: 1,
        circulationList: [],
        tip: ''
      })
      //清除跳转标识缓存
      wx.removeStorage({
        key: 'jumpStatus',
        success(res) {
          console.log(res)
        }
      })
      that.getcirculationList();
    }
  },

  tabSelect(e) {
    var status = e.currentTarget.dataset.id;
    console.log("tabSelect " + status)
    var that = this;

    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      status: status,
      page: 1,
      circulationList: [],
      tip: '',
      alreadyChecked: false
    })
    that.getCirculationList();
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
          for (var i = 0; i < appointmentList.length; i++) {
            if (appointmentList[i].use_status == 1) {
              appointmentList[i].status = '待采样'
            } else if (appointmentList[i].use_status == 2) {
              appointmentList[i].status = '待检测'
            } else if (appointmentList[i].use_status == 3) {
              appointmentList[i].status = '检测中'
            } else if (appointmentList[i].use_status == 4) {
              appointmentList[i].status = '已报告'
            } else if (appointmentList[i].use_status == 5) {
              appointmentList[i].status = '退款中'
            } else if (appointmentList[i].use_status == 7) {
              appointmentList[i].status = '退款成功'
            }
            var appointmentTime = appointmentList[i].create_time.replace("-", "/");
            appointmentTime = new Date(Date.parse(appointmentTime));
            var customTime = new Date(Date.parse('2022/01/12 06:17:49'));
            if (appointmentTime < customTime) {
              appointmentList[i].refundTimeFlag = false

            }

          }
          that.setData({
            appointmentList: appointmentList
          })
          // if(circulationList.length == 0 && that.data.page == 1 ){
          //   that.setData({
          //     tip:"暂无数据",
          //     alreadyChecked:true,
          // 		alreadyChecked_temp:true
          // 	})
          // }else if(circulationList.length < that.data.pageSize){
          // 	that.setData({
          // 		hasMoreData:false,
          //     page: that.data.page + 1,
          //     tip:"没有更多数据了",
          //     alreadyChecked:true,
          // 		alreadyChecked_temp:false
          // 	})
          // }else{
          // 	that.setData({
          // 		hasMoreData:true,
          //     page: that.data.page + 1,
          //     tip:"加载中",
          //     alreadyChecked:true,
          // 		alreadyChecked_temp:false
          // 	})
          // }

          // circulationList = circulationListTemp.concat(circulationList);
          // circulationList.sort(function(a, b) {
          // 	return b.time < a.time ? 1 : -1 //正序
          // })
          // that.setData({
          //   circulationList: circulationList
          // });
          // console.log(that.data.circulationList)
          // console.log(circulationList)
          // console.log(circulationList.length)
          // console.log(that.data.existData)
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  bpa: function () {
    wx.navigateTo({
      url: '/activities/pages/activities/index?type=3',
    })
  },
  bindCancel: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认撤销？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var data = {
            circulation_num: e.currentTarget.dataset.id,
          }
          request.request_get('/stockout/cancelCirculation.hn', data, function (res) {
            console.info('cancelCirculation回调', res)
            if (res) {
              if (res.success) {
                wx.showToast({
                  title: '撤销成功',
                })
                that.getCirculationList();
              } else {
                box.showToast(res.msg);
              }
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
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
  //选中采样点并返回
  bindCheckSamplingPoint: function (e) {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      replaced_SN: e.currentTarget.dataset.sn
    })
    wx.navigateBack({
      delta: 1,
    })
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


  bindInvoice: function () {
    wx.navigateTo({
      url: '/pages/invoice/invoice',
    })
  },
  bindRefund: function (e) {
    let paytype = e.currentTarget.dataset.paytype;
    if(paytype == 5 || paytype == 6){
      wx.showModal({
        title: '温馨提示',
        content: "申请退款请到购买处退款",
        showCancel: false,
        success(res) {
          if (res.confirm) {
            console.log('用户点击了确定')
          }
        }
      })
    }else{
      var that = this;
      console.log(e.currentTarget.dataset.appointmentnum)
      wx.showModal({
        title: '确认退款吗？',
        content: '退款后如若需要新冠核酸检测，需重新预约',
        showCancel: true, //是否显示取消按钮
        success: function (res) {
          if (res.cancel) {

          } else {
            request.request_get('/coyoteRefund/refund.hn', {
              appointment_num: e.currentTarget.dataset.appointmentnum,
            }, function (res) {
              console.info('回调', res)
              if (res) {
                if (res.success) {
                  var info = res.msg;
                  that.getAppointmentList();
                  box.showToast('退款申请成功');
                } else {
                  box.showToast(res.msg);
                }
              } else {
                box.showToast("网络不稳定，请重试");
              }
            })

          }
        },
        fail: function (res) {},
      })
    }
  },
  getBannerList: function () {
    var that = this;
    console.log('open_id=' + app.globalData.openid)
    //var open_id = app.globalData.openid;
    var data = {
      type: 3
    }
    request.request_get('/activity/getBannerInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(res.msg);
          that.setData({
            movies: res.msg
          })
        } else {
          //box.showToast(res.msg);
        }
      }
    })
  },
  //轮播图的切换事件
  swiperChange: function (e) {
    console.log(e)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  //点击图片触发事件 
  swipclick: function (e) {
    console.log(this.data.swiperCurrent);
    console.log(this.data.links);
    let open_way = this.data.movies[this.data.swiperCurrent].open_way
    let icon = this.data.movies[this.data.swiperCurrent].icon
    if (open_way == 0) {
      wx.navigateTo({
        url: icon
      })
    } else if (open_way == 1) {
      wx.navigateTo({
        url: '/pages/index/article?url=' + icon
      })
    } else {
      app.globalData.article = icon
      wx.navigateTo({
        url: '/pages/index/article'
      })
    }
  },
  bindTypetags(){
    wx.navigateTo({
      url: "/pages/typeTags/index"
    })
  }
})