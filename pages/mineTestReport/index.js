const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    overflowFlag: false,
    page: 1, //当前页数
    pageSize: 6, //每页六条

    tip: "",
    tip_temp: '暂无数据',
    flag1: true,
    flag2: false,

    isLogin: false, //是否登录
    isUserInfo: false, // 是否获取用户呢称
    policyChecked: false,
    user_id: '',
    userInfo: {},

    searchText: '',
    appointmentList: [],
    appointmentListPlus: [],
  },

  onShow: function () {
    this.setData({
      user_id: wx.getStorageSync('coyote_userinfo').user_id || '',
    });
    if (this.data.user_id) {
      this.setData({
        isLogin: false
      });
    } else {
      this.setData({
        isLogin: true
      });
    }
    this.getAppointmentList();
  },
  onLoad: function () {
    this.getbaseData();
  },
  toInfo: function (e) {
    // var that = this;
    // wx.navigateTo({
    //   url: '/pages/appointmentRecord/appointmentDetail?appointment_num=' + e.currentTarget.dataset.num + '&onlineFlagNum=' + e.currentTarget.dataset.onlineflagnum,
    // })
  },
  onReachBottom: function () {},
  getAppointmentList: function () {
    var that = this;
    var data = {
      user_id: that.data.user_id,
      name: that.data.searchText
    }
    request.request_get('/a/getMyTestReport.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            appointmentList: res.res
          });
          if (that.data.appointmentList.length == 0) {
            that.setData({
              tip: '该手机号下未查到报告，可点击搜索框右侧，用样本号或其他手机号查询试试~',
              overflowFlag: true
            });
          }
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
    // this.getAppointmentList();
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

      if (that.data.appointmentList.length == 0) {
        that.setData({
          tip: '该手机号下未查到报告，可点击搜索框右侧，用样本号或其他手机号查询试试~',
          overflowFlag: true
        });
      }
    } else {
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
          tip: '该手机号下未查到报告，可点击搜索框右侧，用样本号或其他手机号查询试试~',
          overflowFlag: true
        });
      }
      //}
    }
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    // this.setData({
    //   searchText: '',
    //   tip: '',
    //   overflowFlag: false
    // })
    // this.getAppointmentList();
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
    if (that.data.appointmentList.length == 0) {
      that.setData({
        tip: '该手机号下未查到报告，可点击搜索框右侧，用样本号或其他手机号查询试试~',
        overflowFlag: true
      });
    }
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
  /**
   * 
   */
  bindShowDialog() {
    this.setData({
      isLogin: false,
      policyChecked: false
    });
  },
  // 获取 code
  getCode(success){
    wx.login({
        success : _Code => {
          this.setData({
            rs_code : _Code.code
          });
          success();
        }
    })
  },
  getUserProfile() {
    this.getCode(() => {});
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.bindGetUserInfo(res);
      }
    })
  },
  // 授权用户信息
  bindGetUserInfo(e) {
    let that = this;
    const OK = "getUserProfile:ok"
    if (e.errMsg == OK) {

      // 判断 session_key 有无到期
      wx.checkSession({
        success: res => {
          that.USRE(e)
        },
        fail: res => {
          that.getCode(() => {
            that.USRE(e)
          })
        }
      })
    } else {
      this.setData({
        isLogin: false
      });
      //用户按了拒绝按钮
      // wx.showModal({
      //   title: '警告',
      //   content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
      //   showCancel: false,
      //   confirmText: '返回授权',
      //   success: function (res) {
      //     // 用户没有授权成功，不需要改变 isHide 的值
      //     if (res.confirm) {
      //       console.log('用户点击了“返回授权”');
      //     }
      //   }
      // });
    }
  },
  USRE(e) {
    let that = this;
    // wx.login({
    //   success: (res) => {
    //     var code = res.code;
    //     console.log('---->:', code)
        request.request_get('/a/getUseridAndUserInfo.hn', {
          code: this.data.rs_code,
          encryptedData: e.encryptedData,
          iv: e.iv,
        }, function (res) {
          //判断为空时的逻辑
          if (res) {
            if (res.success) {
              console.log("获取的用户信息---->:" + res);
              that.setData({
                isUserInfo: true,
                userInfo: {
                  openid: res.openid,
                  unionid: res.unionid,
                  user_id: res.userid,
                  avatarUrl: res.userInfo.userInfo.avatarUrl,
                  nickName: res.userInfo.userInfo.nickName,
                }
              });
            } else {
              box.showToast(res.msg);
            }
          } else {
            box.showToast("网络不稳定，请重试");
          }
        })
    //   },
    //   fail: (res) => {
    //     box.showToast("请求超时，请检查网络是否连接")
    //   }
    // })
  },
  // 授权手机号
  bindPhoneNumber(e) {
    console.log(e)
    // 用户同意授权
    const OK = 'getPhoneNumber:ok'
    if (e.detail.errMsg == OK) {
      // 判断 session_key 有无到期
      // wx.checkSession({
      //     success : res => {
      this.TEL(e)
      //     },
      //     fail: res => {
      //             this.TEL(e)
      //     }
      // })
    } else {
      let user_info = this.data.userInfo;
      user_info.phone_number = '';
      this.setData({
        userInfo: user_info,
        user_id: this.data.userInfo.user_id,
        isLogin: false,
        policyChecked: false
      });
      wx.setStorageSync('coyote_userinfo', user_info);
    }
  },
  TEL(e) {
    let that = this;
    let DATA = {
      user_id: this.data.userInfo.user_id,
      code: e.detail.code
    }
    request.request_get('/a/getPhoneNumber.hn', DATA, function (res) {
      //判断为空时的逻辑
      if (res) {
        if (res.success) {
          let user_info = that.data.userInfo;
          user_info.phone_number = res.phoneNumber;
          that.setData({
            phone_number: res.phoneNumber,
            userInfo: user_info,
            user_id: that.data.userInfo.user_id,
            isLogin: false,
            policyChecked: false
          });
          // 本地存储
          wx.setStorageSync('coyote_userinfo', user_info);

        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  changePolicy(e) {
    this.setData({
      policyChecked: !this.data.policyChecked
    })
  },
  bindUserProtocol(e) {
    let report_temp = e.currentTarget.dataset.fwxyurl;
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('用户服务协议不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/用户服务协议.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用
          console.log(Path);
          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
              console.log('打开用户服务协议成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('用户服务协议不存在，请联系客服')
        console.log(res); //失败
      }
    })
  },
  bindPrivacyPolicy(e) {
    let report_temp = e.currentTarget.dataset.yszzurl;
    if (report_temp == '' || report_temp == undefined || report_temp == null) {
      box.showToast('隐私政策不存在，请联系客服')
      return;
    }
    wx.downloadFile({
      url: report_temp, //要预览的PDF的地址
      filePath: wx.env.USER_DATA_PATH + '/隐私政策.pdf',
      success: function (res) {
        console.log(res);
        if (res.statusCode === 200) { //成功
          var Path = res.filePath //返回的文件临时地址，用于后面打开本地预览所用

          wx.openDocument({
            filePath: Path,
            showMenu: false,
            success: function (res) {
              console.log('打开用户服务协议成功');
            }
          })
        }
      },
      fail: function (res) {
        box.showToast('隐私政策不存在，请联系客服')
        console.log(res); //失败
      }
    })
  },
  getPhoneNumbers() {
    box.showToast("请阅读并勾选协议")
  },
  /**
   * 获取用户服务协议
   * 获取隐私政策
   */
  getbaseData: function () {
    let that = this;
    let data = {};
    request.request_get('/a/getbaseInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          let msg = res.msg;
          that.setData({
            fwxy_url: msg.fwxy_url,
            yszz_url: msg.yszz_url,
          })
        }
      }
    })
  },
})